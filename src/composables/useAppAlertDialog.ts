import { reactive } from 'vue'

export type AppAlertTone = 'success' | 'error' | 'info'

export interface AppAlertDialogOptions {
  title: string
  description?: string
  tone?: AppAlertTone
  actionText?: string
}

interface AppAlertDialogState extends Required<AppAlertDialogOptions> {
  open: boolean
}

const defaultState: AppAlertDialogState = {
  open: false,
  title: '',
  description: '',
  tone: 'info',
  actionText: '知道了'
}

const state = reactive<AppAlertDialogState>({ ...defaultState })

const show = (options: AppAlertDialogOptions) => {
  state.title = options.title
  state.description = options.description ?? ''
  state.tone = options.tone ?? 'info'
  state.actionText = options.actionText ?? '知道了'
  state.open = true
}

const close = () => {
  state.open = false
}

export const useAppAlertDialog = () => ({
  state,
  show,
  close
})
