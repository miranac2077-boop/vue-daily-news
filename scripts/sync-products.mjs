#!/usr/bin/env node
/**
 * sync-products.mjs
 * Reads ALL Obsidian 每日产品快报 markdown files, parses them,
 * and writes public/products.json as a date-grouped object for the Vue site.
 *
 * Output format:
 * {
 *   "2026-03-09": {
 *     "insight": "...",
 *     "products": [...],
 *   },
 *   ...
 * }
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))

const OBSIDIAN_DIR = '/Users/dreambot/Documents/Obsidian/main/每日产品快报'
const OUTPUT_PATH = join(__dirname, '..', 'public', 'products.json')

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
 * Extract URL from a line — handles:
 * - Markdown link: [text](url)
 * - Bare URL: https://...
 * - Old table format: | 🔗 链接 | url | or | 🔗 链接 | https://... |
 */
function extractUrl(line) {
  // Markdown link [text](url)
  const mdLink = line.match(/\[.+?\]\((https?:\/\/[^)]+)\)/)
  if (mdLink) return mdLink[1].trim()

  // Table row: | 🔗 链接 | https://... |
  const tableUrl = line.match(/\|\s*🔗[^|]*\|\s*(https?:\/\/\S+?)\s*\|/)
  if (tableUrl) return tableUrl[1].trim()

  // Bare URL
  const bareUrl = line.match(/(https?:\/\/\S+)/)
  if (bareUrl) return bareUrl[1].replace(/[,\s]+$/, '').trim()

  return ''
}

/**
 * Parse a single markdown file into a day object: { insight, products }.
 * Supports both new list format and old table format.
 */
function parseMarkdown(filePath, date) {
  const content = readFileSync(filePath, 'utf8')
  const lines = content.split('\n')

  const products = []
  let insight = ''

  let currentProduct = null
  let inInsightSection = false
  let insightLines = []
  let descLines = []
  let inDescPhase = false // true = collecting description before metadata

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // ── Insight section ──────────────────────────────────────────────
    if (/^##\s+今日\s*Insight/.test(trimmed)) {
      inInsightSection = true
      if (currentProduct) {
        products.push(finalizeProduct(currentProduct, descLines, date))
        currentProduct = null
        descLines = []
        inDescPhase = false
      }
      continue
    }

    if (inInsightSection) {
      if (trimmed.startsWith('##') && !/^##\s+今日\s*Insight/.test(trimmed)) {
        inInsightSection = false
        insight = insightLines.join(' ').trim()
      } else {
        if (trimmed && trimmed !== '---' && !trimmed.startsWith('#') && !trimmed.startsWith('*生成') && !trimmed.startsWith('*信息')) {
          insightLines.push(trimmed)
        }
        continue
      }
    }

    // ── Product heading: ## N. 产品名 · 分数/100 ────────────────────
    const headingMatch = trimmed.match(/^##\s+(\d+)\.\s+(.+?)\s*[··]\s*(\d+)\/100/)
    if (headingMatch) {
      // Finalize previous product
      if (currentProduct) {
        products.push(finalizeProduct(currentProduct, descLines, date))
      }
      currentProduct = {
        num: parseInt(headingMatch[1], 10),
        title: headingMatch[2].trim(),
        score: parseInt(headingMatch[3], 10),
        team: '',
        popularity: '',
        url: '',
        opinion: '',
      }
      descLines = []
      inDescPhase = true
      continue
    }

    if (!currentProduct) continue

    // ── Old table-format header row (skip) ──────────────────────────
    if (/^\|\s*维度/.test(trimmed) || /^\|[-\s|]+$/.test(trimmed)) continue

    // ── Old table format metadata rows ──────────────────────────────
    // | 🏢 团队 | ... |
    const tableTeam = trimmed.match(/^\|\s*🏢\s*团队\s*\|\s*(.+?)\s*\|/)
    if (tableTeam) { currentProduct.team = tableTeam[1].trim(); inDescPhase = false; continue }

    const tablePopularity = trimmed.match(/^\|\s*📊\s*热度\s*\|\s*(.+?)\s*\|/)
    if (tablePopularity) { currentProduct.popularity = tablePopularity[1].trim(); inDescPhase = false; continue }

    const tableLink = trimmed.match(/^\|\s*🔗\s*链接\s*\|\s*(.+?)\s*\|/)
    if (tableLink) {
      currentProduct.url = extractUrl(tableLink[1])
      inDescPhase = false
      continue
    }

    // ── New list-format metadata lines ──────────────────────────────
    // - 🏢 **团队：** ...
    const teamMatch = trimmed.match(/^[-*]\s*🏢\s*\*{0,2}团队[：:]\*{0,2}\s*(.+)$/)
    if (teamMatch) { currentProduct.team = teamMatch[1].trim(); inDescPhase = false; continue }

    // - 📊 **热度：** ...
    const popularityMatch = trimmed.match(/^[-*]\s*📊\s*\*{0,2}热度[：:]\*{0,2}\s*(.+)$/)
    if (popularityMatch) { currentProduct.popularity = popularityMatch[1].trim(); inDescPhase = false; continue }

    // - 🔗 **链接：** [text](url)  OR  - 🔗 https://...
    const linkMatch = trimmed.match(/^[-*]\s*🔗/)
    if (linkMatch) {
      currentProduct.url = extractUrl(trimmed)
      inDescPhase = false
      continue
    }

    // - 💡 **Linda 的观点：** ...
    const opinionMatch = trimmed.match(/^[-*]\s*💡\s*\*{0,2}Linda\s*的观点[：:]\*{0,2}\s*(.+)$/)
    if (opinionMatch) { currentProduct.opinion = opinionMatch[1].trim(); inDescPhase = false; continue }

    // 💡 **Linda 的观点：** ... (without leading dash, used in 03-08)
    const opinionNoPrefix = trimmed.match(/^💡\s*\*{0,2}Linda\s*的观点[：:]\*{0,2}\s*(.+)$/)
    if (opinionNoPrefix) { currentProduct.opinion = opinionNoPrefix[1].trim(); inDescPhase = false; continue }

    // ── Description lines (before any metadata) ─────────────────────
    if (inDescPhase && trimmed && trimmed !== '---' && !trimmed.startsWith('#') && !trimmed.startsWith('|')) {
      // Skip lines that look like section separators or footnotes
      if (!trimmed.startsWith('*生成') && !trimmed.startsWith('*信息') && !trimmed.startsWith('> ')) {
        descLines.push(trimmed)
      }
    }

    // ── HR between products ──────────────────────────────────────────
    if (trimmed === '---') {
      inDescPhase = false
    }
  }

  // Finalize last product
  if (currentProduct) {
    products.push(finalizeProduct(currentProduct, descLines, date))
  }

  // Finalize insight if we were still in it at EOF
  if (inInsightSection && insightLines.length > 0) {
    insight = insightLines.join(' ').trim()
  }

  return { insight, products }
}

