import { generator } from './generate'

export const puzzleMatrix = (level = 5) => {
  return generator.map(row => {
    return row.map(cell => Math.random() * 9 < level ? 0 : cell)
  })
}