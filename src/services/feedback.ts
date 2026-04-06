import { reactive } from 'vue'

type ToastTone = 'success' | 'error' | 'info'
type AlertTone = 'success' | 'error' | 'info'
type ConfirmTone = 'warning' | 'danger' | 'info'

interface ToastOptions {
  title: string
  description?: string
  tone?: ToastTone
  duration?: number
}

interface AlertOptions {
  title: string
  description?: string
  tone?: AlertTone
  actionText?: string
}

interface ConfirmOptions {
  title: string
  description?: string
  tone?: ConfirmTone
  confirmText?: string
  cancelText?: string
}

interface ToastState {
  visible: boolean
  title: string
  description: string
  tone: ToastTone
}

interface ModalState {
  visible: boolean
  title: string
  description: string
  tone: AlertTone | ConfirmTone
  confirmText: string
  cancelText: string
  showCancel: boolean
}

interface FeedbackState {
  toast: ToastState
  modal: ModalState
}

const normalizeModalActionText = (text: string, fallback: string) => {
  const normalizedText = text.trim() || fallback
  return Array.from(normalizedText).slice(0, 4).join('')
}

let toastTimer: ReturnType<typeof setTimeout> | null = null
let modalResolver: ((confirmed: boolean) => void) | null = null

export const feedbackState = reactive<FeedbackState>({
  toast: {
    visible: false,
    title: '',
    description: '',
    tone: 'info'
  },
  modal: {
    visible: false,
    title: '',
    description: '',
    tone: 'info',
    confirmText: '确认',
    cancelText: '取消',
    showCancel: true
  }
})

const clearToastTimer = () => {
  if (!toastTimer) {
    return
  }

  clearTimeout(toastTimer)
  toastTimer = null
}

const openToast = (options: ToastOptions) => {
  clearToastTimer()
  feedbackState.toast.visible = true
  feedbackState.toast.title = options.title.trim()
  feedbackState.toast.description = options.description?.trim() ?? ''
  feedbackState.toast.tone = options.tone ?? 'info'

  toastTimer = setTimeout(() => {
    feedbackState.toast.visible = false
  }, options.duration ?? 1400)
}

const openModal = (
  options: AlertOptions | ConfirmOptions,
  showCancel: boolean
) => new Promise<boolean>((resolve) => {
  const confirmText =
    showCancel && 'confirmText' in options
      ? options.confirmText ?? '确认'
      : 'actionText' in options
        ? options.actionText ?? '知道了'
        : '确认'

  const cancelText =
    showCancel && 'cancelText' in options
      ? options.cancelText ?? '取消'
      : '取消'

  modalResolver = resolve
  feedbackState.modal.visible = true
  feedbackState.modal.title = options.title.trim()
  feedbackState.modal.description = options.description?.trim() ?? ''
  feedbackState.modal.tone = options.tone ?? (showCancel ? 'warning' : 'info')
  feedbackState.modal.confirmText = normalizeModalActionText(
    confirmText,
    showCancel ? '确认' : '知道'
  )
  feedbackState.modal.cancelText = normalizeModalActionText(
    cancelText,
    '取消'
  )
  feedbackState.modal.showCancel = showCancel
})

const closeModal = (confirmed: boolean) => {
  feedbackState.modal.visible = false
  const resolver = modalResolver
  modalResolver = null
  resolver?.(confirmed)
}

export const confirmFeedbackModal = () => {
  closeModal(true)
}

export const cancelFeedbackModal = () => {
  closeModal(false)
}

export const dismissFeedbackToast = () => {
  clearToastTimer()
  feedbackState.toast.visible = false
}

export const showAppToast = async (options: ToastOptions) => {
  openToast(options)
}

export const showAppAlert = async (options: AlertOptions) => {
  await openModal(options, false)
}

export const showAppConfirm = async (options: ConfirmOptions) => {
  return openModal(options, true)
}
