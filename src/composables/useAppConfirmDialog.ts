import { reactive } from 'vue'

export type AppConfirmTone = 'warning' | 'danger' | 'info'

export interface AppConfirmDialogOptions {
  title: string
  description?: string
  tone?: AppConfirmTone
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
}

interface AppConfirmDialogState {
  open: boolean
  title: string
  description: string
  tone: AppConfirmTone
  confirmText: string
  cancelText: string
}

const state = reactive<AppConfirmDialogState>({
  open: false,
  title: '',
  description: '',
  tone: 'warning',
  confirmText: '确认',
  cancelText: '取消'
})

let confirmHandler: (() => void) | null = null

const show = (options: AppConfirmDialogOptions) => {
  state.title = options.title
  state.description = options.description ?? ''
  state.tone = options.tone ?? 'warning'
  state.confirmText = options.confirmText ?? '确认'
  state.cancelText = options.cancelText ?? '取消'
  state.open = true
  confirmHandler = options.onConfirm ?? null
}

const close = () => {
  state.open = false
  confirmHandler = null
}

const confirm = () => {
  const handler = confirmHandler
  close()
  handler?.()
}

export const useAppConfirmDialog = () => ({
  state,
  show,
  close,
  confirm
})
