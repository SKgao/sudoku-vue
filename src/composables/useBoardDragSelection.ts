import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import toolkit from '@/utils/toolkit'

interface CellPosition {
  rowIndex: number
  colIndex: number
}

interface DragSelection {
  start: CellPosition
  end: CellPosition
  visitedCells: CellPosition[]
}

interface UseBoardDragSelectionOptions {
  // 棋盘单元格通过 data 属性暴露坐标信息，这里保留选择器配置，方便后续替换渲染结构。
  boardCellSelector?: string
  // 用长按把拖拽框选和普通点击区分开，避免两种交互互相打架。
  longPressDelay?: number
  outlineColor?: string
  // 页面层可以在进入拖拽模式时做联动，但不用自己管理拖拽状态机。
  onLongPressStart?: () => void
}

const {
  boxToolkit: { convertToBoxIndex }
} = toolkit

const buildCellKey = (rowIndex: number, colIndex: number) => `${rowIndex}:${colIndex}`

const parseCellKey = (cellKey: string): CellPosition => {
  const [rowIndex, colIndex] = cellKey.split(':').map(Number)
  return { rowIndex, colIndex }
}

// 触屏设备没有稳定的 hover/enter，因此要根据指针坐标反查当前落在哪个格子上。
const getCellPositionFromPoint = (
  clientX: number,
  clientY: number,
  boardCellSelector: string
): CellPosition | null => {
  const target = document.elementFromPoint(clientX, clientY)

  if (!(target instanceof HTMLElement)) {
    return null
  }

  const cell = target.closest(boardCellSelector)

  if (!(cell instanceof HTMLElement)) {
    return null
  }

  const rowIndex = Number(cell.dataset.rowIndex)
  const colIndex = Number(cell.dataset.colIndex)

  if (Number.isNaN(rowIndex) || Number.isNaN(colIndex)) {
    return null
  }

  return { rowIndex, colIndex }
}

// 宫内拖拽时，把用户经过的轨迹视为边界，并补齐这条边界在 3x3 宫内围出来的封闭区域。
const getFilledBoxCells = (visitedCells: CellPosition[], boxIndex: number) => {
  const filledCells = new Set(visitedCells.map(({ rowIndex, colIndex }) => buildCellKey(rowIndex, colIndex)))
  const startRowIndex = Math.floor(boxIndex / 3) * 3
  const startColIndex = (boxIndex % 3) * 3
  const reachableCells = new Set<string>()
  const queue: string[] = []

  for (let rowIndex = startRowIndex; rowIndex < startRowIndex + 3; rowIndex += 1) {
    for (let colIndex = startColIndex; colIndex < startColIndex + 3; colIndex += 1) {
      const isBoundaryCell =
        rowIndex === startRowIndex ||
        rowIndex === startRowIndex + 2 ||
        colIndex === startColIndex ||
        colIndex === startColIndex + 2
      const cellKey = buildCellKey(rowIndex, colIndex)

      if (!isBoundaryCell || filledCells.has(cellKey) || reachableCells.has(cellKey)) {
        continue
      }

      reachableCells.add(cellKey)
      queue.push(cellKey)
    }
  }

  while (queue.length) {
    const currentCellKey = queue.shift()

    if (!currentCellKey) {
      continue
    }

    const { rowIndex, colIndex } = parseCellKey(currentCellKey)
    const neighbors = [
      { rowIndex: rowIndex - 1, colIndex },
      { rowIndex: rowIndex + 1, colIndex },
      { rowIndex, colIndex: colIndex - 1 },
      { rowIndex, colIndex: colIndex + 1 }
    ]

    for (const neighbor of neighbors) {
      const withinBox =
        neighbor.rowIndex >= startRowIndex &&
        neighbor.rowIndex < startRowIndex + 3 &&
        neighbor.colIndex >= startColIndex &&
        neighbor.colIndex < startColIndex + 3

      if (!withinBox) {
        continue
      }

      const neighborKey = buildCellKey(neighbor.rowIndex, neighbor.colIndex)

      if (filledCells.has(neighborKey) || reachableCells.has(neighborKey)) {
        continue
      }

      reachableCells.add(neighborKey)
      queue.push(neighborKey)
    }
  }

  for (let rowIndex = startRowIndex; rowIndex < startRowIndex + 3; rowIndex += 1) {
    for (let colIndex = startColIndex; colIndex < startColIndex + 3; colIndex += 1) {
      const cellKey = buildCellKey(rowIndex, colIndex)

      if (!reachableCells.has(cellKey)) {
        filledCells.add(cellKey)
      }
    }
  }

  return filledCells
}

