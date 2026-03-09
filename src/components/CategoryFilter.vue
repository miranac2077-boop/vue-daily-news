<template>
  <div class="flex items-center gap-2 flex-wrap">
    <button
      v-for="cat in categories"
      :key="cat.id"
      @click="$emit('update:modelValue', cat.id)"
      :class="[
        'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap',
        modelValue === cat.id
          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
          : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600',
      ]"
    >
      <span v-if="cat.id !== 'all'" class="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle" :class="dotColor(cat.id)"></span>
      {{ cat.label }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  categories: {
    type: Array,
    required: true,
  },
  modelValue: {
    type: String,
    required: true,
  },
})

defineEmits(['update:modelValue'])

const dots = {
  technology: 'bg-blue-500',
  business: 'bg-emerald-500',
  sports: 'bg-orange-500',
  general: 'bg-purple-500',
  war: 'bg-red-600',
}

function dotColor(id) {
  return dots[id] || 'bg-slate-400'
}
</script>
