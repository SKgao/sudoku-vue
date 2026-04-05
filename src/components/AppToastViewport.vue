<template>
  <ToastProvider>
    <div class="pointer-events-none fixed inset-x-4 top-4 z-50 mx-auto w-[calc(100vw-2rem)] max-w-[28rem]">
      <ToastViewport class="flex flex-col gap-3 outline-none" />
    </div>

    <ToastRoot
      v-for="toast in state.toasts"
      :key="toast.id"
      :duration="toast.duration"
      :open="toast.open"
      class="pointer-events-auto relative overflow-hidden rounded-[1.25rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,249,252,0.94))] shadow-[0_1rem_2.2rem_rgba(36,51,66,0.18)] ring-1 ring-white/40"
      @update:open="(open) => syncOpenState(toast.id, open)"
    >
      <div class="absolute inset-y-0 left-0 w-1.5" :class="toneStripClass(toast.tone)" />

      <div class="flex items-start gap-3 p-4 pl-5">
        <div class="min-w-0 flex-1">
          <div class="mb-2 flex items-center gap-2">
            <span
              class="rounded-full px-2.5 py-1 text-[0.68rem] font-semibold tracking-[0.16em] uppercase"
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
          class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#243342]/8 bg-white/70 text-[#71808f] transition duration-150 hover:bg-white hover:text-[#243342] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#243342]/20"
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
