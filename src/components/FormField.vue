<script setup>
defineProps({
  id: { type: String, required: true },
  label: { type: String, default: '' },
  type: { type: String, default: 'text' },
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  autocomplete: { type: String, default: 'off' },
  error: { type: String, default: '' }, // first error message for this field
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" :for="id" class="text-xs font-medium text-slate-500">
      {{ label }}
    </label>

    <input
      :id="id"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      @input="$emit('update:modelValue', $event.target.value)"
      class="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition"
      :class="
        error
          ? 'border-red-400 bg-red-50 focus:border-red-500'
          : 'border-slate-200 bg-white focus:border-blue-400'
      "
    />

    <!-- Error message from Laravel 422 response -->
    <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
  </div>
</template>
