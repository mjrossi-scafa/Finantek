// Utilidades para manejar zona horaria chilena
import { format, toZonedTime } from 'date-fns-tz'
import { parseISO } from 'date-fns'

const CHILE_TZ = 'America/Santiago'

/**
 * Obtiene la fecha actual en zona horaria de Chile
 * @returns string en formato YYYY-MM-DD
 */
export function getChileToday(): string {
  const now = new Date()
  const chileDate = toZonedTime(now, CHILE_TZ)
  return format(chileDate, 'yyyy-MM-dd')
}

/**
 * Obtiene la fecha y hora actual de Chile
 * @returns Date object ajustado a zona horaria chilena
 */
export function getChileNow(): Date {
  const now = new Date()
  return toZonedTime(now, CHILE_TZ)
}

/**
 * Obtiene la hora actual en Chile (0-23)
 * @returns number
 */
export function getChileHour(): number {
  const chileNow = getChileNow()
  return chileNow.getHours()
}

/**
 * Convierte una fecha UTC a fecha en zona horaria de Chile
 * @param utcDate - Fecha en UTC
 * @returns string en formato YYYY-MM-DD
 */
export function utcToChileDate(utcDate: Date): string {
  const chileDate = toZonedTime(utcDate, CHILE_TZ)
  return format(chileDate, 'yyyy-MM-dd')
}

/**
 * Formatea una fecha para mostrar en zona horaria de Chile
 * @param dateStr - Fecha en string ISO
 * @returns string formateado para Chile
 */
export function formatChileDateTime(dateStr: string): string {
  const date = parseISO(dateStr)
  const chileDate = toZonedTime(date, CHILE_TZ)
  return format(chileDate, 'dd/MM/yyyy HH:mm', { timeZone: CHILE_TZ })
}

/**
 * Obtiene el saludo apropiado según la hora de Chile
 * @returns string con emoji y saludo
 */
export function getChileGreeting(): string {
  const hour = getChileHour()

  if (hour >= 5 && hour < 12) {
    return '🌅 ¡Buenos días!'
  } else if (hour >= 12 && hour < 18) {
    return '☀️ ¡Buenas tardes!'
  } else {
    return '🌙 ¡Buenas noches!'
  }
}