# Katana — Spec-Driven Development Document
**Versión:** 1.0 · **Fecha:** Abril 2026 · **Estado:** 95% completo

---

## 1. Visión general

**Katana** es una plataforma de finanzas personales con estética samurai japonesa retro. Permite registrar gastos e ingresos, analizar hábitos financieros con IA, gestionar presupuestos y operar todo desde un bot de Telegram conversacional.

**URL producción:** `katana-omega.vercel.app`  
**Filosofía:** La disciplina del samurai aplicada al dinero

---

## 2. Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 16 (App Router) · TypeScript |
| Estilos | Tailwind CSS v4 · shadcn/ui |
| Base de datos | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| IA | Anthropic Claude Haiku |
| Gráficos | Recharts |
| Bot | Telegram Bot API |
| Deploy | Vercel |
| Storage | Supabase Storage |

---

## 3. Arquitectura de base de datos

### Tablas existentes

| Tabla | Descripción | Estado |
|-------|-------------|--------|
| `profiles` | Perfiles de usuario + campos Telegram | ✅ |
| `categories` | Categorías de ingresos/gastos | ✅ |
| `transactions` | Transacciones principales | ✅ |
| `receipts` | Archivos de recibos procesados | ✅ |
| `budgets` | Presupuestos por categoría | ✅ |
| `budget_alerts` | Alertas de presupuesto | ✅ |
| `achievements` | Logros del sistema | ✅ |
| `user_achievements` | Logros desbloqueados por usuario | ✅ |
| `weekly_insights` | Insights generados por IA | ✅ |
| `bot_pending_actions` | Acciones pendientes del bot | ✅ |
| `telegram_users` | Vinculación Telegram ↔ usuario | ❌ FALTANTE |

### Migración urgente requerida

```sql
-- Crear tabla telegram_users
CREATE TABLE IF NOT EXISTS telegram_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_chat_id BIGINT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  telegram_username VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON telegram_users(telegram_chat_id);
CREATE INDEX ON telegram_users(user_id);
```

---

## 4. Módulos del sistema

### 4.1 Dashboard

**Estado:** ✅ Funcional · ⚠️ Bug menor pendiente

**Funcionalidades implementadas:**
- Balance del mes (número grande, color según positivo/negativo)
- Cards de ingresos y gastos con barra de proporción
- Insights IA en tiempo real (card de balance, lado derecho)
- Gráfico donut: gastos por categoría con total al centro
- Gráfico barras: comparación semanal
- Gráfico área: tendencia mensual ingresos vs gastos
- Barra de filtros: búsqueda, tipo, categoría, exportar
- Sección últimas transacciones
- Botón "+ Nueva Transacción"

**Bugs pendientes:**
- Barra de ingresos muestra 100% cuando ingresos = $0 (debería ser 0%)
- Filtro de mes en header es decorativo, no filtra los gráficos

**APIs usadas:**
- `get_monthly_summary` (RPC)
- `get_spending_by_category` (RPC)
- `get_monthly_trends` (RPC)
- `get_weekly_comparison` (RPC)
- `transactions` (tabla directa)
- `budget_alerts` (tabla directa)
- `GET /api/insights/current`

**Mejoras prioritarias:**
1. Conectar filtro de mes al selector del header
2. Corregir bug barra ingresos
3. Agregar badge de tendencia vs mes anterior en card balance

---

### 4.2 Transacciones

**Estado:** ✅ Funcional · Recientemente mejorada

**Funcionalidades implementadas:**
- Lista agrupada por fecha con totales diarios
- Filtros: búsqueda con debounce, tipo, categoría, mes
- Resumen rápido: ingresos / gastos / balance del período
- Modal unificado crear/editar con validación completa
- Eliminación con confirmación inline
- Selección múltiple con checkboxes + bulk delete
- FAB flotante en mobile para nueva transacción
- Swipe to delete en mobile

**APIs usadas:**
- `transactions` (CRUD)
- `categories` (lectura)

**Mejoras prioritarias:**
1. Paginación infinita (actualmente límite 500)
2. Export a CSV/Excel funcional
3. Duplicar transacción
4. Vista por categoría alternativa

---

### 4.3 Presupuestos

**Estado:** ✅ Funcional · Sin issues conocidos

**Funcionalidades implementadas:**
- Crear/editar presupuestos por categoría y mes
- Progreso visual de cada presupuesto
- Alertas cuando se acerca al límite
- Vista de alertas activas

