import { computed, ref } from 'vue'
import toolkit from '@/utils/toolkit'

interface CellPosition {
  rowIndex: number
  colIndex: number
}

interface BoardRect {
  left: number
  top: number
  width: number
}

interface DragSelection {
  start: CellPosition
  end: CellPosition
  visitedCells: CellPosition[]
}

interface UseBoardDragSelectionOptions {
  longPressDelay?: number
  outlineColor?: string
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
    longPressDelay = 180,
    outlineColor = '#315b79',
    onLongPressStart
  } = options

  const pressTimer = ref<ReturnType<typeof setTimeout> | null>(null)
  const pressedCell = ref<CellPosition | null>(null)
  const boardRect = ref<BoardRect | null>(null)
  const isTouching = ref(false)
  const isLongPressDragging = ref(false)
  const suppressTap = ref(false)
  const dragSelection = ref<DragSelection | null>(null)

  const clearPressTimer = () => {
    if (pressTimer.value) {
      clearTimeout(pressTimer.value)
      pressTimer.value = null
    }
  }

  const clearDragSelection = () => {
    dragSelection.value = null
  }

  const consumeSuppressedTap = () => {
    if (!suppressTap.value) {
      return false
    }

    suppressTap.value = false
    return true
  }

  const syncBoardRect = (rect: BoardRect | null) => {
    boardRect.value = rect
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

  const getCellPositionFromTouchPoint = (pageX: number, pageY: number) => {
    if (!boardRect.value) {
      return null
    }

    const { left, top, width } = boardRect.value
    const relativeX = pageX - left
    const relativeY = pageY - top

    if (relativeX < 0 || relativeY < 0 || relativeX > width || relativeY > width) {
      return null
    }

    const cellSize = width / 9
    const rowIndex = Math.min(8, Math.max(0, Math.floor(relativeY / cellSize)))
    const colIndex = Math.min(8, Math.max(0, Math.floor(relativeX / cellSize)))

    return { rowIndex, colIndex }
  }

  const handleCellTouchStart = (rowIndex: number, colIndex: number) => {
    clearPressTimer()
    isTouching.value = true
    isLongPressDragging.value = false
    suppressTap.value = false
    pressedCell.value = { rowIndex, colIndex }
    dragSelection.value = null

    pressTimer.value = setTimeout(() => {
      if (!isTouching.value || !pressedCell.value) {
        return
      }

      isLongPressDragging.value = true
      suppressTap.value = true
      dragSelection.value = {
        start: { ...pressedCell.value },
        end: { ...pressedCell.value },
        visitedCells: [{ ...pressedCell.value }]
      }
      onLongPressStart?.()
    }, longPressDelay)
  }

  const handleBoardTouchMove = (pageX: number, pageY: number) => {
    if (!isTouching.value || !isLongPressDragging.value || !dragSelection.value) {
      return
    }

    const cellPosition = getCellPositionFromTouchPoint(pageX, pageY)

    if (!cellPosition) {
      return
    }

    extendDragSelection(cellPosition)
  }

  const handleTouchFinish = () => {
    clearPressTimer()
    isTouching.value = false
    pressedCell.value = null
    isLongPressDragging.value = false
  }

  return {
    clearDragSelection,
    consumeSuppressedTap,
    getDragBoxShadow,
    handleBoardTouchMove,
    handleCellTouchStart,
    handleTouchFinish,
    syncBoardRect
  }
}
