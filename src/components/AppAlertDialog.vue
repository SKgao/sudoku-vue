<template>
  <AlertDialogRoot
    v-model:open="state.open"
  >
    <AlertDialogPortal>
      <AlertDialogOverlay
        class="fixed inset-0 z-40 bg-[#243342]/45 backdrop-blur-[6px]"
      />

      <AlertDialogContent
        class="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-[26rem] -translate-x-1/2 -translate-y-1/2 outline-none"
      >
        <div
          class="overflow-hidden rounded-[1.5rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(246,249,252,0.95))] shadow-[0_1.6rem_4rem_rgba(36,51,66,0.28)] ring-1 ring-white/45"
        >
          <div
            class="h-1.5 w-full"
            :class="toneBarClass"
          />

          <div class="p-6 sm:p-7">
            <div class="mb-4 flex items-center gap-3">
              <span
                class="rounded-full px-3 py-1 text-[0.72rem] font-semibold tracking-[0.18em] uppercase"
                :class="toneBadgeClass"
              >
                {{ toneLabel }}
              </span>

              <span class="text-[0.72rem] tracking-[0.2em] text-[#6e7c89] uppercase">
                Result Prompt
              </span>
            </div>

            <AlertDialogTitle class="text-[1.65rem] leading-tight font-semibold text-[#1d2a36]">
              {{ state.title }}
            </AlertDialogTitle>

            <AlertDialogDescription
              v-if="state.description"
              class="mt-3 text-[0.98rem] leading-7 text-[#526170]"
            >
              {{ state.description }}
            </AlertDialogDescription>

            <div class="mt-7 flex justify-end">
              <AlertDialogCancel
                class="inline-flex min-w-[7.5rem] items-center justify-center rounded-[0.95rem] border border-[#243342]/10 bg-[#243342] px-4 py-2.5 text-[0.95rem] font-medium text-white shadow-[0_0.7rem_1.4rem_rgba(36,51,66,0.18)] transition duration-150 hover:bg-[#19242e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#243342]/30 focus-visible:ring-offset-2"
                @click="close"
              >
                {{ state.actionText }}
              </AlertDialogCancel>
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
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogRoot,
  AlertDialogTitle
} from 'reka-ui'
import { useAppAlertDialog } from '@/composables/useAppAlertDialog'

const { close, state } = useAppAlertDialog()

const toneLabelMap = {
  success: '成功',
  error: '失败',
  info: '提示'
} as const

const toneBarClass = computed(() => {
  switch (state.tone) {
    case 'success':
      return 'bg-[linear-gradient(90deg,#1d976c,#93f9b9)]'
    case 'error':
      return 'bg-[linear-gradient(90deg,#d62839,#ff8a80)]'
    default:
      return 'bg-[linear-gradient(90deg,#36536b,#7fb7e4)]'
  }
})

const toneBadgeClass = computed(() => {
  switch (state.tone) {
    case 'success':
      return 'bg-[#e7f8ef] text-[#1f7a53]'
    case 'error':
      return 'bg-[#fdebec] text-[#b33a48]'
    default:
      return 'bg-[#edf5fb] text-[#36536b]'
  }
})

const toneLabel = computed(() => toneLabelMap[state.tone])
</script>
