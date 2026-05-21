<script setup>
import { onMounted } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import SidebarProjects from '@/components/SidebarProjects.vue'
import { useProjectStore } from '@/stores/projects'

const store = useProjectStore()

// Fetch projects when the app first loads
onMounted(() => store.fetchProjects())
</script>

<template>
  <AppLayout>
    <template #sidebar>
      <SidebarProjects />
    </template>

    <div class="flex h-full items-center justify-center">
      <div class="text-center">
        <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
          <svg
            class="w-7 h-7 text-blue-400"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75
                 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25
                 0 0 0 2.25 9v.75"
            />
          </svg>
        </div>
        <p class="font-medium text-slate-600">No project selected</p>
        <p class="mt-1 text-sm text-slate-400">Pick one from the sidebar or create a new one.</p>
      </div>
    </div>
  </AppLayout>
</template>
