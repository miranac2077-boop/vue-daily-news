<template>
  <section>
    <!-- Section header -->
    <div class="flex items-center gap-4 mb-5">
      <div class="flex items-center gap-2.5">
        <span v-if="label === 'Today'" class="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse inline-block"></span>
        <span v-else class="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block"></span>
        <h2 class="text-xl font-bold text-slate-800">{{ label }}</h2>
        <span class="text-sm text-slate-400 font-normal">{{ formattedDate }}</span>
      </div>
      <div class="flex-1 h-px bg-slate-200"></div>
      <span class="text-xs text-slate-400 font-medium">{{ articles.length }} {{ articles.length === 1 ? 'story' : 'stories' }}</span>
    </div>

    <!-- Cards grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <NewsCard
        v-for="article in articles"
        :key="article.id || article.url"
        :article="article"
      />
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import NewsCard from './NewsCard.vue'

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  articles: {
    type: Array,
    required: true,
  },
})

const formattedDate = computed(() => {
  if (!props.articles.length) return ''
  const date = new Date(props.articles[0].publishedAt)
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
})
</script>
