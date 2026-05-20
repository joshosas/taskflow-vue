import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/lib/axios'

export const useAuthStore = defineStore('auth', () => {
  // ── State ──────────────────────────────────────────────
  // Load user from localStorage on store init so a page refresh
  // does not wipe out the logged-in state on the Vue side.
  // Note: localStorage holds a copy for Vue's UI — the real session
  // lives in the Laravel cookie. Both must be valid to access the API.
  const user = ref(JSON.parse(localStorage.getItem('tf_user') ?? 'null'))
  const loading = ref(false)
  const errors = ref({}) // holds 422 field errors { email: ['...'] }
  const initialised = ref(false)

  // ── Getters ────────────────────────────────────────────
  const isAuthenticated = computed(() => !!user.value)

  // ── Helpers ────────────────────────────────────────────
  function setUser(userData) {
    user.value = userData
    // Persist to localStorage so the user survives a page refresh
    localStorage.setItem('tf_user', JSON.stringify(userData))
  }

  function clearUser() {
    user.value = null
    localStorage.removeItem('tf_user')
  }

  function clearErrors() {
    errors.value = {}
  }

  // Extracts the errors object from a Laravel 422 response and puts
  // it into errors.value so components can read errors.email,
  // errors.name etc. directly
  function handleValidationError(err) {
    const status = err.response?.status

    if (status === 422) {
      // Laravel validation failure — map field errors to the form
      errors.value = err.response.data.errors ?? {}
    } else if (status === 419) {
      // CSRF token mismatch — happens when the cookie wasn't sent correctly
      // Show a general message rather than crashing silently
      errors.value = {
        general: ['Session expired or CSRF error. Please refresh and try again.'],
      }
    } else if (status === 401) {
      errors.value = {
        general: ['You are not authenticated. Please log in.'],
      }
    } else {
      // Unknown error — still don't crash, just show something
      errors.value = {
        general: ['Something went wrong. Please try again.'],
      }
    }
  }

  // ── CSRF ───────────────────────────────────────────────
  // Must be called before every login/register attempt.
  // Plants the XSRF-TOKEN cookie that Laravel checks on state-
  // changing requests. Axios reads this cookie automatically and
  // attaches it as the X-XSRF-TOKEN header on subsequent requests.
  async function getCsrfCookie() {
    await api.get('/sanctum/csrf-cookie')
  }

  // ── Actions ────────────────────────────────────────────
  async function register(form) {
    clearErrors()
    loading.value = true

    try {
      await getCsrfCookie()

      const { data } = await api.post('/api/register', form)
      setUser(data.user)

      return true // signals the component to redirect
    } catch (err) {
      handleValidationError(err)
      return false
    } finally {
      // Always runs — resets loading whether request succeeded or failed
      loading.value = false
    }
  }

  async function login(form) {
    clearErrors()
    loading.value = true

    try {
      await getCsrfCookie()

      const { data } = await api.post('/api/login', form)
      setUser(data.user)

      return true
    } catch (err) {
      handleValidationError(err)
      return false
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true

    try {
      await api.post('/api/logout')
    } catch {
      // If logout fails (e.g. already expired session) we still
      // clear local state so the user isn't stuck in the UI
    } finally {
      clearUser()
      loading.value = false
    }
  }

  // Called on app boot — checks if the Laravel session is still
  // valid by hitting /api/user. If the session has expired (e.g.
  // after a long time away), this clears the stale localStorage
  // entry so the user is sent to login rather than hitting 401s
  async function fetchUser() {
    if (!user.value) {
      initialised.value = true
      return
    }

    try {
      const { data } = await api.get('/api/user')
      setUser(data.user)
    } catch {
      clearUser()
    } finally {
      // Mark as ready regardless of outcome — the guard can now proceed
      initialised.value = true
    }
  }

  return {
    // State
    user,
    loading,
    errors,
    // Getters
    initialised,
    isAuthenticated,
    // Actions
    register,
    login,
    logout,
    fetchUser,
    clearErrors,
  }
})
