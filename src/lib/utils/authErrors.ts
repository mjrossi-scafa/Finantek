/**
 * Translate Supabase auth error messages to user-friendly Spanish
 */
export function translateAuthError(error: { message?: string; status?: number } | string): string {
  const message = typeof error === 'string' ? error : error?.message ?? ''

  // Normalize message
  const msg = message.toLowerCase()

  if (msg.includes('invalid login credentials') || msg.includes('invalid_grant')) {
    return 'Correo o contraseña incorrectos'
  }
  if (msg.includes('email not confirmed')) {
    return 'Debes confirmar tu correo antes de iniciar sesión'
  }
  if (msg.includes('user already registered') || msg.includes('already been registered')) {
    return 'Este correo ya está registrado. ¿Olvidaste tu contraseña?'
  }
  if (msg.includes('password should be at least') || msg.includes('password too short')) {
    return 'La contraseña debe tener al menos 6 caracteres'
  }
  if (msg.includes('invalid email') || msg.includes('email address is invalid')) {
    return 'Correo electrónico no válido'
  }
  if (msg.includes('too many requests') || msg.includes('rate limit')) {
    return 'Demasiados intentos. Espera un momento e intenta de nuevo'
  }
  if (msg.includes('network') || msg.includes('failed to fetch')) {
    return 'Problema de conexión. Verifica tu internet'
  }
  if (msg.includes('user not found')) {
    return 'No encontramos una cuenta con ese correo'
  }
  if (msg.includes('expired') || msg.includes('token is expired')) {
    return 'El enlace expiró. Solicita uno nuevo'
  }
  if (msg.includes('same password') || msg.includes('new password should be different')) {
    return 'La nueva contraseña debe ser diferente a la anterior'
  }
  if (msg.includes('weak password')) {
    return 'Contraseña muy débil. Usa mayúsculas, números o símbolos'
  }
  if (msg.includes('captcha')) {
    return 'Verificación de seguridad fallida. Intenta de nuevo'
  }

  // Fallback to original message (capitalized)
  if (message) {
    return message.charAt(0).toUpperCase() + message.slice(1)
  }
  return 'Ocurrió un error. Intenta de nuevo'
}
