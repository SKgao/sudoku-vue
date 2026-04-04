import { reactive } from 'vue'

export type AppToastTone = 'success' | 'error' | 'info'

export interface AppToastOptions {
  title: string
  description?: string
  tone?: AppToastTone
  duration?: number
}

export interface AppToastItem extends Required<AppToastOptions> {
  id: number
  open: boolean
}

const state = reactive<{ toasts: AppToastItem[] }>({
  toasts: []
})

let nextToastId = 1

const dismiss = (id: number) => {
  const index = state.toasts.findIndex((toast) => toast.id === id)

  if (index === -1) {
    return
  }

  state.toasts.splice(index, 1)
}

const show = (options: AppToastOptions) => {
  const toast: AppToastItem = {
    id: nextToastId,
    open: true,
    title: options.title,
    description: options.description ?? '',
    tone: options.tone ?? 'info',
    duration: options.duration ?? 3200
  }

  nextToastId += 1
  state.toasts.unshift(toast)

  if (state.toasts.length > 4) {
    state.toasts.splice(4)
  }

  return toast.id
}

const syncOpenState = (id: number, open: boolean) => {
  if (open) {
    return
  }

  dismiss(id)
}

export const useAppToast = () => ({
  state,
  show,
  dismiss,
  syncOpenState
})
