<template>
  <AlertDialogRoot v-model:open="state.open">
    <AlertDialogPortal>
      <AlertDialogOverlay class="fixed inset-0 z-40 bg-[#243342]/40 backdrop-blur-[5px]" />

      <AlertDialogContent
        class="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-[28rem] -translate-x-1/2 -translate-y-1/2 outline-none"
      >
        <div
          class="overflow-hidden rounded-[1.5rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,249,252,0.96))] shadow-[0_1.6rem_4rem_rgba(36,51,66,0.26)] ring-1 ring-white/45"
        >
          <div class="h-1.5 w-full" :class="toneBarClass" />

          <div class="p-6 sm:p-7">
            <div class="mb-4 flex items-center gap-3">
              <span
                class="rounded-full px-3 py-1 text-[0.72rem] font-semibold tracking-[0.18em] uppercase"
                :class="toneBadgeClass"
              >
                {{ toneLabel }}
              </span>

              <span class="text-[0.72rem] tracking-[0.2em] text-[#6e7c89] uppercase">
                Action Guard
              </span>
            </div>

            <AlertDialogTitle class="text-[1.55rem] leading-tight font-semibold text-[#1d2a36]">
              {{ state.title }}
            </AlertDialogTitle>

            <AlertDialogDescription
              v-if="state.description"
              class="mt-3 text-[0.98rem] leading-7 text-[#526170]"
            >
              {{ state.description }}
            </AlertDialogDescription>

            <div class="mt-7 flex justify-end gap-3">
              <AlertDialogCancel
                class="inline-flex min-w-[6.5rem] items-center justify-center rounded-[0.95rem] border border-[#243342]/10 bg-white px-4 py-2.5 text-[0.95rem] font-medium text-[#243342] shadow-[0_0.4rem_1rem_rgba(36,51,66,0.08)] transition duration-150 hover:bg-[#f5f8fb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#243342]/20 focus-visible:ring-offset-2"
                @click="close"
              >
                {{ state.cancelText }}
              </AlertDialogCancel>

              <AlertDialogAction
                class="inline-flex min-w-[7rem] items-center justify-center rounded-[0.95rem] px-4 py-2.5 text-[0.95rem] font-medium text-white shadow-[0_0.7rem_1.4rem_rgba(36,51,66,0.18)] transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                :class="actionButtonClass"
                @click="confirm"
              >
                {{ state.confirmText }}
              </AlertDialogAction>
            </div>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialogPortal>
  </AlertDialogRoot>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogRoot,
  AlertDialogTitle
} from 'reka-ui'
import { useAppConfirmDialog } from '@/composables/useAppConfirmDialog'

const { close, confirm, state } = useAppConfirmDialog()

const toneLabelMap = {
  warning: '确认',
  danger: '注意',
  info: '提示'
} as const

const toneBarClass = computed(() => {
  switch (state.tone) {
    case 'danger':
      return 'bg-[linear-gradient(90deg,#b63a4c,#ff9c87)]'
    case 'info':
      return 'bg-[linear-gradient(90deg,#36536b,#7fb7e4)]'
    default:
      return 'bg-[linear-gradient(90deg,#c58a18,#ffd76e)]'
  }
})

const toneBadgeClass = computed(() => {
  switch (state.tone) {
    case 'danger':
      return 'bg-[#fdebec] text-[#b33a48]'
    case 'info':
      return 'bg-[#edf5fb] text-[#36536b]'
    default:
      return 'bg-[#fff4da] text-[#9b6a0b]'
  }
})

const actionButtonClass = computed(() => {
  switch (state.tone) {
    case 'danger':
      return 'bg-[#b63a4c] hover:bg-[#9f3040] focus-visible:ring-[#b63a4c]/30'
    case 'info':
      return 'bg-[#36536b] hover:bg-[#294153] focus-visible:ring-[#36536b]/30'
    default:
      return 'bg-[#b67d14] hover:bg-[#9a6a10] focus-visible:ring-[#b67d14]/30'
  }
})

const toneLabel = computed(() => toneLabelMap[state.tone])
</script>
