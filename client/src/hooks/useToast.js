// src/hooks/useToast.js
// Toast store ka shorthand hook
// Components mein: const toast = useToast()
// toast.success("Done!") — simple!

import useToastStore from '@/store/toastStore'

const useToast = () => {
  const { success, error, warning, info, addToast, removeToast } =
    useToastStore()

  return { success, error, warning, info, addToast, removeToast }
}

export default useToast
