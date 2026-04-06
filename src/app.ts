import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './app.scss'

const app = createApp({
  onShow() {
    // App lifecycle hook reserved for future mini-program integration.
  }
})

app.use(createPinia())

export default app