**APIs usadas:**
- `budgets` (CRUD)
- `categories` (lectura)
- `GET /api/budgets/alerts`

**Mejoras prioritarias:**
1. Presupuesto global mensual (suma de todos)
2. Historial de presupuestos anteriores
3. Sugerencias de presupuesto basadas en historial con IA

---

### 4.4 Recibos

**Estado:** ✅ Funcional · Sin issues conocidos

**Funcionalidades implementadas:**
- Upload de imágenes y PDFs
- OCR con IA para extraer transacciones
- Revisión y confirmación antes de guardar
- Historial de recibos procesados
- Vista detalle de cada recibo

**APIs usadas:**
- `POST /api/receipts`
- `GET /api/receipts/[id]`
- `POST /api/receipts/[id]/process`

**Mejoras prioritarias:**
1. Re-procesar recibo si el OCR falló
2. Editar items extraídos antes de confirmar
3. Vincular recibo a transacción existente

---

### 4.5 Insights IA

**Estado:** ✅ Funcional · Sin issues conocidos

**Funcionalidades implementadas:**
- Generación de análisis semanal con Claude Haiku
- Historial de insights en timeline
- Empty state con botón de generación
- Un insight por semana por usuario (protección)

**APIs usadas:**
- `GET /api/insights/current`
- `POST /api/insights/generate`
- `weekly_insights` (tabla)

**Mejoras prioritarias:**
1. Insights mensuales adicionales a los semanales
2. Comparación entre semanas en el mismo insight
3. Compartir insight como imagen

---

### 4.6 Logros

**Estado:** ✅ Funcional · Sin issues conocidos

**Funcionalidades implementadas:**
- Sistema de logros desbloqueables
- Verificación automática al registrar transacciones
- Vista de logros obtenidos vs pendientes

**APIs usadas:**
- `GET /api/achievements/check`
- `user_achievements` (tabla)
- `achievements` (tabla)

**Mejoras prioritarias:**
1. Notificación visual al desbloquear logro
2. Logros vinculados al sistema de XP del sidebar
3. Compartir logro

---

### 4.7 Configuración

**Estado:** ✅ Funcional · Sin issues conocidos

**Funcionalidades implementadas:**
- Editar perfil de usuario
- Vinculación bot de Telegram
- Gestión de categorías

**APIs usadas:**
- `profiles` (CRUD)
- `telegram_users` (lectura/escritura) ← TABLA FALTANTE

**Mejoras prioritarias:**
1. Cambiar contraseña
2. Exportar todos mis datos (GDPR)
3. Eliminar cuenta

---

### 4.8 Auth (Login / Registro / Recovery)

**Estado:** ✅ Funcional

**Funcionalidades implementadas:**
- Login con email/contraseña
- Registro con validación en tiempo real
- Recuperar contraseña (forgot-password)
- Página de diseño split: panel izquierdo oscuro + formulario derecho

**Mejoras prioritarias:**
1. Login con Google (OAuth)
2. Verificación de email al registrarse
3. Página reset-password (cuando llegan del link del email)

---

## 5. Bot de Telegram

**Estado:** ✅ Funcional · ⚠️ En modo polling (no webhook)

### Funcionalidades implementadas
- Procesamiento de texto en lenguaje natural
- OCR de fotos de boletas con confirmación conversacional
- Procesamiento de PDFs
- Memoria de contexto (últimos 6 mensajes, expira en 10 min)
- Comandos: `/start`, `/ayuda`, `resumen`, `insights`, `corregir`
- Respuestas inteligentes con Claude Haiku

### Problema crítico
El bot corre en polling desde `telegram-poll.sh` en tu Mac local. Si apagas el Mac, el bot muere.

### Fix requerido: Migrar a Webhook
```bash
# Registrar webhook en Telegram
curl "https://api.telegram.org/bot{TOKEN}/setWebhook?url=https://katana-omega.vercel.app/api/telegram/webhook"
```

El endpoint `/api/telegram/webhook` ya existe en el código, solo hay que activarlo.

---

## 6. Sidebar

**Estado:** ✅ Funcional

### Componentes
- `KatanaLogo` — Logo pixelado con letras K-A-T-A-N-A
- `SamuraiWidget` — Katana animada flotando con frases
- `SamuraiContainer` — Toggle modo activo/zen
- `SamuraiFallback` — Fallback si falla el widget

### Mejora pendiente: Widget de Progreso RPG
Reemplazar el modo zen por un sistema de progreso que muestra:
- Nivel de "Samurai Financiero" con barra de XP real
- Metas del mes con progreso
- Racha de días consecutivos
- Frases motivacionales rotatorias