// 指针移动过快时可能会直接跳过中间格子，这里把轨迹中遗漏的格子补出来，保证路径连续。
const getInterpolatedCells = (startCell: CellPosition, endCell: CellPosition) => {
  const cells: CellPosition[] = []
  let currentRowIndex = startCell.rowIndex
  let currentColIndex = startCell.colIndex

  while (currentRowIndex !== endCell.rowIndex || currentColIndex !== endCell.colIndex) {
    const rowDistance = endCell.rowIndex - currentRowIndex
    const colDistance = endCell.colIndex - currentColIndex

    if (Math.abs(rowDistance) >= Math.abs(colDistance) && rowDistance !== 0) {
      currentRowIndex += Math.sign(rowDistance)
    }
    else if (colDistance !== 0) {
      currentColIndex += Math.sign(colDistance)
    }

    cells.push({
      rowIndex: currentRowIndex,
      colIndex: currentColIndex
    })
  }

  return cells
}

export const useBoardDragSelection = (options: UseBoardDragSelectionOptions = {}) => {
  const {
    boardCellSelector = '[data-board-cell="true"]',
    longPressDelay = 180,
    outlineColor = '#315b79',
    onLongPressStart
  } = options

  const pressTimer = ref<number | null>(null)
  const activePointerId = ref<number | null>(null)
  const pressedCell = ref<CellPosition | null>(null)
  const isPointerDown = ref(false)
  const isLongPressDragging = ref(false)
  const suppressClick = ref(false)
  const dragSelection = ref<DragSelection | null>(null)

  const clearPressTimer = () => {
    if (pressTimer.value !== null) {
      window.clearTimeout(pressTimer.value)
      pressTimer.value = null
    }
  }

  const dragRegion = computed(() => {
    if (!dragSelection.value) {
      return null
    }

    const { visitedCells } = dragSelection.value
    const rowIndexes = new Set(visitedCells.map(({ rowIndex }) => rowIndex))
    const colIndexes = new Set(visitedCells.map(({ colIndex }) => colIndex))
    const boxIndexes = new Set(
      visitedCells.map(({ rowIndex, colIndex }) => convertToBoxIndex(rowIndex, colIndex).boxIndex)
    )

    // 如果轨迹始终落在同一行，就按这一行的小列到最大列补成完整连最续区间。
    if (rowIndexes.size === 1) {
      const [rowIndex] = [...rowIndexes]
      const minColIndex = Math.min(...visitedCells.map(({ colIndex }) => colIndex))
      const maxColIndex = Math.max(...visitedCells.map(({ colIndex }) => colIndex))

      return {
        cells: new Set(
          Array.from({ length: maxColIndex - minColIndex + 1 }, (_, offset) =>
            buildCellKey(rowIndex, minColIndex + offset)
          )
        )
      }
    }

    // 如果轨迹始终落在同一列，就按这一列的最小行到最大行补成完整连续区间。
    if (colIndexes.size === 1) {
      const [colIndex] = [...colIndexes]
      const minRowIndex = Math.min(...visitedCells.map(({ rowIndex }) => rowIndex))
      const maxRowIndex = Math.max(...visitedCells.map(({ rowIndex }) => rowIndex))

      return {
        cells: new Set(
          Array.from({ length: maxRowIndex - minRowIndex + 1 }, (_, offset) =>
            buildCellKey(minRowIndex + offset, colIndex)
          )
        )
      }
    }

    // 只要轨迹同时跨行又跨列，就必须保整条路径都在同一个宫内，否则证不视为有效框选。
    if (boxIndexes.size !== 1) {
      return null
    }

    const [boxIndex] = [...boxIndexes]

    return {
      cells: getFilledBoxCells(visitedCells, boxIndex)
    }
  })

  const getDragBoxShadow = (rowIndex: number, colIndex: number) => {
    if (!dragRegion.value?.cells.has(buildCellKey(rowIndex, colIndex))) {
      return undefined
    }

    const shadows: string[] = []

    if (!dragRegion.value.cells.has(buildCellKey(rowIndex - 1, colIndex))) {
      shadows.push(`inset 0 3px 0 0 ${outlineColor}`)
    }

    if (!dragRegion.value.cells.has(buildCellKey(rowIndex + 1, colIndex))) {
      shadows.push(`inset 0 -3px 0 0 ${outlineColor}`)
    }

    if (!dragRegion.value.cells.has(buildCellKey(rowIndex, colIndex - 1))) {
      shadows.push(`inset 3px 0 0 0 ${outlineColor}`)
    }

    if (!dragRegion.value.cells.has(buildCellKey(rowIndex, colIndex + 1))) {
      shadows.push(`inset -3px 0 0 0 ${outlineColor}`)
    }

    return shadows.length ? shadows.join(', ') : undefined
  }

  const clearDragSelection = () => {
    dragSelection.value = null
  }

  // 长按进入拖拽后，松手时浏览器仍可能补发 click，这里统一拦掉那次点击。
  const consumeSuppressedClick = () => {
    if (!suppressClick.value) {
      return false
    }

    suppressClick.value = false
    return true
  }

  const extendDragSelection = (cellPosition: CellPosition) => {
    if (!dragSelection.value) {
      return
    }

    const lastVisitedCell = dragSelection.value.visitedCells[dragSelection.value.visitedCells.length - 1]
    const nextCells = lastVisitedCell ? getInterpolatedCells(lastVisitedCell, cellPosition) : [cellPosition]
    const visitedCellKeys = new Set(
      dragSelection.value.visitedCells.map(({ rowIndex, colIndex }) => buildCellKey(rowIndex, colIndex))
    )
    const mergedVisitedCells = [...dragSelection.value.visitedCells]

    // 把插值补出的格子并入轨迹，避免加粗边框因为采样跳格而断开。
    for (const nextCell of nextCells) {
      const cellKey = buildCellKey(nextCell.rowIndex, nextCell.colIndex)

      if (visitedCellKeys.has(cellKey)) {
        continue
      }

      visitedCellKeys.add(cellKey)
      mergedVisitedCells.push(nextCell)
    }

    dragSelection.value = {
      start: dragSelection.value.start,
      end: cellPosition,
      visitedCells: mergedVisitedCells
    }
  }

  const handleCellPointerDown = (rowIndex: number, colIndex: number, event: PointerEvent) => {
    if (event.button !== 0) {
      return
    }

    event.preventDefault()
    clearPressTimer()
    activePointerId.value = event.pointerId
    isPointerDown.value = true
    isLongPressDragging.value = false
    suppressClick.value = false
    pressedCell.value = { rowIndex, colIndex }
    dragSelection.value = null

    pressTimer.value = window.setTimeout(() => {
      if (!isPointerDown.value || !pressedCell.value) {
        return
      }

      // 只有超过长按阈值才正式进入拖拽态，普通点按仍然走原来的选格逻辑。
      isLongPressDragging.value = true
      suppressClick.value = true
      dragSelection.value = {
        start: { ...pressedCell.value },
        end: { ...pressedCell.value },
        visitedCells: [{ ...pressedCell.value }]
      }
      onLongPressStart?.()
    }, longPressDelay)
  }

  const handleCellPointerEnter = (rowIndex: number, colIndex: number) => {
    if (!isPointerDown.value || !isLongPressDragging.value || !dragSelection.value) {
      return
    }

    extendDragSelection({ rowIndex, colIndex })
  }

  const handlePointerMove = (event: PointerEvent) => {
    if (
      !isPointerDown.value ||
      !isLongPressDragging.value ||
      !dragSelection.value ||
      activePointerId.value !== event.pointerId
    ) {
      return
    }

    const cellPosition = getCellPositionFromPoint(event.clientX, event.clientY, boardCellSelector)

    if (!cellPosition) {
      return
    }

    extendDragSelection(cellPosition)
  }

  const handlePointerFinish = () => {
    clearPressTimer()
    activePointerId.value = null
    isPointerDown.value = false
    pressedCell.value = null
    isLongPressDragging.value = false
  }

  onMounted(() => {
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerFinish)
    window.addEventListener('pointercancel', handlePointerFinish)
  })

  onBeforeUnmount(() => {
    clearPressTimer()
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('pointerup', handlePointerFinish)
    window.removeEventListener('pointercancel', handlePointerFinish)
  })

  return {
    clearDragSelection,
    consumeSuppressedClick,
    getDragBoxShadow,
    handleCellPointerDown,
    handleCellPointerEnter
  }
}
