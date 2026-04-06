<template>
  <view
    v-if="feedbackState.toast.visible"
    :class="styles['toast-portal']"
    @tap="dismissFeedbackToast"
  >
    <view :class="toastCardClass">
      <view :class="toastIconClass">
        <text>{{ toastIcon }}</text>
      </view>
      <view :class="styles['toast-copy']">
        <text :class="styles['toast-title']">{{ feedbackState.toast.title }}</text>
        <text
          v-if="feedbackState.toast.description"
          :class="styles['toast-description']"
        >
          {{ feedbackState.toast.description }}
        </text>
      </view>
    </view>
  </view>

  <view
    v-if="feedbackState.modal.visible"
    :class="styles['modal-mask']"
  >
    <view :class="modalCardClass">
      <view :class="modalBadgeClass"></view>
      <text :class="styles['modal-title']">{{ feedbackState.modal.title }}</text>
      <text
        v-if="feedbackState.modal.description"
        :class="styles['modal-description']"
      >
        {{ feedbackState.modal.description }}
      </text>

      <view :class="styles['modal-actions']">
        <view
          v-if="feedbackState.modal.showCancel"
          :class="joinClasses(styles['modal-action'], styles['modal-action--secondary'])"
          @tap="cancelFeedbackModal"
        >
          {{ feedbackState.modal.cancelText }}
        </view>
        <view
          :class="confirmButtonClass"
          @tap="confirmFeedbackModal"
        >
          {{ feedbackState.modal.confirmText }}
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import {
  cancelFeedbackModal,
  confirmFeedbackModal,
  dismissFeedbackToast,
  feedbackState
} from '@/services/feedback'
import styles from './app-feedback.module.scss'

const joinClasses = (...classNames) => classNames.filter(Boolean).join(' ')

const toastCardClass = computed(() =>
  joinClasses(
    styles['toast-card'],
    styles[`toast-card--${feedbackState.toast.tone}`]
  )
)

const toastIconClass = computed(() =>
  joinClasses(
    styles['toast-icon'],
    styles[`toast-icon--${feedbackState.toast.tone}`]
  )
)

const modalCardClass = computed(() =>
  joinClasses(
    styles['modal-card'],
    styles[`modal-card--${feedbackState.modal.tone}`]
  )
)

const modalBadgeClass = computed(() =>
  joinClasses(
    styles['modal-badge'],
    styles[`modal-badge--${feedbackState.modal.tone}`]
  )
)

const confirmButtonClass = computed(() =>
  joinClasses(
    styles['modal-action'],
    styles['modal-action--primary'],
    styles[`modal-action--${feedbackState.modal.tone}`]
  )
)

const toastIcon = computed(() => {
  switch (feedbackState.toast.tone) {
    case 'success':
      return '✓'
    case 'error':
      return '!'
    default:
      return 'i'
  }
})
</script>
