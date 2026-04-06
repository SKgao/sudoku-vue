import Taro from '@tarojs/taro'

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

const modalConfirmColorMap: Record<AlertTone | ConfirmTone, string> = {
  success: '#1f7a53',
  error: '#b33a48',
  info: '#36536b',
  warning: '#9b6a0b',
  danger: '#b63a4c'
}

const normalizeModalActionText = (text: string, fallback: string) => {
  const normalizedText = text.trim() || fallback
  return Array.from(normalizedText).slice(0, 4).join('')
}

const normalizeToastIcon = (tone: ToastTone) => {
  switch (tone) {
    case 'success':
      return 'success'
    case 'error':
      return 'error'
    default:
      return 'none'
  }
}

export const showAppToast = async (options: ToastOptions) => {
  const description = options.description?.trim()
  const title = description ? `${options.title}\n${description}` : options.title

  await Taro.showToast({
    title,
    icon: normalizeToastIcon(options.tone ?? 'info'),
    duration: options.duration ?? 1400
  })
}

export const showAppAlert = async (options: AlertOptions) => {
  await Taro.showModal({
    title: options.title,
    content: options.description ?? '',
    showCancel: false,
    confirmText: normalizeModalActionText(options.actionText ?? '知道了', '知道'),
    confirmColor: modalConfirmColorMap[options.tone ?? 'info']
  })
}

export const showAppConfirm = async (options: ConfirmOptions) => {
  const { confirm } = await Taro.showModal({
    title: options.title,
    content: options.description ?? '',
    showCancel: true,
    confirmText: normalizeModalActionText(options.confirmText ?? '确认', '确认'),
    cancelText: normalizeModalActionText(options.cancelText ?? '取消', '取消'),
    confirmColor: modalConfirmColorMap[options.tone ?? 'warning']
  })

  return confirm
}
