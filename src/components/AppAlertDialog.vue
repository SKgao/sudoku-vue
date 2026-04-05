<template>
  <AlertDialogRoot
    v-model:open="state.open"
  >
    <AlertDialogPortal>
      <AlertDialogOverlay class="dialog-overlay" />

      <AlertDialogContent
        class="dialog-position max-w-[26rem]"
      >
        <div class="dialog-card-alert">
          <div
            class="h-1.5 w-full"
            :class="toneBarClass"
          />

          <div class="p-6 sm:p-7">
            <div class="mb-4 flex items-center gap-3">
              <span
                class="dialog-badge"
                :class="toneBadgeClass"
              >
                {{ toneLabel }}
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
                class="dialog-primary-button min-w-[7.5rem] border border-[#243342]/10 bg-[#243342] hover:bg-[#19242e] focus-visible:ring-[#243342]/30"
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
