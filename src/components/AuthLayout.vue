<script setup></script>

<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Logo mark -->
      <div class="flex items-center justify-center gap-2.5 mb-8">
        <div class="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
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
        <span class="text-xl font-semibold text-slate-900 tracking-tight">TaskFlow</span>
      </div>

      <!-- Card -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <!-- Heading slot — title and subtitle vary per page -->
        <div class="mb-6">
          <slot name="heading" />
        </div>

        <!-- Form content -->
        <slot />
      </div>

      <!-- Footer link slot — "Already have an account?" etc -->
      <div class="mt-5 text-center text-sm text-slate-500">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>
