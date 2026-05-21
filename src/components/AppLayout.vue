<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

// ── Sidebar toggle ────────────────────────────────────────────────────────
// Starts closed on mobile, always visible on desktop via CSS
const sidebarOpen = ref(false)
const isDesktop = ref(false)

function checkBreakpoint() {
  // lg breakpoint is 1024px — mirrors Tailwind's lg: prefix
  isDesktop.value = window.innerWidth >= 1024
  // Close sidebar when resizing up to desktop so it doesn't
  // stay "open" if the user resizes back down to mobile
  if (isDesktop.value) sidebarOpen.value = false
}

onMounted(() => {
  checkBreakpoint()
  window.addEventListener('resize', checkBreakpoint)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkBreakpoint)
})

// ── User initials for the avatar ──────────────────────────────────────────
const userInitials = computed(() => {
  const name = auth.user?.name ?? ''
  return name
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
})

// ── Logout ────────────────────────────────────────────────────────────────
async function handleLogout() {
  await auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="h-screen flex overflow-hidden bg-slate-50">
    <!-- ── Mobile overlay ──────────────────────────────────────────── -->
    <!-- Sits behind the sidebar, closes it when tapped -->
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-200"
      leave-to-class="opacity-0"
    >
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 z-20 bg-black/30 lg:hidden"
        @click="sidebarOpen = false"
      />
    </Transition>

    <!-- ── Sidebar ─────────────────────────────────────────────────── -->
    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      enter-from-class="-translate-x-full"
      leave-active-class="transition-transform duration-300 ease-in"
      leave-to-class="-translate-x-full"
    >
      <aside
        v-show="sidebarOpen || isDesktop"
        class="fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-white border-r border-slate-200 lg:relative lg:z-auto lg:translate-x-0"
      >
        <!-- Sidebar header -->
        <div class="flex h-16 items-center gap-2.5 border-b border-slate-200 px-5 shrink-0">
          <!-- Logo mark -->
          <div class="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
            <svg class="w-5 h-5" viewBox="0 0 64 64" fill="none">
              <rect x="11" y="18" width="24" height="4" rx="2" fill="white" opacity="0.4" />
              <rect x="11" y="26" width="17" height="4" rx="2" fill="white" opacity="0.25" />
              <circle cx="32" cy="42" r="12" stroke="white" stroke-width="2.5" opacity="0.6" />
              <polyline
                points="25,42 30,48 40,35"
                stroke="white"
                stroke-width="3.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <span class="font-semibold text-slate-900 tracking-tight">TaskFlow</span>

          <!-- Close button — mobile only -->
          <button
            class="ml-auto rounded-lg p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition lg:hidden"
            @click="sidebarOpen = false"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Sidebar nav — slot so pages control what goes here -->
        <nav class="flex-1 overflow-y-auto py-4 px-3">
          <slot name="sidebar" />
        </nav>

        <!-- Sidebar footer — user info + logout -->
        <div class="border-t border-slate-200 p-3 shrink-0">
          <div
            class="flex items-center gap-2.5 rounded-xl px-3 py-2.5 hover:bg-slate-50 transition group"
          >
            <!-- Avatar initials -->
            <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <span class="text-xs font-semibold text-blue-700">
                {{ userInitials }}
              </span>
            </div>

            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-slate-800 truncate">{{ auth.user?.name }}</p>
              <p class="text-xs text-slate-400 truncate">{{ auth.user?.email }}</p>
            </div>

            <!-- Logout button -->
            <button
              @click="handleLogout"
              :disabled="auth.loading"
              class="shrink-0 rounded-lg p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 transition opacity-0 group-hover:opacity-100"
              title="Sign out"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25
                     2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0
                     0 3 3m-3-3h12.75"
                />
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </Transition>

    <!-- ── Main area ───────────────────────────────────────────────── -->
    <div class="flex flex-1 flex-col min-w-0 overflow-hidden">
      <!-- Mobile topbar — only visible below lg breakpoint -->
      <header
        class="flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-4 shrink-0 lg:hidden"
      >
        <!-- Hamburger -->
        <button
          @click="sidebarOpen = true"
          class="rounded-lg p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>

        <span class="font-semibold text-slate-800 text-sm">TaskFlow</span>
      </header>

      <!-- Page content -->
      <main class="flex-1 overflow-y-auto">
        <slot />
      </main>
    </div>
  </div>
</template>