function finalizeProduct(item, descLines, date) {
  // Clean description: remove bold markers and footnote lines
  const desc = descLines
    .join(' ')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()

  return {
    id: `${date}-${item.num}`,
    title: item.title,
    score: item.score,
    description: desc,
    team: item.team.replace(/\*\*/g, ''),
    popularity: item.popularity.replace(/\*\*/g, ''),
    url: item.url,
    opinion: item.opinion,
    publishedAt: `${date}T09:00:00.000Z`,
    source: { name: "Linda's AI 产品快报" },
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
    console.log(`📡 Parsing: ${file}`)
    const { insight, products } = parseMarkdown(join(OBSIDIAN_DIR, file), date)
    if (products.length > 0) {
      grouped[date] = { insight, products }
    }
  }

  const totalProducts = Object.values(grouped).reduce((sum, d) => sum + d.products.length, 0)
  const totalDays = Object.keys(grouped).length

  console.log(`✅ Parsed ${totalProducts} products across ${totalDays} days`)
  writeFileSync(OUTPUT_PATH, JSON.stringify(grouped, null, 2), 'utf8')
  console.log(`💾 Written to ${OUTPUT_PATH}`)

  // Auto-commit and push to trigger Vercel redeploy
  const PROJECT_ROOT = join(__dirname, '..')
  try {
    const status = execSync('git status --porcelain public/products.json', { cwd: PROJECT_ROOT }).toString().trim()
    if (status) {
      const today = new Date().toISOString().slice(0, 10)
      execSync('git add public/products.json', { cwd: PROJECT_ROOT })
      execSync(`git commit -m "chore: update products data for ${today}"`, { cwd: PROJECT_ROOT })
      execSync('git push origin main', { cwd: PROJECT_ROOT })
      console.log(`🚀 Pushed to GitHub`)
    } else {
      console.log(`ℹ️  products.json unchanged, skipping git push`)
    }
  } catch (err) {
    console.error(`⚠️  Git push failed: ${err.message}`)
  }

  // Deploy to Vercel
  try {
    const vercelToken = process.env.VERCEL_TOKEN || 'vcp_6DIJIkKgTEKWQ4Yzv1a2y6tZOMMe2xfb3mBaFr7LQuobAyY39N050yTT'
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
