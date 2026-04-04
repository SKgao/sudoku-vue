export type CellValue = number
export type NumberMatrix = CellValue[][]
export type BooleanMatrix = boolean[][]
export type PopupCell = CellValue | ''
export type PopupMatrix = PopupCell[][]
export type GridPosition = [number, number]
export type GameActionType = 'check' | 'reset' | 'clear' | 'rebuild' | 'submit' | 'cheat'
export type ActionButtonVariant = 'primary' | 'neutral' | 'subtle' | 'warning' | 'danger'

export interface ControlButton {
  key: GameActionType
  text: string
  variant: ActionButtonVariant
}

export interface BoxPosition {
  boxIndex: number
  cellIndex: number
}

export interface MatrixPosition {
  rowIndex: number
  colIndex: number
}
