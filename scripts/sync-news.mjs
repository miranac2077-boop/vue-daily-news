#!/usr/bin/env node
/**
 * sync-news.mjs
 * Reads ALL Obsidian daily-news markdown files, parses them,
 * and writes public/news.json as a date-grouped object for the Vue site.
 *
 * Output format:
 * {
 *   "2026-03-06": [...articles],
 *   "2026-03-05": [...articles],
 *   ...
 * }
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync, spawnSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))

const OBSIDIAN_DIR = '/Users/dreambot/Documents/Obsidian/main/每日新闻'
const OUTPUT_PATH = join(__dirname, '..', 'public', 'news.json')

/**
 * Return all YYYY-MM-DD.md filenames sorted descending (newest first).
 */
function getSortedDates() {
  const files = readdirSync(OBSIDIAN_DIR)
  return files
    .filter(f => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
    .sort()
    .reverse()
}

/**
 * Detect category from a section heading line (## 🔥 科技 Technology, etc.)
 * Returns a category string if matched, or null if not a section heading.
 * NOTE: only matches lines that contain category keywords — NOT numbered article headings like "## 1. Title"
 */
function detectCategory(line) {
  if (!line.startsWith('##')) return null
  // Exclude numbered article headings: "## 1. ..." or "## 10. ..."
  if (/^##\s+\d+\./.test(line)) return null
  if (line.includes('Technology') || line.includes('科技')) return 'technology'
  if (line.includes('Business') || line.includes('商业')) return 'business'
  if (line.includes('Sport') || line.includes('体育')) return 'sports'
  if (line.includes('War') || line.includes('军事')) return 'war'
  return null
}

/**
 * Parse a single markdown file into an array of article objects.
 * Supports multi-category files with section headings like ## 🔥 科技 Technology.
 */
function parseMarkdown(filePath, date) {
  const content = readFileSync(filePath, 'utf8')
  const articles = []

  const lines = content.split('\n')
  let currentItem = null
  let currentCategory = 'technology'
  // Track per-category item count for unique IDs
  const categoryCounters = {}

  for (const line of lines) {
    // Check for section heading (## ...) — detect category
    const detectedCat = detectCategory(line)
    if (detectedCat !== null) {
      // Finalize any in-progress item before switching category
      if (currentItem) {
        articles.push(finalizeItem(currentItem, date))
        currentItem = null
      }
      currentCategory = detectedCat
      // Reset counter for this category (in case heading appears again, though unlikely)
      categoryCounters[currentCategory] = 0
      continue
    }

    // Format A: "N. **Title**"      (03-05 style)
    // Format B: "**N. Title**"      (03-06/03-07 style)
    // Format C: "## N. Title"       (03-04 style)
    // Format D: "## N. **Title**"   (03-07 style with bold inside ##)
    const matchA = line.match(/^(\d+)\.\s+\*\*(.+?)\*\*\s*$/)
    const matchB = line.match(/^\*\*(\d+)\.\s+(.+?)\*\*\s*$/)
    const matchC = line.match(/^##\s+(\d+)\.\s+\*\*(.+?)\*\*\s*$/)
    const matchD = line.match(/^##\s+(\d+)\.\s+(.+?)\s*$/)
    const titleMatch = matchA || matchB || matchC || matchD

    if (titleMatch) {
      if (currentItem) articles.push(finalizeItem(currentItem, date))
      // Track per-category numbering
      if (!categoryCounters[currentCategory]) categoryCounters[currentCategory] = 0
      categoryCounters[currentCategory]++
      currentItem = {
        num: categoryCounters[currentCategory],
        title: titleMatch[2].trim(),
        descLines: [],
        url: '',
        date,
        category: currentCategory,
      }
      continue
    }

    if (!currentItem) continue

    const urlMatch = line.match(/^\s*🔗\s+(https?:\/\/\S+)/)
    if (urlMatch) {
      currentItem.url = urlMatch[1].trim()
      continue
    }

    // Accumulate description lines (skip blank lines, headings, hr)
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#') && trimmed !== '---') {
      currentItem.descLines.push(trimmed)
    }
  }

  if (currentItem) articles.push(finalizeItem(currentItem, date))
  return articles
}

function finalizeItem(item, date) {
  const category = item.category || 'technology'
  return {
    id: `${date}-${category}-${item.num}`,
    title: item.title,
    description: item.descLines.join(' ').trim(),
    url: item.url || '',
    publishedAt: `${date}T09:00:00.000Z`,
    source: { name: '每日综合新闻' },
    category,
    urlToImage: null,
  }
}

function main() {
  const sortedDates = getSortedDates()

  if (sortedDates.length === 0) {
    console.error('No markdown files found in', OBSIDIAN_DIR)
    process.exit(1)
  }

  const grouped = {}

  for (const file of sortedDates) {
    const date = file.replace('.md', '')
    console.log(`📰 Parsing: ${file}`)
    const articles = parseMarkdown(join(OBSIDIAN_DIR, file), date)
    if (articles.length > 0) {
      grouped[date] = articles
    }
  }

  const totalArticles = Object.values(grouped).reduce((sum, arr) => sum + arr.length, 0)
  const totalDays = Object.keys(grouped).length

  console.log(`✅ Parsed ${totalArticles} articles across ${totalDays} days`)
  writeFileSync(OUTPUT_PATH, JSON.stringify(grouped, null, 2), 'utf8')
  console.log(`💾 Written to ${OUTPUT_PATH}`)

  // AI classification: re-classify articles from old-format files (no section headings)
  console.log(`\n🤖 Running AI classifier...`)
  const classifyScript = join(__dirname, 'classify-news.mjs')
  const result = spawnSync(process.execPath, [classifyScript], { stdio: 'inherit' })
  if (result.status !== 0) {
    console.warn(`⚠️  Classifier exited with code ${result.status} — continuing anyway`)
  }

  // Auto-commit and push to trigger Vercel redeploy
  const PROJECT_ROOT = join(__dirname, '..')
  try {
    const status = execSync('git status --porcelain public/news.json', { cwd: PROJECT_ROOT }).toString().trim()
    if (status) {
      const today = new Date().toISOString().slice(0, 10)
      execSync('git add public/news.json', { cwd: PROJECT_ROOT })
      execSync(`git commit -m "chore: update news data for ${today}"`, { cwd: PROJECT_ROOT })
      execSync('git push origin main', { cwd: PROJECT_ROOT })
      console.log(`🚀 Pushed to GitHub`)
    } else {
      console.log(`ℹ️  news.json unchanged, skipping git push`)
    }
  } catch (err) {
    console.error(`⚠️  Git push failed: ${err.message}`)
  }

  // Deploy to Vercel (GitHub integration not connected, must deploy manually)
  try {
    const vercelToken = process.env.VERCEL_TOKEN
    if (!vercelToken) throw new Error('VERCEL_TOKEN env var is required')
    execSync(`vercel --prod --yes --token "${vercelToken}"`, {
      cwd: PROJECT_ROOT,
      env: { ...process.env, VERCEL_TOKEN: vercelToken },
    })
    console.log(`✅ Vercel deployment triggered`)
  } catch (err) {
    console.error(`⚠️  Vercel deploy failed: ${err.message}`)
  }
}

main()
