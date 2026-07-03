// src/App.jsx
import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AppRoutes from '@/routes/AppRoutes'
import useNotifications from '@/hooks/useNotifications'
import useThemeStore from '@/store/themeStore'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: 1 } },
})

const NotificationListener = () => {
  useNotifications()
  return null
}

function App() {
  const { initTheme } = useThemeStore()

  // App start hone par saved theme apply karo
  useEffect(() => {
    initTheme()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <NotificationListener />
      <AppRoutes />
    </QueryClientProvider>
  )
}

export default App
