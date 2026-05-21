<script setup>
import { ref, watch } from 'vue'
import { useProjectStore } from '@/stores/projects'
import FormField from '@/components/FormField.vue'

const props = defineProps({
  // v-model controls open/closed state
  modelValue: { type: Boolean, default: false },
  // Pass a project object to edit, null to create
  project: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const store = useProjectStore()

const colors = ['slate', 'red', 'orange', 'amber', 'green', 'teal', 'blue', 'violet', 'pink']

// Tailwind class maps — avoids dynamic class strings that get purged by JIT
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

const ringMap = {
  slate: 'ring-slate-500',
  red: 'ring-red-500',
  orange: 'ring-orange-500',
  amber: 'ring-amber-500',
  green: 'ring-green-500',
  teal: 'ring-teal-500',
  blue: 'ring-blue-500',
  violet: 'ring-violet-500',
  pink: 'ring-pink-500',
}

// ── Form state ──────────────────────────────────────────────────────────────
const form = ref({ name: '', description: '', color: 'blue' })

// When the modal opens, populate form from the project prop (edit)
// or reset to defaults (create)
watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      store.clearErrors()
      form.value = props.project
        ? {
            name: props.project.name,
            description: props.project.description ?? '',
            color: props.project.color,
          }
        : { name: '', description: '', color: 'blue' }
    }
  },
)

// ── Actions ─────────────────────────────────────────────────────────────────
function close() {
  emit('update:modelValue', false)
}

async function handleSubmit() {
  const result = props.project
    ? await store.updateProject(props.project.id, form.value)
    : await store.createProject(form.value)

  if (result) {
    // Emit the saved project up so the parent can react
    // (e.g. navigate to the new project)
    emit('saved', result)
    close()
  }
  // If result is null, store.errors is populated — form stays open
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-200"
      leave-to-class="opacity-0"
    >
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/30" @click="close" />

        <!-- Panel -->
        <Transition
          enter-active-class="transition-all duration-200"
          enter-from-class="opacity-0 scale-95"
          leave-active-class="transition-all duration-150"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="modelValue"
            class="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-xl p-6"
          >
            <h2 class="text-base font-semibold text-slate-900 mb-5">
              {{ project ? 'Edit project' : 'New project' }}
            </h2>

            <form @submit.prevent="handleSubmit" class="flex flex-col gap-4" novalidate>
              <!-- Name -->
              <FormField
                id="proj-name"
                label="Project name"
                v-model="form.name"
                placeholder="e.g. Website Redesign"
                :error="store.errors.name?.[0]"
                autofocus
              />

              <!-- Description -->
              <div class="flex flex-col gap-1.5">
                <label for="proj-desc" class="text-xs font-medium text-slate-500">
                  Description <span class="font-normal">(optional)</span>
                </label>
                <textarea
                  id="proj-desc"
                  v-model="form.description"
                  rows="2"
                  placeholder="What's this project about?"
                  class="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 transition resize-none"
                  :class="store.errors.description ? 'border-red-400 bg-red-50' : ''"
                />
                <p v-if="store.errors.description" class="text-xs text-red-500">
                  {{ store.errors.description[0] }}
                </p>
              </div>

              <!-- Color picker -->
              <div class="flex flex-col gap-2">
                <span class="text-xs font-medium text-slate-500">Color</span>
                <div class="flex gap-2 flex-wrap">
                  <button
                    v-for="c in colors"
                    :key="c"
                    type="button"
                    @click="form.color = c"
                    class="w-6 h-6 rounded-full transition ring-offset-2"
                    :class="[colorMap[c], form.color === c ? `ring-2 ${ringMap[c]}` : '']"
                  />
                </div>
              </div>

              <!-- Actions -->
              <div class="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  @click="close"
                  class="px-4 py-2 text-sm rounded-lg text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="store.saving"
                  class="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-60"
                >
                  {{ store.saving ? 'Saving…' : project ? 'Update' : 'Create' }}
                </button>
              </div>
            </form>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
