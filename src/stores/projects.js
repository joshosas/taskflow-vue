import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/lib/axios'

export const useProjectStore = defineStore('projects', () => {
  // ── State ────────────────────────────────────────────────────────────
  const projects = ref([])
  const loading = ref(false)
  const saving = ref(false) // separate flag for modal save button
  const errors = ref({})

  // ── Getters ──────────────────────────────────────────────────────────
  // Find a single project from the local array — avoids an extra API
  // call when the project is already in the list
  function find(id) {
    return projects.value.find((p) => p.id === parseInt(id)) ?? null
  }

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
  async function fetchProjects() {
    loading.value = true

    try {
      const { data } = await api.get('/api/projects')
      projects.value = data.data // unwrap Laravel's { data: [...] }
    } finally {
      loading.value = false
    }
  }

  async function createProject(form) {
    clearErrors()
    saving.value = true

    try {
      const { data } = await api.post('/api/projects', form)

      // Prepend so the new project appears at the top of the sidebar
      projects.value.unshift(data.data)

      return data.data // return the created project to the caller
    } catch (err) {
      handleError(err)
      return null
    } finally {
      saving.value = false
    }
  }

  async function updateProject(id, form) {
    clearErrors()
    saving.value = true

    try {
      const { data } = await api.put(`/api/projects/${id}`, form)

      // Replace the stale project in the array with the fresh one
      const index = projects.value.findIndex((p) => p.id === id)
      if (index !== -1) projects.value[index] = data.data

      return data.data
    } catch (err) {
      handleError(err)
      return null
    } finally {
      saving.value = false
    }
  }

  async function deleteProject(id) {
    try {
      await api.delete(`/api/projects/${id}`)

      // Remove from local array — no need to refetch the whole list
      projects.value = projects.value.filter((p) => p.id !== id)

      return true
    } catch {
      return false
    }
  }

  return {
    // State
    projects,
    loading,
    saving,
    errors,
    // Actions
    find,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    clearErrors,
  }
})
