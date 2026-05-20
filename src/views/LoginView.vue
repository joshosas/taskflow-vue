<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AuthLayout from '@/components/AuthLayout.vue'
import FormField from '@/components/FormField.vue'

const router = useRouter()
const auth = useAuthStore()

const form = ref({
  email: '',
  password: '',
})

// Read directly from the store — reactively updates the template
const loading = computed(() => auth.loading)
const errors = computed(() => auth.errors)

// General error covers cases like wrong credentials where the
// 422 error is on the email field but reads like a general message
const generalError = computed(() => {
  const msg = errors.value?.email?.[0] ?? ''
  return msg.includes('match') ? msg : ''
})

async function handleLogin() {
  const success = await auth.login(form.value)

  if (success) {
    // Route guard will let us through since isAuthenticated is now true
    router.push({ name: 'home' })
  }
}
</script>

<template>
  <AuthLayout>
    <template #heading>
      <h1 class="text-xl font-semibold text-slate-900">Welcome back</h1>
      <p class="text-sm text-slate-400 mt-1">Sign in to your account</p>
    </template>

    <form @submit.prevent="handleLogin" class="flex flex-col gap-4" novalidate>
      <FormField
        id="email"
        label="Email address"
        type="email"
        v-model="form.email"
        placeholder="you@example.com"
        autocomplete="email"
        :error="errors.email?.[0]"
      />

      <FormField
        id="password"
        label="Password"
        type="password"
        v-model="form.password"
        placeholder="••••••••"
        autocomplete="current-password"
        :error="errors.password?.[0]"
      />

      <!-- General error (wrong credentials) sits outside a specific field -->
      <p v-if="generalError" class="text-sm text-red-500 text-center">
        {{ generalError }}
      </p>

      <button
        type="submit"
        :disabled="loading"
        class="w-full py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed mt-1"
      >
        {{ loading ? 'Signing in…' : 'Sign in' }}
      </button>
    </form>

    <template #footer>
      Don't have an account?
      <RouterLink to="/register" class="text-blue-600 font-medium hover:underline ml-1">
        Create one
      </RouterLink>
    </template>
  </AuthLayout>
</template>
