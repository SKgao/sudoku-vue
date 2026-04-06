export type CellValue = number
export type NumberMatrix = CellValue[][]
export type BooleanMatrix = boolean[][]
export type GameDifficulty = 'easy' | 'medium' | 'hard'
export interface GridPosition {
  rowIndex: number
  colIndex: number
}
export type GameActionType = 'reset' | 'rebuild' | 'submit'
export type ActionButtonVariant = 'primary' | 'neutral' | 'subtle' | 'warning' | 'danger'

export interface ControlButton {
  key: GameActionType
  text: string
  variant: ActionButtonVariant
}

export interface DifficultyOption {
  key: GameDifficulty
  text: string
}

export interface GameState {
  title: string
  matrix: NumberMatrix
  cloneMatrix: NumberMatrix
  solutionMatrix: NumberMatrix
  cheatMarks: BooleanMatrix
  matrixMarks: BooleanMatrix
  isSuccess: boolean | null
  gridPosition: GridPosition | null
  activeValue: number | null
  difficulty: GameDifficulty
  difficultyOptions: DifficultyOption[]
  clearErrorMarks: boolean
  buttons: ControlButton[]
}

export interface BoxPosition {
  boxIndex: number
  cellIndex: number
}

export interface MatrixPosition {
  rowIndex: number
  colIndex: number
}
