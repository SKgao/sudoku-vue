import { defineConfig, presetUno } from 'unocss'

export default defineConfig({
  presets: [presetUno()],
  shortcuts: {
    'app-bg': 'min-h-screen bg-[radial-gradient(circle_at_top,_#f7fbff,_#eceae3_58%,_#ddd8cc)] antialiased',
    'app-shell':
      "mx-auto flex min-h-screen max-w-[450px] flex-col overflow-hidden font-[Consolas,'Microsoft_YaHei','Heiti_SC',monospace] text-[#243342]",
    'page-card': 'px-[5vw]',
    'page-header': 'mb-2 bg-[steelblue] px-[5%] py-4 text-white shadow-[0_0.2rem_0.3rem_rgba(48,48,48,0.4)]',
    'page-glow': 'absolute inset-x-0 -top-3 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.55),transparent)] blur-xl',
    'page-surface':
      'relative rounded-[1.35rem] bg-white/60 p-3 shadow-[0_0.8rem_2rem_rgba(36,51,66,0.12)] ring-1 ring-white/65 backdrop-blur-sm',
    'page-footer':
      'sticky bottom-0 mt-auto w-full bg-[steelblue] shadow-[0_-0.2rem_0.35rem_rgba(48,48,48,0.28)]',
    'input-panel': 'mt-4 space-y-3',
    'keypad-button':
      'aspect-square rounded-[0.9rem] border border-white/65 bg-[steelblue] text-[1.15rem] font-semibold text-white shadow-[0_0.45rem_1.2rem_rgba(70,115,153,0.22)] transition-all duration-150 enabled:hover:-translate-y-[1px] enabled:hover:bg-[#5a8ab6] disabled:cursor-not-allowed disabled:bg-[#9eb8cc] disabled:text-white/70',
    'quick-action-button':
      'flex items-center justify-center gap-1.5 rounded-[0.82rem] px-3.5 py-2.5 text-[0.92rem] font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:text-[#8da0ae]',
    'quick-action-neutral':
      'border border-[#d8e2ea] bg-white/80 text-[#486170] enabled:hover:bg-white disabled:bg-white/55',
    'quick-action-hint':
      'border border-[#c9d8e5] bg-[#eef5fb] text-[steelblue] enabled:hover:bg-[#e5f0f9] disabled:bg-[#eef5fb]/70',
    'radio-group-shell':
      'inline-flex items-center gap-1 rounded-full border border-white/65 bg-white/75 p-1 shadow-[0_0.55rem_1.2rem_rgba(36,51,66,0.08)] backdrop-blur-sm',
    'radio-option':
      'rounded-full px-3 py-1.5 text-[0.84rem] font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[steelblue]/35 focus-visible:ring-offset-1',
    'dialog-overlay': 'fixed inset-0 z-40 bg-[#243342]/45 backdrop-blur-[6px]',
    'dialog-overlay-soft': 'fixed inset-0 z-40 bg-[#243342]/40 backdrop-blur-[5px]',
    'dialog-position':
      'fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 outline-none',
    'dialog-card':
      'overflow-hidden rounded-[1.5rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,249,252,0.96))] ring-1 ring-white/45',
    'dialog-card-alert':
      'overflow-hidden rounded-[1.5rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(246,249,252,0.95))] shadow-[0_1.6rem_4rem_rgba(36,51,66,0.28)] ring-1 ring-white/45',
    'dialog-card-confirm':
      'overflow-hidden rounded-[1.5rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,249,252,0.96))] shadow-[0_1.6rem_4rem_rgba(36,51,66,0.26)] ring-1 ring-white/45',
    'dialog-badge': 'rounded-full px-3 py-1 text-[0.72rem] font-semibold tracking-[0.18em] uppercase',
    'dialog-primary-button':
      'inline-flex items-center justify-center rounded-[0.95rem] px-4 py-2.5 text-[0.95rem] font-medium text-white shadow-[0_0.7rem_1.4rem_rgba(36,51,66,0.18)] transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'dialog-secondary-button':
      'inline-flex items-center justify-center rounded-[0.95rem] border border-[#243342]/10 bg-white px-4 py-2.5 text-[0.95rem] font-medium text-[#243342] shadow-[0_0.4rem_1rem_rgba(36,51,66,0.08)] transition duration-150 hover:bg-[#f5f8fb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#243342]/20 focus-visible:ring-offset-2',
    'toast-wrapper': 'pointer-events-none fixed inset-x-4 top-4 z-50 mx-auto w-[calc(100vw-2rem)] max-w-[28rem]',
    'toast-card':
      'pointer-events-auto relative overflow-hidden rounded-[1.25rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,249,252,0.94))] shadow-[0_1rem_2.2rem_rgba(36,51,66,0.18)] ring-1 ring-white/40',
    'toast-badge': 'rounded-full px-2.5 py-1 text-[0.68rem] font-semibold tracking-[0.16em] uppercase',
    'toast-close':
      'inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#243342]/8 bg-white/70 text-[#71808f] transition duration-150 hover:bg-white hover:text-[#243342] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#243342]/20',
    'popup-shell':
      'absolute z-20 w-[33.3334%] rounded-[0.85rem] text-white shadow-[0.2rem_0.3rem_0.4rem_rgba(48,48,48,0.4)]'
  }
})
