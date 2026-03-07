# 每日 AI/Tech 新闻

每日 AI/Tech 新闻聚合网站，使用 Vue 3 + Vite + Tailwind CSS 构建。

## 项目简介

自动聚合每日 AI 和科技新闻，通过 cron job 定时搜索并保存到 Obsidian，再通过脚本解析生成静态 JSON 供前端展示。支持按日期浏览历史新闻。

## 数据架构

```
cron job (每天 9:00)
  → 搜索 AI/Tech 新闻
  → 保存到 Obsidian markdown
     (/Users/dreambot/Documents/Obsidian/main/每日新闻/YYYY-MM-DD.md)
  → node scripts/sync-news.mjs
     → 解析所有历史 markdown 文件
     → 生成 public/news.json（按日期分组）
  → Vue 前端读取 /news.json 展示
```

## 历史新闻存放位置

Obsidian 每日新闻目录：`/Users/dreambot/Documents/Obsidian/main/每日新闻/`

每个文件命名为 `YYYY-MM-DD.md`，格式如下：

```markdown
1. **新闻标题**
   新闻摘要描述
🔗 https://example.com/article
```

## 如何运行

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build
```

## 如何手动同步新闻

```bash
node scripts/sync-news.mjs
```

运行后会读取 Obsidian 目录下所有 `YYYY-MM-DD.md` 文件，解析并生成 `public/news.json`（按日期分组的对象）。

## 技术栈

- Vue 3 (`<script setup>` SFC)
- Vite 7
- Tailwind CSS 3
- 无 TypeScript（纯 JS）
