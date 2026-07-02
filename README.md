# SEO Brief Generator 📊

Генератор SEO-брифов на основе анализа конкурентов с использованием AI.

## 🚀 Возможности

- 🔍 Анализ страниц конкурентов
- 🤖 AI-генерация через Polza.ai API
- 📝 Структурированный бриф (H1/H2/H3, темы, ключи)
- 💾 Сохранение в Markdown + SQLite

## 📦 Установка


git clone https://github.com/Solution-23/seo-brief-generator.git
cd seo-brief-generator
npm install

⚙️ Настройка
Создайте .env:
POLZA_API_KEY=ваш_api_ключ

🎯 Использование
npm start "ваше_ключевое_слово"

Результат сохраняется в:
briefs/*.md — Markdown файл
data/briefs.db — SQLite база

🏗️ Архитектура
Ports & Adapters (Hexagonal):
core/ — бизнес-логика (entities, ports, use-cases)
adapters/ — внешние зависимости (HTTP, parser, storage)
di/ — dependency injection
