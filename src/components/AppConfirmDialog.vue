<template>
  <AlertDialogRoot v-model:open="state.open">
    <AlertDialogPortal>
      <AlertDialogOverlay class="dialog-overlay-soft" />

      <AlertDialogContent
        class="dialog-position max-w-[28rem]"
      >
        <div class="dialog-card-confirm">
          <div class="h-1.5 w-full" :class="toneBarClass" />

          <div class="p-6 sm:p-7">
            <div class="mb-4 flex items-center gap-3">
              <span
                class="dialog-badge"
                :class="toneBadgeClass"
              >
                {{ toneLabel }}
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
                class="dialog-secondary-button min-w-[6.5rem]"
                @click="close"
              >
                {{ state.cancelText }}
              </AlertDialogCancel>

              <AlertDialogAction
                class="dialog-primary-button min-w-[7rem]"
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
