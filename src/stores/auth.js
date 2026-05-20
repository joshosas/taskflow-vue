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
    if (err.response?.status === 422) {
      errors.value = err.response.data.errors ?? {}
    } else {
      // Non-validation error — rethrow so the component can handle it
      throw err
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
    if (!user.value) return

    try {
      const { data } = await api.get('/api/user')
      setUser(data.user)
    } catch {
      // Session expired or invalid — clear everything
      clearUser()
    }
  }

  return {
    // State
    user,
    loading,
    errors,
    // Getters
    isAuthenticated,
    // Actions
    register,
    login,
    logout,
    fetchUser,
    clearErrors,
  }
})
