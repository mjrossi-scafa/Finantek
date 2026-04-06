# Subagente: Katana Dev
Plataforma de finanzas personales con estética samurai japonesa.

## Repositorio y URLs
- Local: ~/my-first-app
- GitHub: github.com/mjrossi-scafa/Finantek
- Producción: https://katana-finance.vercel.app
- Bot Telegram: @risky_finance_bot

## Stack
- Next.js 16.2.2 (App Router) · TypeScript
- React 19.2.4
- Supabase 2.101.1 (PostgreSQL + Auth + RLS)
- Tailwind CSS v4 · shadcn/ui
- Recharts 3.8.1
- Anthropic SDK 0.82.0 (Claude Haiku)
- GSAP 3.14.2
- Lucide React 1.7.0
- Vercel (deploy)

## Identidad visual
- Violeta: #A855F7 · #7C3AED · #6D28D9
- Verde lima: #84CC16
- Fondo: #0A0A0F · #1A0A2E
- Estilo: samurai japonés retro pixelado
- Filosofía: "La disciplina del samurai aplicada al dinero"

## Estado: 100% funcional en producción
- Build: ✅ 21 páginas, 9 endpoints, sin errores
- TypeScript strict: ✅ sin warnings
- Deploy: ✅ activo

## Páginas

### Dashboard /dashboard ✅
- 6 queries paralelas a Supabase
- SummaryCards: balance, ingresos, gastos
- BudgetAlertBanner: alertas 80%/100%
- SpendingByCategoryChart: pie Recharts
- MonthlyTrendChart: tendencias 12 meses
- WeeklyComparisonChart: esta semana vs anterior
- RecentTransactions: últimas 5
- Filtros: este mes / anterior / 3m / 6m

### Transactions /transactions ✅
- CRUD completo con modal unificado
- Búsqueda debounce 300ms
- Filtros: tipo, categoría, mes
- Selección múltiple + bulk delete
- Paginación infinita (Intersection Observer)
- Swipe to delete mobile

### Budgets /budgets ✅
- Presupuestos por categoría
- Alertas 80%/100%

### Receipts /receipts ✅
- Upload imagen/PDF
- OCR con Claude Haiku
- Confirmación conversacional

### Insights /insights ✅
- Análisis semanal con Claude Haiku
- Comparación semana actual vs anterior

### Achievements /achievements ✅
- Sistema de logros con progreso

### Settings /settings ✅
- Perfil, vinculación Telegram, categorías

### Auth ✅
- Login, registro con validación, forgot-password

## Base de datos

### Tablas
- profiles: perfil usuario
- categories: categorías ingreso/gasto
- transactions: transacciones principales
- budgets: presupuestos por categoría
- budget_alerts: alertas 80%/100%
- receipts: recibos procesados con OCR
- achievements: catálogo de logros
- user_achievements: logros desbloqueados
- weekly_insights: análisis IA generados
- bot_pending_actions: acciones pendientes bot
- telegram_users: vinculación Telegram ↔ usuario

### RPCs
- get_monthly_summary(year, month)
- get_spending_by_category(year, month)
- get_monthly_trends(months:12)
- get_weekly_comparison()

## APIs
| Endpoint | Método | Función |
|----------|--------|---------|
| /api/telegram/webhook | POST | Bot principal |
| /api/telegram/poll | GET | Polling alternativo |
| /api/receipts | POST/GET | Upload y listar |
| /api/receipts/[id] | GET/DELETE | CRUD recibo |
| /api/receipts/[id]/process | POST | OCR con IA |
| /api/insights/generate | POST | Generar insight |
| /api/insights/current | GET | Insight actual |
| /api/achievements/check | POST | Validar logros |
| /api/budgets/alerts | POST | Crear alertas |

## Bot Telegram (@risky_finance_bot)
- Webhook: katana-finance.vercel.app/api/telegram/webhook
- Motor: Claude Haiku 4.5
- Memoria: 6 mensajes, expira 10 min
- Comandos: /start, /ayuda, /vincular, resumen, insights, dashboard
- Procesa: texto libre, fotos boletas, PDFs
- NLP: "Almuerzo 8500" → transacción automática
- Lenguaje natural: "cuánto gasté hoy", "borra el último"

## Archivos bot
- src/app/api/telegram/webhook/route.ts (811 líneas)
- src/lib/telegram/bot.ts
- src/lib/telegram/parser.ts
- src/lib/telegram/conversationMemory.ts
- src/lib/telegram/botHelpers.ts

## Sidebar
- SamuraiWidget: katana SVG animada con CSS keyframes
- CherryBlossoms: pétalos cayendo con GSAP
- Frases rotatorias cada 6s en español
- CTA Telegram: link directo a t.me/risky_finance_bot

## Variables de entorno
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY
TELEGRAM_BOT_TOKEN
TELEGRAM_WEBHOOK_SECRET=katana_webhook_2026
NEXT_PUBLIC_APP_URL=https://katana-finance.vercel.app

## Mejoras pendientes
- Widget RPG de progreso con XP real de Supabase
- Tests automatizados
- PWA instalable
- Login con Google
- Export CSV/PDF

## Comandos
cd ~/my-first-app
npm run dev
npm run build
git add . && git commit -m "..." && git push