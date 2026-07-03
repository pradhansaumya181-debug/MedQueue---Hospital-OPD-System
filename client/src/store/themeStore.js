// src/store/themeStore.js
// Dark mode state — localStorage mein persist hota hai

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useThemeStore = create(
  persist(
    (set, get) => ({
      isDark: false,

      toggleTheme: () => {
        const newVal = !get().isDark
        set({ isDark: newVal })
        // HTML root par class lagao
        document.documentElement.setAttribute(
          'data-theme',
          newVal ? 'dark' : 'light'
        )
      },

      initTheme: () => {
        const { isDark } = get()
        document.documentElement.setAttribute(
          'data-theme',
          isDark ? 'dark' : 'light'
        )
      },
    }),
    { name: 'medqueue_theme' }
  )
)

export default useThemeStore
