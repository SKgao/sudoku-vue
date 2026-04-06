import { defineStore } from 'pinia'
import type { GameActionType, GameDifficulty, GameState, GridPosition } from '@/types/sudoku'
import { showAppAlert, showAppConfirm, showAppToast } from '@/services/feedback'
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
    async submitGame() {
      const submitResult = createSubmitResult(this.matrix)
      applyStatePatch(this, submitResult)

      if (submitResult.isSuccess) {
        const confirmed = await showAppConfirm({
          title: '恭喜你完成本局游戏',
          description: '当前数独已经全部填写正确。要不要立刻再来一局？',
          tone: 'info',
          confirmText: '再来一局',
          cancelText: '取消'
        })

        if (confirmed) {
          this.applyRebuildGame()
        }

        return
      }

      await showAppAlert({
        title: '提交失败',
        description: '当前答案还未完成或存在错误，请继续检查并修正标红单元格。',
        tone: 'error'
      })
    },
    applyResetGame() {
      applyStatePatch(this, createResetGamePatch(this))
      void showAppToast({
        title: '棋盘已重置',
        description: '已恢复到本局初始题面。',
        tone: 'info'
      })
    },
    async resetGame() {
      const confirmed = await showAppConfirm({
        title: '确认重置当前棋盘？',
        description: '已填写的数字会被清空，并恢复到本局最初的题面。',
        tone: 'warning',
        confirmText: '确认重置',
        cancelText: '继续作答'
      })

      if (confirmed) {
        this.applyResetGame()
      }
    },
    applyCheatGame() {
      const { emptyCells, statePatch } = createCheatGameResult(this)

      if (!emptyCells || !statePatch) {
        void showAppToast({
          title: '当前没有可代填空位',
          description: '所有可填写格都已有数字，作弊不会再补入新答案。',
          tone: 'info'
        })
        return
      }

      applyStatePatch(this, statePatch)

      void showAppToast({
        title: '作弊完成',
        description: `已为 ${emptyCells} 个未完成格子填入正确答案，代填数字会以红色显示。`,
        tone: 'success'
      })
    },
    async cheatGame() {
      const confirmed = await showAppConfirm({
        title: '确认启用作弊？',
        description: '系统会把所有未完成区域直接填入正确答案，当前挑战将失去意义。',
        tone: 'danger',
        confirmText: '确认作弊',
        cancelText: '继续作答'
      })

      if (confirmed) {
        this.applyCheatGame()
      }
    },
    applyDifficultyChange(difficulty: GameDifficulty) {
      Object.assign(this, createGameState(difficulty))

      void showAppToast({
        title: '切换成功',
        tone: 'success'
      })
    },
    async changeDifficulty(difficulty: GameDifficulty) {
      if (this.difficulty === difficulty) {
        return
      }

      const difficultyConfig = getDifficultyOption(difficulty)

      const confirmed = await showAppConfirm({
        title: `切换到${difficultyConfig.text}难度？`,
        description: '当前棋盘进度将被放弃，并立即生成对应难度的新题目。',
        tone: 'warning',
        confirmText: `切换${difficultyConfig.text}`,
        cancelText: '保留本局'
      })

      if (confirmed) {
        this.applyDifficultyChange(difficulty)
      }
    },
    applyRebuildGame() {
      Object.assign(this, createGameState(this.difficulty))
      const difficultyConfig = getDifficultyOption(this.difficulty)

      void showAppToast({
        title: '新棋盘已生成',
        description: `已经开始一局新的${difficultyConfig.text}难度数独。`,
        tone: 'success'
      })
    },
    async rebuildGame() {
      const confirmed = await showAppConfirm({
        title: '确认开始新的一局？',
        description: '当前棋盘进度将被放弃，并立即生成新的题目。',
        tone: 'danger',
        confirmText: '开新局',
        cancelText: '保留本局'
      })

      if (confirmed) {
        this.applyRebuildGame()
      }
    },
    async handleGame(type: GameActionType) {
      const actions: Record<GameActionType, () => Promise<void>> = {
        submit: async () => this.submitGame(),
        cheat: async () => this.cheatGame(),
        reset: async () => this.resetGame(),
        rebuild: async () => this.rebuildGame()
      }

      await actions[type]()
    }
  }
})
