#!/usr/bin/env node
/**
 * sync-news.mjs
 * Reads the latest (and previous day's) Obsidian daily-news markdown files,
 * parses them, and writes public/news.json for the Vue site.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

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
  let idCounter = 1

  // Split on numbered list items: lines starting with "数字."
  // Each item block looks like:
  //   N. **Title**
  //   Description text (may span multiple lines)
  //   🔗 URL
  const itemRegex = /^\d+\.\s+\*\*(.+?)\*\*\s*\n([\s\S]*?)(?=^\d+\.\s|\Z)/gm

  // We'll manually split so we can handle multi-line descriptions correctly.
  // Split the content into "blocks" by lines that start with a number + "."
  const lines = content.split('\n')
  let currentItem = null

  for (const line of lines) {
    const titleMatch = line.match(/^(\d+)\.\s+\*\*(.+?)\*\*\s*$/)
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

    const urlMatch = line.match(/^🔗\s+(https?:\/\/\S+)/)
    if (urlMatch) {
      currentItem.url = urlMatch[1].trim()
      continue
    }

    // Accumulate description lines (skip blank lines at start)
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
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

  const allArticles = []

  // Take the latest file
  const latestFile = sortedDates[0]
  const latestDate = latestFile.replace('.md', '')
  console.log(`📰 Reading latest: ${latestFile}`)
  allArticles.push(...parseMarkdown(join(OBSIDIAN_DIR, latestFile), latestDate))

  // Also include yesterday's file if it exists
  if (sortedDates.length >= 2) {
    const prevFile = sortedDates[1]
    const prevDate = prevFile.replace('.md', '')
    console.log(`📰 Reading previous: ${prevFile}`)
    allArticles.push(...parseMarkdown(join(OBSIDIAN_DIR, prevFile), prevDate))
  }

  console.log(`✅ Parsed ${allArticles.length} articles total`)
  writeFileSync(OUTPUT_PATH, JSON.stringify(allArticles, null, 2), 'utf8')
  console.log(`💾 Written to ${OUTPUT_PATH}`)
}

main()
