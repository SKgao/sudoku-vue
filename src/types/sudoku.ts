export type CellValue = number
export type NumberMatrix = CellValue[][]
export type BooleanMatrix = boolean[][]
export type GameDifficulty = 'easy' | 'medium' | 'hard'
export interface GridPosition {
  rowIndex: number
  colIndex: number
}
export type GameActionType = 'reset' | 'rebuild' | 'submit' | 'cheat'
export type ActionButtonVariant = 'primary' | 'neutral' | 'subtle' | 'warning' | 'danger'

export interface ControlButton {
  key: GameActionType
  text: string
  variant: ActionButtonVariant
}

export interface DifficultyOption {
  key: GameDifficulty
  text: string
  level: number
}

export interface BoxPosition {
  boxIndex: number
  cellIndex: number
}

export interface MatrixPosition {
  rowIndex: number
  colIndex: number
}
