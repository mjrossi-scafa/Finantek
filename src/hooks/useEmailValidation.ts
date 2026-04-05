import { useState, useCallback } from 'react'

export function useEmailValidation() {
  const [error, setError] = useState('')
  const [isValid, setIsValid] = useState(false)

  const validate = useCallback((email: string) => {
    if (!email) {
      setError('')
      setIsValid(false)
      return false
    }

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!regex.test(email)) {
      setError('Ingresa un correo electrónico válido')
      setIsValid(false)
      return false
    }

    const erroresTipicos: Record<string, string> = {
      'gmai': '¿Quisiste decir gmail.com?',
      'gmial': '¿Quisiste decir gmail.com?',
      'hotmai': '¿Quisiste decir hotmail.com?',
      'outloo': '¿Quisiste decir outlook.com?',
      'yaho': '¿Quisiste decir yahoo.com?',
    }

    const dominioSinTLD = email.split('@')[1]?.split('.')[0]?.toLowerCase()

    if (dominioSinTLD && erroresTipicos[dominioSinTLD]) {
      setError(erroresTipicos[dominioSinTLD])
      setIsValid(false)
      return false
    }

    setError('')
    setIsValid(true)
    return true
  }, [])

  const reset = useCallback(() => {
    setError('')
    setIsValid(false)
  }, [])

  return { error, isValid, validate, reset }
}