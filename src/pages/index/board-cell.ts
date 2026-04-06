import type { CSSProperties } from 'vue'
import type { BooleanMatrix, GridPosition, NumberMatrix } from '@/types/sudoku'

export interface CssModuleClasses {
  [className: string]: string
}

interface BoardCellVisualState {
  rowIndex: number
  colIndex: number
  value: number
  cloneMatrix: NumberMatrix
  cheatMarks: BooleanMatrix
  matrixMarks: BooleanMatrix
  clearErrorMarks: boolean
  activeValue: number | null
  gridPosition: GridPosition | null
  styles: CssModuleClasses
}

interface BoardCellStyleState {
  rowIndex: number
  colIndex: number
  gridPosition: GridPosition | null
  dragBoxShadow?: string
}

export const getBoardCellClassList = ({
  rowIndex,
  colIndex,
  value,
  cloneMatrix,
  cheatMarks,
  matrixMarks,
  clearErrorMarks,
  activeValue,
  gridPosition,
  styles
}: BoardCellVisualState) => {
  const isFixedCell = cloneMatrix[rowIndex][colIndex]
  const isSelected = gridPosition?.rowIndex === rowIndex && gridPosition?.colIndex === colIndex
  const isHighlightedValue = Boolean(value) && activeValue === value
  const isCheatValue = cheatMarks[rowIndex][colIndex] && value
  const hasError = (!matrixMarks[rowIndex][colIndex] || !value) && !clearErrorMarks

  return [
    'board-cell',
    rowIndex === 0 ? '' : rowIndex % 3 === 0 ? 'board-cell--border-top-strong' : 'board-cell--border-top',
    colIndex === 0
      ? ''
      : colIndex % 3 === 0
        ? 'board-cell--border-left-strong'
        : 'board-cell--border-left',
    rowIndex === 0 && colIndex === 0 ? 'board-cell--corner-tl' : '',
    rowIndex === 0 && colIndex === 8 ? 'board-cell--corner-tr' : '',
    rowIndex === 8 && colIndex === 0 ? 'board-cell--corner-bl' : '',
    rowIndex === 8 && colIndex === 8 ? 'board-cell--corner-br' : '',
    isFixedCell ? 'board-cell--fixed' : '',
    isHighlightedValue ? (isFixedCell ? 'board-cell--highlight-fixed' : 'board-cell--highlight-editable') : '',
    isCheatValue ? 'board-cell--cheat' : '',
    isSelected ? 'board-cell--selected' : '',
    !value ? 'board-cell--empty' : '',
    hasError ? 'board-cell--error' : ''
  ].filter(Boolean).map((className) => styles[className] ?? className)
}

export const getBoardCellStyle = ({
  rowIndex,
  colIndex,
  gridPosition,
  dragBoxShadow
}: BoardCellStyleState): CSSProperties | undefined => {
  const shadows: string[] = []
  const isFocusedCell = gridPosition?.rowIndex === rowIndex && gridPosition?.colIndex === colIndex

  if (isFocusedCell) {
    shadows.push('inset 0 0 0 2px #d18c1d')
  }

  if (dragBoxShadow) {
    shadows.push(dragBoxShadow)
  }

  return shadows.length ? { boxShadow: shadows.join(', ') } : undefined
}
