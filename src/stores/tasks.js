import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/lib/axios'

export const useTaskStore = defineStore('tasks', () => {
  // ── State ────────────────────────────────────────────────────────────
  const tasks = ref([])
  const activeProjectId = ref(null)
  const loading = ref(false)
  const saving = ref(false)
  const errors = ref({})

  // ── Getters ──────────────────────────────────────────────────────────

  // Total tasks in the active project
  const totalCount = computed(() => tasks.value.length)

  // How many are completed
  const completedCount = computed(() => tasks.value.filter((t) => t.completed).length)

  // How many high priority tasks are still open
  const highPriorityCount = computed(
    () => tasks.value.filter((t) => t.priority === 'high' && !t.completed).length,
  )

  // Completion percentage — 0 if no tasks yet
  const completionPercent = computed(() => {
    if (totalCount.value === 0) return 0
    return Math.round((completedCount.value / totalCount.value) * 100)
  })

  // ── Helpers ──────────────────────────────────────────────────────────
  function clearErrors() {
    errors.value = {}
  }

  function handleError(err) {
    if (err.response?.status === 422) {
      errors.value = err.response.data.errors ?? {}
    } else {
      throw err
    }
  }

  // ── Actions ──────────────────────────────────────────────────────────

  // Fetch all tasks for a project.
  // Called whenever the active project changes — clears stale tasks
  // immediately so the old project's tasks never flash on screen.
  async function fetchTasks(projectId) {
    // Clear previous project's tasks right away before the request
    // goes out — avoids a flash of stale data while loading
    tasks.value = []
    activeProjectId.value = projectId
    loading.value = true

    try {
      const { data } = await api.get(`/api/projects/${projectId}/tasks`)
      tasks.value = data.data
    } finally {
      loading.value = false
    }
  }

  async function createTask(projectId, form) {
    clearErrors()
    saving.value = true

    try {
      const { data } = await api.post(`/api/projects/${projectId}/tasks`, form)

      // Insert at the top — matches the API's orderBy(completed) sort
      // so new incomplete tasks appear above completed ones
      tasks.value.unshift(data.data)

      return data.data
    } catch (err) {
      handleError(err)
      return null
    } finally {
      saving.value = false
    }
  }

  async function toggleComplete(projectId, task) {
    // Optimistic update — flip the value locally before the API responds
    // so the UI reacts instantly with no perceived lag
    const index = tasks.value.findIndex((t) => t.id === task.id)
    if (index === -1) return

    tasks.value[index].completed = !tasks.value[index].completed

    try {
      const { data } = await api.put(`/api/projects/${projectId}/tasks/${task.id}`, {
        completed: tasks.value[index].completed,
      })
      // Confirm with the server's actual value in case something differs
      tasks.value[index] = data.data
    } catch {
      // Rollback the optimistic update if the request failed
      tasks.value[index].completed = !tasks.value[index].completed
    }
  }

  async function deleteTask(projectId, taskId) {
    try {
      await api.delete(`/api/projects/${projectId}/tasks/${taskId}`)

      // Remove from local array
      tasks.value = tasks.value.filter((t) => t.id !== taskId)

      return true
    } catch {
      return false
    }
  }

  async function updateTask(projectId, taskId, form) {
    clearErrors()
    saving.value = true

    try {
      const { data } = await api.put(`/api/projects/${projectId}/tasks/${taskId}`, form)

      const index = tasks.value.findIndex((t) => t.id === taskId)
      if (index !== -1) tasks.value[index] = data.data

      return data.data
    } catch (err) {
      handleError(err)
      return null
    } finally {
      saving.value = false
    }
  }

  return {
    // State
    tasks,
    activeProjectId,
    loading,
    saving,
    errors,
    // Getters
    totalCount,
    completedCount,
    highPriorityCount,
    completionPercent,
    // Actions
    fetchTasks,
    createTask,
    toggleComplete,
    deleteTask,
    updateTask,
    clearErrors,
  }
})
