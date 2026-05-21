<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectStore } from '@/stores/projects'
import ProjectModal from '@/components/ProjectModal.vue'

const route = useRoute()
const router = useRouter()
const store = useProjectStore()

const search = ref('')
const modalOpen = ref(false)

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

// Client-side search filter — no extra API calls
const filteredProjects = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return store.projects
  return store.projects.filter((p) => p.name.toLowerCase().includes(q))
})

function isActive(id) {
  return route.name === 'project' && parseInt(route.params.id) === id
}

function onProjectSaved(project) {
  // Navigate to the newly created project
  router.push({ name: 'project', params: { id: project.id } })
}
</script>

<template>
  <div class="flex flex-col gap-1">
    <!-- Search -->
    <div class="mb-2 px-1">
      <input
        v-model="search"
        type="text"
        placeholder="Search projects…"
        class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm outline-none focus:border-blue-400 focus:bg-white transition"
      />
    </div>

    <!-- New project button -->
    <button
      @click="modalOpen = true"
      class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 transition"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
      New project
    </button>

    <!-- Loading skeletons -->
    <template v-if="store.loading">
      <div
        v-for="i in 4"
        :key="i"
        class="flex items-center gap-2.5 rounded-lg px-3 py-2 animate-pulse"
      >
        <div class="w-2.5 h-2.5 rounded-full bg-slate-200 shrink-0"></div>
        <div
          class="h-2.5 rounded-full bg-slate-200"
          :style="{ width: `${[60, 80, 50, 70][i - 1]}%` }"
        ></div>
      </div>
    </template>

    <!-- Project list -->
    <template v-else>
      <TransitionGroup
        enter-active-class="transition-all duration-200"
        enter-from-class="opacity-0 -translate-x-2"
        leave-active-class="transition-all duration-150"
        leave-to-class="opacity-0 -translate-x-2"
      >
        <RouterLink
          v-for="project in filteredProjects"
          :key="project.id"
          :to="{ name: 'project', params: { id: project.id } }"
          class="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition group"
          :class="
            isActive(project.id)
              ? 'bg-blue-50 text-blue-700 font-medium'
              : 'text-slate-600 hover:bg-slate-100'
          "
        >
          <!-- Color dot -->
          <span
            class="w-2.5 h-2.5 rounded-full shrink-0 transition-transform group-hover:scale-110"
            :class="colorMap[project.color]"
          />

          <span class="flex-1 truncate">{{ project.name }}</span>

          <!-- Task count -->
          <span
            class="text-xs ml-auto shrink-0"
            :class="isActive(project.id) ? 'text-blue-400' : 'text-slate-400'"
          >
            {{ project.tasks_count ?? 0 }}
          </span>
        </RouterLink>
      </TransitionGroup>

      <!-- Empty state -->
      <p v-if="!filteredProjects.length && !store.loading" class="px-3 py-2 text-xs text-slate-400">
        {{ search ? 'No projects match.' : 'No projects yet.' }}
      </p>
    </template>

    <!-- Create modal -->
    <ProjectModal v-model="modalOpen" @saved="onProjectSaved" />
  </div>
</template>
