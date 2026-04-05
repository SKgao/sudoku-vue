<template>
  <ToastProvider>
    <div class="toast-wrapper">
      <ToastViewport class="flex flex-col gap-3 outline-none" />
    </div>

    <ToastRoot
      v-for="toast in state.toasts"
      :key="toast.id"
      :duration="toast.duration"
      :open="toast.open"
      class="toast-card"
      @update:open="(open) => syncOpenState(toast.id, open)"
    >
      <div class="absolute inset-y-0 left-0 w-1.5" :class="toneStripClass(toast.tone)" />

      <div class="flex items-start gap-3 p-4 pl-5">
        <div class="min-w-0 flex-1">
          <div class="mb-2 flex items-center gap-2">
            <span
              class="toast-badge"
              :class="toneBadgeClass(toast.tone)"
            >
              {{ toneLabel(toast.tone) }}
            </span>
          </div>

          <ToastTitle class="text-[1rem] leading-6 font-semibold text-[#1f2d39]">
            {{ toast.title }}
          </ToastTitle>

          <ToastDescription
            v-if="toast.description"
            class="mt-1 text-[0.92rem] leading-6 text-[#5a6978]"
          >
            {{ toast.description }}
          </ToastDescription>
        </div>

        <ToastClose
          class="toast-close"
          aria-label="关闭提示"
        >
          <Icon type="close" size="14" />
        </ToastClose>
      </div>
    </ToastRoot>
  </ToastProvider>
</template>

<script setup lang="ts">
import {
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastRoot,
  ToastTitle,
  ToastViewport
} from 'reka-ui'
import Icon from '@/components/Icon.vue'
import type { AppToastTone } from '@/composables/useAppToast'
import { useAppToast } from '@/composables/useAppToast'

const { state, syncOpenState } = useAppToast()

const toneStripClass = (tone: AppToastTone) => {
  switch (tone) {
    case 'success':
      return 'bg-[linear-gradient(180deg,#1d976c,#93f9b9)]'
    case 'error':
      return 'bg-[linear-gradient(180deg,#d62839,#ff8a80)]'
    default:
      return 'bg-[linear-gradient(180deg,#36536b,#7fb7e4)]'
  }
}

const toneBadgeClass = (tone: AppToastTone) => {
  switch (tone) {
    case 'success':
      return 'bg-[#e7f8ef] text-[#1f7a53]'
    case 'error':
      return 'bg-[#fdebec] text-[#b33a48]'
    default:
      return 'bg-[#edf5fb] text-[#36536b]'
  }
}

const toneLabel = (tone: AppToastTone) => {
  switch (tone) {
    case 'success':
      return '成功'
    case 'error':
      return '失败'
    default:
      return '提示'
  }
}
</script>
