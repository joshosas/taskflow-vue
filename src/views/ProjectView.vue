<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectStore } from '@/stores/projects'
import { useTaskStore } from '@/stores/tasks'
import AppLayout from '@/components/AppLayout.vue'
import SidebarProjects from '@/components/SidebarProjects.vue'
import ProjectModal from '@/components/ProjectModal.vue'

const route = useRoute()
const router = useRouter()
const store = useProjectStore()
const tasks = useTaskStore()

const project = computed(() => store.find(route.params.id))

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

watch(
  () => route.params.id,
  async (id) => {
    if (!id) return
    if (!store.projects.length) await store.fetchProjects()
    await tasks.fetchTasks(id)
  },
  { immediate: true },
)

async function handleDelete() {
  if (!confirm(`Delete "${project.value?.name}"? This removes all its tasks too.`)) return
  const ok = await store.deleteProject(project.value.id)
  if (ok) router.push({ name: 'home' })
}

function onProjectUpdated() {
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
          <button
            @click="editModalOpen = true"
            class="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 transition"
          >
            Edit
          </button>

          <button
            @click="handleDelete"
            class="rounded-lg px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 transition"
          >
            Delete
          </button>
        </div>
      </div>

      <!-- Progress bar -->
      <div
        v-if="project && !tasks.loading"
        class="flex items-center gap-3 border-b border-slate-100 bg-white px-6 py-2.5"
      >
        <div class="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div
            class="h-full rounded-full bg-blue-500 transition-all duration-500"
            :style="{ width: tasks.completionPercent + '%' }"
          />
        </div>
        <span class="text-xs text-slate-400 shrink-0 tabular-nums">
          {{ tasks.completedCount }}/{{ tasks.totalCount }} done
        </span>
      </div>

      <!-- Tasks area -->
      <div class="flex-1 overflow-y-auto px-6 py-5">
        <!-- Loading skeleton -->
        <div v-if="tasks.loading" class="flex flex-col gap-2 animate-pulse">
          <div
            v-for="i in 4"
            :key="i"
            class="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
          >
            <div class="w-5 h-5 rounded-full bg-slate-200 shrink-0"></div>
            <div
              class="h-3 rounded-full bg-slate-200"
              :style="{ width: ['55%', '75%', '40%', '65%'][i - 1] }"
            ></div>
            <div class="ml-auto w-12 h-4 rounded-full bg-slate-100"></div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else-if="tasks.tasks.length === 0" class="flex h-full items-center justify-center">
          <div class="text-center">
            <p class="font-medium text-slate-500">No tasks yet</p>
            <p class="mt-1 text-sm text-slate-400">Add your first task below.</p>
          </div>
        </div>

        <!-- Task list -->
        <ul v-else class="flex flex-col gap-2">
          <li
            v-for="task in tasks.tasks"
            :key="task.id"
            class="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
            :class="task.completed ? 'opacity-60' : ''"
          >
            <!-- Completion toggle -->
            <button
              @click="tasks.toggleComplete(project.id, task)"
              class="w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition"
              :class="
                task.completed
                  ? 'bg-blue-600 border-blue-600'
                  : 'border-slate-300 hover:border-blue-400'
              "
            >
              <svg
                v-if="task.completed"
                class="w-3 h-3 text-white"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </button>

            <span
              :class="
                task.completed ? 'line-through text-slate-400 flex-1' : 'text-slate-700 flex-1'
              "
            >
              {{ task.title }}
            </span>

            <!-- Priority badge -->
            <span
              class="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
              :class="{
                'bg-red-50 text-red-600': task.priority === 'high',
                'bg-amber-50 text-amber-600': task.priority === 'medium',
                'bg-slate-100 text-slate-500': task.priority === 'low',
              }"
            >
              {{ task.priority }}
            </span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Edit modal -->
    <ProjectModal v-model="editModalOpen" :project="project" @saved="onProjectUpdated" />
  </AppLayout>
</template>
