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
import { execSync } from 'child_process'

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
 * Parse a single markdown file into an array of article objects.
 */
function parseMarkdown(filePath, date) {
  const content = readFileSync(filePath, 'utf8')
  const articles = []

  const lines = content.split('\n')
  let currentItem = null

  for (const line of lines) {
    // Format A: "N. **Title**"  (03-05 style)
    // Format B: "**N. Title**"  (03-06 style)
    // Format C: "## N. Title"   (03-04 style)
    const matchA = line.match(/^(\d+)\.\s+\*\*(.+?)\*\*\s*$/)
    const matchB = line.match(/^\*\*(\d+)\.\s+(.+?)\*\*\s*$/)
    const matchC = line.match(/^##\s+(\d+)\.\s+(.+?)\s*$/)
    const titleMatch = matchA || matchB || matchC

    if (titleMatch) {
      if (currentItem) articles.push(finalizeItem(currentItem, date))
      currentItem = {
        num: parseInt(titleMatch[1], 10),
        title: titleMatch[2].trim(),
        descLines: [],
        url: '',
        date,
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
  return {
    id: `${date}-${item.num}`,
    title: item.title,
    description: item.descLines.join(' ').trim(),
    url: item.url || '',
    publishedAt: `${date}T09:00:00.000Z`,
    source: { name: '每日 AI/Tech' },
    category: 'technology',
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

  // Auto-commit and push to trigger Vercel redeploy
  const PROJECT_ROOT = join(__dirname, '..')
  try {
    const status = execSync('git status --porcelain public/news.json', { cwd: PROJECT_ROOT }).toString().trim()
    if (status) {
      const today = new Date().toISOString().slice(0, 10)
      execSync('git add public/news.json', { cwd: PROJECT_ROOT })
      execSync(`git commit -m "chore: update news data for ${today}"`, { cwd: PROJECT_ROOT })
      execSync('git push origin main', { cwd: PROJECT_ROOT })
      console.log(`🚀 Pushed to GitHub — Vercel will auto-redeploy`)
    } else {
      console.log(`ℹ️  news.json unchanged, skipping git push`)
    }
  } catch (err) {
    console.error(`⚠️  Git push failed: ${err.message}`)
    // Don't exit with error — data write was still successful
  }
}

main()
