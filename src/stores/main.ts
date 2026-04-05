import { defineStore } from 'pinia'
import type { GameActionType, GameDifficulty, GameState, GridPosition } from '@/types/sudoku'
import { useAppAlertDialog } from '@/composables/useAppAlertDialog'
import { useAppConfirmDialog } from '@/composables/useAppConfirmDialog'
import { useAppToast } from '@/composables/useAppToast'
import {
  createActiveValuePatch,
  createCheatCurrentGridPatch,
  createCheatGameResult,
  createClearCurrentGridPatch,
  createGameState,
  createGridSelectionPatch,
  createModifyGridPatch,
  createResetGamePatch,
  createSubmitResult,
  getDifficultyOption
} from '@/utils/game-state'

const { show: showAlert } = useAppAlertDialog()
const { show: showConfirm } = useAppConfirmDialog()
const { show: showToast } = useAppToast()

const applyStatePatch = (store: GameState, patch: Partial<GameState> | null) => {
  if (!patch) {
    return false
  }

  Object.assign(store, patch)
  return true
}

export const useMainStore = defineStore('main', {
  state: createGameState,
  actions: {
    clickGrid(gridPosition: GridPosition | null) {
      applyStatePatch(this, createGridSelectionPatch(gridPosition))
    },
    setActiveValue(value: number | null) {
      applyStatePatch(this, createActiveValuePatch(value))
    },
    modifyGrid(num: number) {
      applyStatePatch(this, createModifyGridPatch(this, num))
    },
    clearCurrentGrid() {
      applyStatePatch(this, createClearCurrentGridPatch(this))
    },
    cheatCurrentGrid() {
      applyStatePatch(this, createCheatCurrentGridPatch(this))
    },
    submitGame() {
      const submitResult = createSubmitResult(this.matrix)
      applyStatePatch(this, submitResult)

      if (submitResult.isSuccess) {
        showConfirm({
          title: '恭喜你完成本局游戏',
          description: '当前数独已经全部填写正确。要不要立刻再来一局？',
          tone: 'info',
          confirmText: '再来一局',
          cancelText: '取消',
          onConfirm: () => this.applyRebuildGame()
        })
        return
      }

      showAlert({
        title: '提交失败',
        description: '当前答案还未完成或存在错误，请继续检查并修正标红单元格。',
        tone: 'error'
      })
    },
    applyResetGame() {
      applyStatePatch(this, createResetGamePatch(this))
      showToast({
        title: '棋盘已重置',
        description: '已恢复到本局初始题面。',
        tone: 'info'
      })
    },
    resetGame() {
      showConfirm({
        title: '确认重置当前棋盘？',
        description: '已填写的数字会被清空，并恢复到本局最初的题面。',
        tone: 'warning',
        confirmText: '确认重置',
        cancelText: '继续作答',
        onConfirm: () => this.applyResetGame()
      })
    },
    applyCheatGame() {
      const { emptyCells, statePatch } = createCheatGameResult(this)

      if (!emptyCells || !statePatch) {
        showToast({
          title: '当前没有可代填空位',
          description: '所有可填写格都已有数字，作弊不会再补入新答案。',
          tone: 'info'
        })
        return
      }

      applyStatePatch(this, statePatch)

      showToast({
        title: '作弊完成',
        description: `已为 ${emptyCells} 个未完成格子填入正确答案，代填数字会以红色显示。`,
        tone: 'success'
      })
    },
    cheatGame() {
      showConfirm({
        title: '确认启用作弊？',
        description: '系统会把所有未完成区域直接填入正确答案，当前挑战将失去意义。',
        tone: 'danger',
        confirmText: '确认作弊',
        cancelText: '继续作答',
        onConfirm: () => this.applyCheatGame()
      })
    },
    applyDifficultyChange(difficulty: GameDifficulty) {
      Object.assign(this, createGameState(difficulty))
      const difficultyConfig = getDifficultyOption(difficulty)

      showToast({
        title: `难度已切换为${difficultyConfig.text}`,
        description: '已根据新的难度重新生成棋盘。',
        tone: 'success'
      })
    },
    changeDifficulty(difficulty: GameDifficulty) {
      if (this.difficulty === difficulty) {
        return
      }

      const difficultyConfig = getDifficultyOption(difficulty)

      showConfirm({
        title: `切换到${difficultyConfig.text}难度？`,
        description: '当前棋盘进度将被放弃，并立即生成对应难度的新题目。',
        tone: 'warning',
        confirmText: `切换到${difficultyConfig.text}`,
        cancelText: '保留当前局',
        onConfirm: () => this.applyDifficultyChange(difficulty)
      })
    },
    applyRebuildGame() {
      Object.assign(this, createGameState(this.difficulty))
      const difficultyConfig = getDifficultyOption(this.difficulty)

      showToast({
        title: '新棋盘已生成',
        description: `已经开始一局新的${difficultyConfig.text}难度数独。`,
        tone: 'success'
      })
    },
    rebuildGame() {
      showConfirm({
        title: '确认开始新的一局？',
        description: '当前棋盘进度将被放弃，并立即生成新的题目。',
        tone: 'danger',
        confirmText: '生成新棋盘',
        cancelText: '保留当前局',
        onConfirm: () => this.applyRebuildGame()
      })
    },
    handleGame(type: GameActionType) {
      const actions: Record<GameActionType, () => void> = {
        submit: () => this.submitGame(),
        cheat: () => this.cheatGame(),
        reset: () => this.resetGame(),
        rebuild: () => this.rebuildGame()
      }

      actions[type]()
    }
  }
})
