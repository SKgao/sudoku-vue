import { defineConfig, presetUno } from 'unocss'

export default defineConfig({
  presets: [presetUno()],
  shortcuts: {
    'app-shell':
      "mx-auto flex min-h-screen max-w-[450px] flex-col overflow-hidden font-[Consolas,'Microsoft_YaHei','Heiti_SC',monospace] text-[#243342]",
    'page-card': 'px-[5vw]',
    'board-row': 'flex',
    'board-cell':
      'flex aspect-square flex-1 cursor-pointer items-center justify-center text-center text-[16px] leading-none transition-colors duration-150',
    'popup-shell':
      'absolute z-20 w-[33.3334%] rounded-[0.85rem] text-white shadow-[0.2rem_0.3rem_0.4rem_rgba(48,48,48,0.4)]'
  }
})
