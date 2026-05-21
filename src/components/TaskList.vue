<script setup>
import { ref, computed } from 'vue'
import { useTaskStore } from '@/stores/tasks'
import TaskItem from '@/components/TaskItem.vue'

const props = defineProps({
  projectId: { type: [String, Number], required: true },
})

const store = useTaskStore()

// ── Add task form state ───────────────────────────────────────────────────
const newTitle = ref('')
const newPriority = ref('medium')

// ── Filter state ──────────────────────────────────────────────────────────
const search = ref('')
const filter = ref('all')

const tabs = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Done' },
]

// ── Computed filtered list ────────────────────────────────────────────────
// Runs entirely on client — no API calls on search or filter change.
// Depends on store.tasks, search, and filter — recomputes when any changes.
const filteredTasks = computed(() => {
  let list = store.tasks

  // Status filter
  if (filter.value === 'active') {
    list = list.filter((t) => !t.completed)
  } else if (filter.value === 'completed') {
    list = list.filter((t) => t.completed)
  }

  // Search — case-insensitive title match
  const q = search.value.trim().toLowerCase()
  if (q) {
    list = list.filter((t) => t.title.toLowerCase().includes(q))
  }

  return list
})

const emptyMessage = computed(() => {
  if (search.value) return 'No tasks match your search.'
  if (filter.value === 'active') return 'No active tasks — nice work!'
  if (filter.value === 'completed') return 'No completed tasks yet.'
  return 'No tasks yet.'
})

// ── Actions ──────────────────────────────────────────────────────────────
async function handleAddTask() {
  if (!newTitle.value.trim()) return

  const result = await store.createTask(props.projectId, {
    title: newTitle.value.trim(),
    priority: newPriority.value,
  })

  if (result) {
    // Only reset on success — keep input filled if there's a validation error
    newTitle.value = ''
    newPriority.value = 'medium'
  }
}

function handleToggle(task) {
  store.toggleComplete(props.projectId, task)
}

async function handleDelete(taskId) {
  if (!confirm('Remove this task?')) return
  await store.deleteTask(props.projectId, taskId)
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- ── Add task form ──────────────────────────────────────────────── -->
    <form @submit.prevent="handleAddTask" class="flex gap-2" novalidate>
      <div class="flex-1 flex flex-col gap-1">
        <input
          v-model="newTitle"
          type="text"
          placeholder="Add a task and press Enter…"
          class="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition"
          :class="
            store.errors.title
              ? 'border-red-400 bg-red-50'
              : 'border-slate-200 focus:border-blue-400'
          "
        />
        <p v-if="store.errors.title" class="text-xs text-red-500">
          {{ store.errors.title[0] }}
        </p>
      </div>

      <!-- Priority selector -->
      <select
        v-model="newPriority"
        class="rounded-lg border border-slate-200 bg-white px-2 py-2.5 text-sm outline-none focus:border-blue-400 transition"
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      <button
        type="submit"
        :disabled="store.saving"
        class="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-60 shrink-0"
      >
        {{ store.saving ? '…' : 'Add' }}
      </button>
    </form>

    <!-- ── Toolbar: search + filter ──────────────────────────────────── -->
    <div class="flex flex-col gap-2 sm:flex-row">
      <!-- Search -->
      <input
        v-model="search"
        type="text"
        placeholder="Search tasks…"
        class="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:bg-white transition"
      />

      <!-- Filter tabs -->
      <div class="flex overflow-hidden rounded-lg border border-slate-200 text-sm shrink-0">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          @click="filter = tab.value"
          class="px-3 py-2 transition"
          :class="
            filter === tab.value
              ? 'bg-blue-600 text-white font-medium'
              : 'text-slate-500 hover:bg-slate-50'
          "
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- ── Task list ──────────────────────────────────────────────────── -->

    <!-- Loading skeleton -->
    <div v-if="store.loading" class="flex flex-col gap-2 animate-pulse">
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

    <template v-else>
      <!-- Animated task list -->
      <TransitionGroup
        tag="ul"
        class="flex flex-col gap-2"
        enter-active-class="transition-all duration-200"
        enter-from-class="opacity-0 -translate-y-1"
        leave-active-class="transition-all duration-150 absolute w-full"
        leave-to-class="opacity-0 -translate-y-1"
      >
        <TaskItem
          v-for="task in filteredTasks"
          :key="task.id"
          :task="task"
          @toggle="handleToggle"
          @delete="handleDelete"
        />
      </TransitionGroup>

      <!-- Empty states -->
      <div
        v-if="filteredTasks.length === 0"
        class="flex flex-col items-center justify-center py-16 text-center"
      >
        <p class="font-medium text-slate-500">
          {{ emptyMessage }}
        </p>
        <p v-if="!search && filter === 'all'" class="mt-1 text-sm text-slate-400">
          Type a task above and press Enter to add one.
        </p>
      </div>
    </template>
  </div>
</template>
