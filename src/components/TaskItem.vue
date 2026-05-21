<script setup>
defineProps({
  task: { type: Object, required: true },
})

defineEmits(['toggle', 'delete'])
</script>

<template>
  <li
    class="flex items-center gap-3 rounded-xl border bg-white px-4 py-3 text-sm transition-all duration-200 group"
    :class="
      task.completed
        ? 'border-slate-100 opacity-60'
        : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
    "
  >
    <!-- Completion toggle -->
    <button
      @click="$emit('toggle', task)"
      class="w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all duration-150"
      :class="
        task.completed
          ? 'bg-blue-600 border-blue-600'
          : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50'
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

    <!-- Title -->
    <span
      class="flex-1 leading-snug transition-colors duration-150"
      :class="task.completed ? 'line-through text-slate-400' : 'text-slate-700'"
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

    <!-- Delete button — visible on hover -->
    <button
      @click="$emit('delete', task.id)"
      class="shrink-0 rounded-lg p-1 text-slate-300 transition-all duration-150 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-50"
      title="Delete task"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165
             L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772
             5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114
             1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964
             51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
        />
      </svg>
    </button>
  </li>
</template>
