import { readonly, ref } from 'vue'

export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'loading'

interface AlertState {
  open: boolean
  type: AlertType
  message: string
}

const alertState = ref<AlertState>({
  open: false,
  type: 'success',
  message: '',
})

let closeTimeoutRef: ReturnType<typeof setTimeout> | null = null

const clearCloseTimeout = () => {
  if (closeTimeoutRef) {
    clearTimeout(closeTimeoutRef)
    closeTimeoutRef = null
  }
}

const closeAlert = () => {
  clearCloseTimeout()
  alertState.value = {
    ...alertState.value,
    open: false,
  }
}

const setAlert = (type: AlertType, message: string) => {
  clearCloseTimeout()

  alertState.value = {
    open: true,
    type,
    message,
  }

  if (type !== 'loading') {
    closeTimeoutRef = setTimeout(() => {
      alertState.value = {
        ...alertState.value,
        open: false,
      }
      closeTimeoutRef = null
    }, 2500)
  }
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    clearCloseTimeout()
  })
}

export function useAppAlert() {
  return {
    alertState: readonly(alertState),
    setAlert,
    closeAlert,
  }
}
