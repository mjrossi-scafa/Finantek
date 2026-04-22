/**
 * Haptic feedback utilities for mobile (Android primarily).
 * iOS restricts navigator.vibrate but the calls are safe.
 */

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'

const PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 30,
  success: [10, 50, 15],
  warning: [20, 40, 20],
  error: [30, 60, 30, 60, 30],
}

export function haptic(pattern: HapticPattern = 'light') {
  if (typeof window === 'undefined') return
  if (!('vibrate' in navigator)) return
  try {
    navigator.vibrate(PATTERNS[pattern])
  } catch {
    // Silently fail if not supported
  }
}

/**
 * Play audio feedback as a fallback/complement to haptic
 * Uses Web Audio API for a subtle ding sound.
 */
export function playDing(frequency: number = 880, duration: number = 150) {
  if (typeof window === 'undefined') return
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return

    const ctx = new AudioCtx()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.frequency.value = frequency
    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(0, ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + duration / 1000)
  } catch {
    // Silently fail
  }
}

/**
 * Achievement unlock: combines haptic + musical ding sequence
 */
export function playAchievementUnlock() {
  haptic('success')
  // Play a 3-note ascending chord (C-E-G major)
  setTimeout(() => playDing(523, 120), 0)   // C5
  setTimeout(() => playDing(659, 120), 120) // E5
  setTimeout(() => playDing(784, 250), 240) // G5
}
