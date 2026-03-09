import { ref, computed } from 'vue'

export function useProducts() {
  const allData = ref({})        // date-grouped: { "2026-03-09": { insight, products }, ... }
  const availableDates = ref([]) // sorted descending
  const selectedDate = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchProducts() {
    loading.value = true
    error.value = null

    try {
      const res = await fetch('/products.json', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          allData.value = data
          availableDates.value = Object.keys(data).sort().reverse()
          if (availableDates.value.length > 0) {
            selectedDate.value = availableDates.value[0]
          }
          loading.value = false
          return
        }
      }
    } catch {
      // /products.json not available
    }

    error.value = 'Failed to load products data'
    loading.value = false
  }

  const products = computed(() => {
    if (!selectedDate.value || !allData.value[selectedDate.value]) return []
    return allData.value[selectedDate.value].products || []
  })

  const insight = computed(() => {
    if (!selectedDate.value || !allData.value[selectedDate.value]) return ''
    return allData.value[selectedDate.value].insight || ''
  })

  // For the date switcher: format as "MM-DD" and mark today
  function formatDateLabel(dateStr) {
    const today = new Date().toISOString().slice(0, 10)
    if (dateStr === today) return { label: dateStr.slice(5), isToday: true }
    return { label: dateStr.slice(5), isToday: false }
  }

  return {
    loading,
    error,
    selectedDate,
    availableDates,
    products,
    insight,
    fetchProducts,
    formatDateLabel,
  }
}