---

## 7. Issues críticos para mañana

Estos son los problemas que deben resolverse antes de empezar a probar:

### 🔴 Crítico 1 — Tabla telegram_users faltante
```sql
CREATE TABLE IF NOT EXISTS telegram_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_chat_id BIGINT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  telegram_username VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```
Ejecutar en Supabase Dashboard → SQL Editor.

### 🔴 Crítico 2 — Bot en polling (muere si apagas el Mac)
Registrar webhook:
```bash
cd ~/my-first-app
curl "https://api.telegram.org/bot$(grep TELEGRAM_BOT_TOKEN .env.local | cut -d'=' -f2)/setWebhook?url=https://katana-omega.vercel.app/api/telegram/webhook"
```

### 🟡 Importante 3 — Middleware deprecado
Renombrar `src/middleware.ts` a `src/proxy.ts` o agregar configuración compatible.

### 🟡 Importante 4 — Filtros de Dashboard decorativos
El selector de mes en el header no conecta con los gráficos.

### 🟡 Importante 5 — Barra de ingresos bug
Con $0 de ingresos muestra 100% en verde.

### 🟡 Importante 6 — NEXT_PUBLIC_APP_URL en Vercel
Verificar que esté en `https://katana-omega.vercel.app` y no `localhost`.

---

## 8. Roadmap de mejoras post-lanzamiento

### Sprint 1 — Estabilidad (esta semana)
- [ ] Crear tabla `telegram_users` en Supabase
- [ ] Activar webhook de Telegram en Vercel
- [ ] Corregir barra de ingresos bug
- [ ] Conectar filtro de mes del dashboard
- [ ] Actualizar `NEXT_PUBLIC_APP_URL` en Vercel
- [ ] Migrar middleware deprecado

### Sprint 2 — UX mejorada
- [ ] Widget de progreso RPG en sidebar (reemplazar modo zen)
- [ ] Paginación infinita en transacciones
- [ ] Notificación visual al desbloquear logro
- [ ] Export CSV real desde transacciones
- [ ] Página reset-password funcional

### Sprint 3 — Engagement
- [ ] Sistema de XP conectado a logros
- [ ] Presupuesto global mensual
- [ ] Login con Google
- [ ] PWA instalable en celular
- [ ] Sugerencias de presupuesto con IA

### Sprint 4 — Automatización
- [ ] Vinculación Telegram multi-usuario con código
- [ ] Parseo de emails de banco (Itaú débito)
- [ ] Integración Rube para automatización Gmail
- [ ] Insights mensuales automáticos

---

## 9. Sistema de XP y niveles (spec)

Para el widget de progreso RPG:

| Acción | XP ganado |
|--------|-----------|
| Registrar transacción | +50 XP |
| Procesar recibo | +100 XP |
| Generar insight | +150 XP |
| Cumplir meta mensual | +300 XP |
| Racha 7 días | +200 XP |
| Primer presupuesto | +100 XP |

| Nivel | XP requerido | Título |
|-------|-------------|--------|
| 1 | 0 | Aprendiz |
| 2 | 500 | Estudiante |
| 3 | 1.200 | Guerrero |
| 4 | 2.500 | Samurai |
| 5 | 4.500 | Maestro |
| 6 | 7.000 | Sensei |
| 7 | 10.000 | Shogun |
| 8 | 15.000 | Daimyo |
| 9 | 22.000 | Legendario |
| 10 | 30.000 | Katana Master |

---

## 10. Checklist para mañana

### Antes de empezar a probar
- [ ] Abrir `katana-omega.vercel.app` y verificar que carga
- [ ] Hacer login con tu cuenta
- [ ] Verificar que las transacciones existentes aparecen
- [ ] Crear una transacción de prueba
- [ ] Enviar una foto de boleta al bot de Telegram
- [ ] Generar un insight semanal
- [ ] Revisar que los presupuestos están configurados
- [ ] Verificar que los logros se actualizan

### Flujo principal a probar
1. Login → Dashboard → ver balance del mes
2. + Nueva Transacción → crear gasto de prueba
3. Transacciones → editar y eliminar
4. Bot Telegram → "Café 2500" → confirmar
5. Bot Telegram → foto de boleta → revisar opciones
6. Insights → generar análisis de la semana
7. Presupuestos → crear presupuesto de alimentación
8. Logros → verificar que aparecen desbloqueados

