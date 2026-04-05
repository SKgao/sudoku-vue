<template>
  <div class="app-bg">
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
