<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AuthLayout from '@/components/AuthLayout.vue'
import FormField from '@/components/FormField.vue'

const router = useRouter()
const auth = useAuthStore()

const form = ref({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
})

const loading = computed(() => auth.loading)
const errors = computed(() => auth.errors)

async function handleRegister() {
  const success = await auth.register(form.value)

  if (success) {
    router.push({ name: 'home' })
  }
}
</script>

<template>
  <AuthLayout>
    <template #heading>
      <h1 class="text-xl font-semibold text-slate-900">Create an account</h1>
      <p class="text-sm text-slate-400 mt-1">Start managing your projects</p>
    </template>

    <form @submit.prevent="handleRegister" class="flex flex-col gap-4" novalidate>
      <FormField
        id="name"
        label="Full name"
        type="text"
        v-model="form.name"
        placeholder="Jane Smith"
        autocomplete="name"
        :error="errors.name?.[0]"
      />

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
        placeholder="Min. 8 characters"
        autocomplete="new-password"
        :error="errors.password?.[0]"
      />

      <FormField
        id="password_confirmation"
        label="Confirm password"
        type="password"
        v-model="form.password_confirmation"
        placeholder="Repeat your password"
        autocomplete="new-password"
        :error="errors.password_confirmation?.[0]"
      />

      <button
        type="submit"
        :disabled="loading"
        class="w-full py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed mt-1"
      >
        {{ loading ? 'Creating account…' : 'Create account' }}
      </button>
    </form>

    <template #footer>
      Already have an account?
      <RouterLink to="/login" class="text-blue-600 font-medium hover:underline ml-1">
        Sign in
      </RouterLink>
    </template>
  </AuthLayout>
</template>
