<template>
  <article class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
    <!-- Card header: rank + title + score -->
    <div class="px-5 pt-5 pb-3 flex items-start justify-between gap-3">
      <div class="flex items-center gap-2 min-w-0">
        <span class="text-xl flex-shrink-0 leading-none">{{ rankEmoji }}</span>
        <h2 class="text-base font-semibold text-slate-800 leading-snug line-clamp-2">
          {{ product.title }}
        </h2>
      </div>
      <span class="flex-shrink-0 text-sm font-bold tabular-nums" :class="scoreColor">
        {{ product.score }}<span class="font-normal text-xs text-slate-400">/100</span>
      </span>
    </div>

    <!-- Description -->
    <div class="px-5 pb-3 flex-1">
      <p v-if="product.description" class="text-sm text-slate-500 leading-relaxed line-clamp-4">
        {{ product.description }}
      </p>
    </div>

    <!-- Meta: team + popularity -->
    <div class="px-5 pb-4 space-y-1.5">
      <p v-if="product.team" class="text-xs text-slate-500 truncate">
        <span class="mr-1">🏢</span>{{ product.team }}
      </p>
      <p v-if="product.popularity" class="text-xs text-slate-500 truncate">
        <span class="mr-1">📊</span>{{ product.popularity }}
      </p>
    </div>

    <!-- Linda's opinion -->
    <div v-if="product.opinion" class="mx-4 mb-4 bg-violet-50 rounded-lg p-3">
      <p class="text-xs font-semibold text-violet-600 mb-1">💡 Linda 的观点</p>
      <p class="text-xs text-violet-700 leading-relaxed line-clamp-3">
        {{ product.opinion }}
      </p>
    </div>

    <!-- Footer: link -->
    <div class="mt-auto px-5 py-4 border-t border-slate-100">
      <a
        v-if="product.url"
        :href="product.url"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors float-right"
      >
        🔗 查看产品
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
      <div class="clear-both"></div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
  rank: {
    type: Number,
    default: 0,
  },
})

const rankEmoji = computed(() => {
  if (props.rank === 1) return '🥇'
  if (props.rank === 2) return '🥈'
  if (props.rank === 3) return '🥉'
  return `${props.rank}.`
})

const scoreColor = computed(() => {
  if (props.product.score >= 85) return 'text-emerald-600'
  if (props.product.score >= 70) return 'text-amber-600'
  return 'text-slate-500'
})
</script>
