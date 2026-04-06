declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<Record<string, never>, Record<string, never>, unknown>
  export default component
}

declare module '*.css'
declare module '*.scss'
declare module '*.module.scss' {
  const classes: Record<string, string>
  export default classes
}
