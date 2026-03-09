#!/usr/bin/env node
/**
 * classify-news.mjs
 *
 * Post-process news.json: for each article that has category='technology'
 * (or any category that might be wrong), ask ollama qwen3:14b to re-classify
 * it into one of: technology / business / sports / war / general
 *
 * Only re-classifies articles whose source file had NO explicit section headings
 * (i.e. old single-category format). Articles from multi-category files already
 * have correct categories and are skipped.
 *
 * Usage:
 *   node scripts/classify-news.mjs [--date 2026-03-08] [--all] [--dry-run]
 *
 * Options:
 *   --date YYYY-MM-DD   Only classify articles for that date
 *   --all               Re-classify ALL articles regardless of current category
 *   --dry-run           Print classifications without writing to file
 */

import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const NEWS_JSON_PATH = join(__dirname, '..', 'public', 'news.json')
const OBSIDIAN_DIR = '/Users/dreambot/Documents/Obsidian/main/每日新闻'

const OLLAMA_URL = 'http://localhost:11434/api/generate'
const MODEL = 'qwen3:14b'

const VALID_CATEGORIES = ['technology', 'business', 'sports', 'war', 'general']

const CATEGORY_LABELS = {
  technology: '科技',
  business: '商业',
  sports: '体育',
  war: '军事',
  general: '综合',
}

// Parse CLI args
const args = process.argv.slice(2)
const filterDate = args.includes('--date') ? args[args.indexOf('--date') + 1] : null
const classifyAll = args.includes('--all')
const dryRun = args.includes('--dry-run')

/**
 * Check whether a markdown file has explicit section headings (multi-category format).
 * If it does, its articles already have correct categories from parseMarkdown.
 */
function fileHasSectionHeadings(date) {
  try {
    const content = readFileSync(`${OBSIDIAN_DIR}/${date}.md`, 'utf8')
    return /^##\s+(🔥|💼|🏆|⚔️|科技|Technology|Business|商业|Sport|体育|War|军事)/m.test(content)
  } catch {
    return false
  }
}

/**
 * Classify a single article using ollama (chat API, thinking disabled).
 * Returns one of: technology | business | sports | war | general
 */
async function classifyArticle(title, description) {
  const userMsg = `You are a news classifier. Classify the following news article into EXACTLY ONE of these categories:
- technology (科技): AI, software, hardware, internet, apps, science & tech
- business (商业): finance, economy, markets, companies, trade, investment
- sports (体育): sports events, athletes, competitions, leagues
- war (军事): military, warfare, weapons, defense, armed conflicts, geopolitical tensions involving military force
- general (综合): health, politics, society, environment, culture, anything else

Title: ${title}
Summary: ${description || '(no summary)'}

Respond with ONLY the category name in English, nothing else. One word only.`

  try {
    const res = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        stream: false,
        think: false,
        messages: [{ role: 'user', content: userMsg }],
        options: { temperature: 0, num_predict: 10 },
      }),
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    const raw = (data.message?.content || '').trim().toLowerCase()
    // Extract first word (in case model adds punctuation or explanation)
    const word = raw.split(/[\s,.\n]/)[0]
    if (VALID_CATEGORIES.includes(word)) return word
    // Fuzzy fallback
    if (word.includes('tech') || word.includes('科技')) return 'technology'
    if (word.includes('busi') || word.includes('商')) return 'business'
    if (word.includes('sport') || word.includes('体育')) return 'sports'
    if (word.includes('war') || word.includes('milit') || word.includes('军')) return 'war'
    console.warn(`  ⚠️  Unexpected response: "${raw}" → defaulting to 'general'`)
    return 'general'
  } catch (err) {
    console.error(`  ❌ ollama error: ${err.message}`)
    return null // null = skip, keep original
  }
}

/**
 * Sleep helper for rate limiting
 */
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

async function main() {
  console.log(`🤖 classify-news.mjs  model=${MODEL}  dryRun=${dryRun}  classifyAll=${classifyAll}`)
  if (filterDate) console.log(`📅 Filtering to date: ${filterDate}`)

  const newsJson = JSON.parse(readFileSync(NEWS_JSON_PATH, 'utf8'))
  let totalClassified = 0
  let totalChanged = 0

  const datesToProcess = filterDate
    ? [filterDate]
    : Object.keys(newsJson).sort().reverse()

  for (const date of datesToProcess) {
    const articles = newsJson[date]
    if (!articles || articles.length === 0) continue

    // Determine if this date's file had section headings
    const hasSections = fileHasSectionHeadings(date)

    // Decide which articles need classification:
    // - If file has section headings: skip (already correctly categorised by sync-news)
    // - If --all: re-classify everything
    // - Otherwise: classify only articles with category='technology' from files without sections
    const toClassify = articles.filter(a => {
      if (classifyAll) return true
      if (hasSections) return false // file already had explicit sections
      return true // old format: re-classify all articles in this date
    })

    if (toClassify.length === 0) {
      console.log(`⏭️  ${date}: skipping (has section headings, already classified)`)
      continue
    }

    console.log(`\n📰 ${date}: classifying ${toClassify.length} articles${hasSections ? ' (forced)' : ' (old format)'}`)

    for (const article of toClassify) {
      const oldCat = article.category
      process.stdout.write(`  [${article.id}] "${article.title.slice(0, 50)}..." → `)

      const newCat = await classifyArticle(article.title, article.description)
      if (newCat === null) {
        console.log(`(error, keeping ${oldCat})`)
        continue
      }

      const changed = newCat !== oldCat
      console.log(`${CATEGORY_LABELS[newCat] || newCat} (${newCat})${changed ? ` ✏️  was: ${oldCat}` : ' ✓'}`)

      if (!dryRun) {
        article.category = newCat
        // Update ID to reflect new category (format: date-category-num)
        const num = article.id.split('-').pop()
        article.id = `${date}-${newCat}-${num}`
      }

      totalClassified++
      if (changed) totalChanged++

      // Small delay to avoid hammering ollama
      await sleep(100)
    }
  }

  console.log(`\n✅ Classified ${totalClassified} articles, ${totalChanged} changed`)

  if (!dryRun) {
    writeFileSync(NEWS_JSON_PATH, JSON.stringify(newsJson, null, 2), 'utf8')
    console.log(`💾 Written to ${NEWS_JSON_PATH}`)
  } else {
    console.log(`🔍 Dry run — no changes written`)
  }
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
