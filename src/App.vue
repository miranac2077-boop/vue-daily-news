<template>
  <div class="min-h-screen bg-slate-50">
    <AppHeader />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <!-- Hero banner -->
      <div class="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 sm:p-8 mb-8 text-white relative overflow-hidden">
        <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px); background-size: 30px 30px;"></div>
        <div class="relative">
          <div class="flex items-center gap-2 mb-2">
            <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span class="text-sm font-medium text-indigo-200">每日 AI/Tech 新闻</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-bold mb-1">Your Daily Briefing</h1>
          <p class="text-indigo-200 text-sm sm:text-base">
            浏览历史每日 AI 与科技新闻，点击日期切换。
          </p>
        </div>
      </div>

      <!-- Date switcher + filter bar -->
      <div class="bg-white rounded-xl border border-slate-200 p-4 mb-8 flex flex-col gap-4">

        <!-- Date tabs -->
        <div v-if="availableDates.length > 0" class="flex flex-wrap gap-2">
          <button
            v-for="date in availableDates"
            :key="date"
            @click="selectedDate = date"
            :class="[
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              selectedDate === date
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
              formatDateLabel(date).isToday ? 'ring-2 ring-indigo-400 ring-offset-1' : '',
            ]"
          >
            {{ formatDateLabel(date).label }}
            <span v-if="formatDateLabel(date).isToday" class="ml-1 text-xs opacity-75">今天</span>
          </button>
        </div>

        <!-- Category filter row -->
        <div class="flex flex-col sm:flex-row sm:items-center gap-4">
          <div class="flex items-center gap-2 text-sm font-medium text-slate-600 flex-shrink-0">
            <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter by:
          </div>
          <CategoryFilter
            :categories="categories"
            v-model="selectedCategory"
          />
          <div class="sm:ml-auto text-sm text-slate-400 flex-shrink-0">
            {{ totalCount }} articles
          </div>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-24 gap-4">
        <div class="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <p class="text-sm text-slate-400">Loading latest news...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center">
        <svg class="w-10 h-10 text-rose-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p class="text-rose-600 font-medium">Failed to load news</p>
        <p class="text-rose-400 text-sm mt-1">{{ error }}</p>
        <button @click="fetchNews" class="mt-4 px-4 py-2 bg-rose-600 text-white rounded-lg text-sm hover:bg-rose-700 transition-colors">
          Try again
        </button>
      </div>

      <!-- Empty state -->
      <div v-else-if="groupedArticles.length === 0" class="flex flex-col items-center justify-center py-24 gap-3">
        <svg class="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="text-slate-400 font-medium">No articles found</p>
        <p class="text-slate-300 text-sm">Try selecting a different category or date</p>
      </div>

      <!-- News grouped by date -->
      <div v-else class="space-y-12">
        <DateSection
          v-for="group in groupedArticles"
          :key="group.label"
          :label="group.label"
          :articles="group.articles"
        />
      </div>

    </main>

    <!-- Footer -->
    <footer class="mt-16 border-t border-slate-200 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-slate-400">
        <p>每日 AI/Tech 新闻 &mdash; Powered by Vue 3 + Vite + Tailwind CSS</p>
        <p class="mt-1">数据来源：Obsidian 每日新闻笔记 → <code class="bg-slate-100 px-1 py-0.5 rounded text-xs">scripts/sync-news.mjs</code> → <code class="bg-slate-100 px-1 py-0.5 rounded text-xs">public/news.json</code></p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import AppHeader from './components/AppHeader.vue'
import CategoryFilter from './components/CategoryFilter.vue'
import DateSection from './components/DateSection.vue'
import { useNews } from './composables/useNews.js'
import { categories } from './data/sampleNews.js'

const {
  loading,
  error,
  selectedCategory,
  selectedDate,
  availableDates,
  groupedArticles,
  filteredArticles,
  fetchNews,
  formatDateLabel,
} = useNews()

const totalCount = computed(() => filteredArticles.value.length)

onMounted(() => {
  fetchNews()
})
</script>
