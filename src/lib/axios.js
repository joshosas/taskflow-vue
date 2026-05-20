import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000',

  withXSRFToken: true,
  withCredentials: true,

  headers: {
    'Content-Type': 'application/json',
    // Tells Laravel to return JSON errors instead of redirecting
    // to a login page when a request is unauthenticated
    Accept: 'application/json',
  },
})

// ── Response interceptor ────────────────────────────────────────────────────
//
// Runs on every response that comes back through this Axios instance.
// The first function handles successful responses (2xx).
// The second handles errors (4xx, 5xx).
//
api.interceptors.response.use(
  // Success — pass the response through unchanged
  (response) => response,

  // Error — inspect the status and handle globally where appropriate
  async (error) => {
    const status = error.response?.status
    const config = error.config // original request config

    // ── 401 Unauthenticated ───────────────────────────────────────────────
    // The Laravel session has expired or the cookie was lost.
    // Clear local auth state and send the user to /login.
    // We import the router and store lazily here to avoid circular
    // dependency issues (store imports axios, axios can't import store
    // at module load time)
    if (status === 401) {
      const { useAuthStore } = await import('@/stores/auth')
      const { default: router } = await import('@/router')

      const auth = useAuthStore()
      auth.clearLocalUser() // wipe localStorage without calling /api/logout

      // Only redirect if not already on the login page
      if (router.currentRoute.value.name !== 'login') {
        router.push({ name: 'login' })
      }

      // ── 500 Server error ──────────────────────────────────────────────────
      if (status >= 500) {
        // Emit a custom event — the ToastContainer in Phase 5 listens for this
        window.dispatchEvent(
          new CustomEvent('api-error', {
            detail: { message: 'A server error occurred. Please try again.' },
          }),
        )
      }

      return Promise.reject(error)
    }

    // ── 419 CSRF token mismatch ───────────────────────────────────────────
    // The XSRF token is stale — this can happen after a long idle period.
    // Automatically refresh the CSRF cookie and retry the original request
    // once. The _retry flag prevents an infinite retry loop.
    if (status === 419 && !config._retry) {
      config._retry = true

      await api.get('/sanctum/csrf-cookie')
      return api(config) // retry the original request
    }

    // ── 422 Validation errors ─────────────────────────────────────────────
    // Pass through — individual stores handle these themselves because
    // they need to map errors to specific form fields. We don't intercept
    // here, just let the rejection propagate normally.

    // ── 500 Server error ──────────────────────────────────────────────────
    // Nothing useful to do globally — stores will handle display.
    // Could add error logging service here in production (e.g. Sentry).

    return Promise.reject(error)
  },
)

export default api
