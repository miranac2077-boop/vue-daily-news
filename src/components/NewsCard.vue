<template>
  <article class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
    <!-- Image -->
    <div v-if="article.urlToImage" class="relative h-48 overflow-hidden bg-slate-100">
      <img
        :src="article.urlToImage"
        :alt="article.title"
        class="w-full h-full object-cover"
        loading="lazy"
        @error="hideImage"
        ref="imgRef"
      />
      <span class="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full" :class="categoryColor">
        {{ categoryLabel }}
      </span>
    </div>
    <div v-else class="relative h-12 bg-gradient-to-r from-slate-100 to-slate-50 flex items-center px-4">
      <span class="text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full" :class="categoryColor">
        {{ categoryLabel }}
      </span>
    </div>

    <!-- Content -->
    <div class="p-5 flex flex-col flex-1">
      <!-- Source + Date -->
      <div class="flex items-center justify-between mb-3">
        <span class="flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 12h6" />
          </svg>
          {{ article.source?.name || 'Unknown' }}
        </span>
        <time class="text-xs text-slate-400" :datetime="article.publishedAt">
          {{ formattedTime }}
        </time>
      </div>

      <!-- Title -->
      <h2 class="text-base font-semibold text-slate-800 leading-snug mb-2 line-clamp-2 flex-shrink-0">
        {{ article.title }}
      </h2>

      <!-- Description -->
      <p v-if="article.description" class="text-sm text-slate-500 leading-relaxed line-clamp-3 flex-1">
        {{ article.description }}
      </p>

      <!-- Read more -->
      <div class="mt-4 pt-4 border-t border-slate-100">
        <a
          :href="article.url"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          Read full article
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  article: {
    type: Object,
    required: true,
  },
})

const imgRef = ref(null)

function hideImage() {
  if (imgRef.value) {
    imgRef.value.parentElement.style.display = 'none'
  }
}

const formattedTime = computed(() => {
  const date = new Date(props.article.publishedAt)
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
})

const categoryColors = {
  technology: 'text-blue-600',
  business: 'text-emerald-600',
  sports: 'text-orange-600',
  general: 'text-purple-600',
  health: 'text-rose-600',
  science: 'text-cyan-600',
  entertainment: 'text-pink-600',
}

const categoryLabels = {
  technology: 'Tech',
  business: 'Business',
  sports: 'Sports',
  general: 'General',
  health: 'Health',
  science: 'Science',
  entertainment: 'Entertainment',
}

const categoryColor = computed(() => categoryColors[props.article.category] || 'text-slate-600')
const categoryLabel = computed(() => categoryLabels[props.article.category] || props.article.category || 'News')
</script>
