<template>
  <div
    class="min-h-screen bg-[radial-gradient(circle_at_top,_#f7fbff,_#eceae3_58%,_#ddd8cc)] antialiased"
  >
    <RouterView />
    <AppToastViewport />
    <AppAlertDialog />
    <AppConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import AppAlertDialog from '@/components/AppAlertDialog.vue'
import AppConfirmDialog from '@/components/AppConfirmDialog.vue'
import AppToastViewport from '@/components/AppToastViewport.vue'
import { RouterView } from 'vue-router'
</script>
