<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectStore } from '@/stores/projects'
import AppLayout from '@/components/AppLayout.vue'
import SidebarProjects from '@/components/SidebarProjects.vue'
import ProjectModal from '@/components/ProjectModal.vue'

const route = useRoute()
const router = useRouter()
const store = useProjectStore()

const editModalOpen = ref(false)

const colorMap = {
  slate: 'bg-slate-500',
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  amber: 'bg-amber-500',
  green: 'bg-green-500',
  teal: 'bg-teal-500',
  blue: 'bg-blue-500',
  violet: 'bg-violet-500',
  pink: 'bg-pink-500',
}

// Pull the project from the store using the route param.
// If the store is empty (hard refresh on this URL), fetchProjects
// fills it and the computed re-evaluates automatically.
const project = computed(() => store.find(route.params.id))

onMounted(async () => {
  if (!store.projects.length) {
    await store.fetchProjects()
  }
})

async function handleDelete() {
  if (!confirm(`Delete "${project.value?.name}"? This removes all its tasks too.`)) return

  const ok = await store.deleteProject(project.value.id)
  if (ok) router.push({ name: 'home' })
}

function onProjectUpdated() {
  // Project is already updated in the store — computed re-renders automatically
  editModalOpen.value = false
}
</script>

<template>
  <AppLayout>
    <template #sidebar>
      <SidebarProjects />
    </template>

    <div class="flex h-full flex-col">
      <!-- Project header -->
      <div
        v-if="project"
        class="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-6 py-4"
      >
        <span class="w-3 h-3 rounded-full shrink-0" :class="colorMap[project.color]" />
        <h1 class="text-lg font-semibold text-slate-900">{{ project.name }}</h1>

        <span v-if="project.description" class="hidden text-sm text-slate-400 sm:inline">
          — {{ project.description }}
        </span>

        <div class="ml-auto flex items-center gap-2">
          <!-- Edit -->
          <button
            @click="editModalOpen = true"
            class="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 transition"
          >
            Edit
          </button>

          <!-- Delete -->
          <button
            @click="handleDelete"
            class="rounded-lg px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 transition"
          >
            Delete
          </button>
        </div>
      </div>

      <!-- Tasks area (Phase 4) -->
      <div class="flex-1 overflow-y-auto px-6 py-5">
        <p class="text-sm text-slate-400">Tasks coming in Phase 4…</p>
      </div>
    </div>

    <!-- Edit modal -->
    <ProjectModal v-model="editModalOpen" :project="project" @saved="onProjectUpdated" />
  </AppLayout>
</template>
