import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  format,
  parseISO,
  getISOWeek,
  getYear,
  addWeeks,
  subWeeks,
} from 'date-fns'
import { es } from 'date-fns/locale'

export function getWeekRange(date: Date = new Date()) {
  return {
    start: startOfWeek(date, { weekStartsOn: 1 }),
    end: endOfWeek(date, { weekStartsOn: 1 }),
  }
}

export function getMonthRange(year: number, month: number) {
  const date = new Date(year, month - 1, 1)
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  }
}

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), "d 'de' MMMM, yyyy", { locale: es })
}

export function formatDateShort(dateStr: string): string {
  return format(parseISO(dateStr), 'd MMM', { locale: es })
}

export function formatMonthYear(year: number, month: number): string {
  const date = new Date(year, month - 1, 1)
  return format(date, 'MMMM yyyy', { locale: es })
}

export function getCurrentWeekBounds() {
  const now = new Date()
  const start = startOfWeek(now, { weekStartsOn: 1 })
  const end = endOfWeek(now, { weekStartsOn: 1 })
  return {
    start: format(start, 'yyyy-MM-dd'),
    end: format(end, 'yyyy-MM-dd'),
  }
}

export function getPreviousWeekBounds() {
  const now = new Date()
  const prevWeek = subWeeks(now, 1)
  const start = startOfWeek(prevWeek, { weekStartsOn: 1 })
  const end = endOfWeek(prevWeek, { weekStartsOn: 1 })
  return {
    start: format(start, 'yyyy-MM-dd'),
    end: format(end, 'yyyy-MM-dd'),
  }
}

export function getMonthName(month: number): string {
  const date = new Date(2000, month - 1, 1)
  return format(date, 'MMMM', { locale: es })
}

export function toDateStr(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function isThisWeek(date: Date): boolean {
  const now = new Date()
  const currentWeek = getWeekRange(now)
  const targetWeek = getWeekRange(date)
  return currentWeek.start.getTime() === targetWeek.start.getTime()
}

export function isCurrentWeek(weekStartStr: string): boolean {
  const weekStart = parseISO(weekStartStr)
  return isThisWeek(weekStart)
}

export function getRelativeWeekLabel(weekStartStr: string): string {
  const weekStart = parseISO(weekStartStr)
  const now = new Date()

  if (isThisWeek(weekStart)) {
    return 'Esta semana'
  }

  const lastWeek = subWeeks(now, 1)
  if (isThisWeek(lastWeek) && getWeekRange(lastWeek).start.getTime() === getWeekRange(weekStart).start.getTime()) {
    return 'Semana pasada'
  }

  const weeksAgo = Math.floor((now.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24 * 7))
  return weeksAgo > 0 ? `Hace ${weeksAgo} semana${weeksAgo > 1 ? 's' : ''}` : 'Esta semana'
}
