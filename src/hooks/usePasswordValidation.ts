import { useState, useCallback } from 'react'

export interface PasswordRequirements {
  minLength: boolean
  hasNumber: boolean
  hasLetter: boolean
}

export function usePasswordValidation() {
  const [error, setError] = useState('')
  const [isValid, setIsValid] = useState(false)
  const [requirements, setRequirements] = useState<PasswordRequirements>({
    minLength: false,
    hasNumber: false,
    hasLetter: false,
  })

  const validate = useCallback((password: string) => {
    const reqs = {
      minLength: password.length >= 6,
      hasNumber: /\d/.test(password),
      hasLetter: /[a-zA-Z]/.test(password),
    }
    setRequirements(reqs)

    if (!password) {
      setError('')
      setIsValid(false)
      return false
    }

    if (!reqs.minLength) {
      setError('Mínimo 6 caracteres')
      setIsValid(false)
      return false
    }

    setError('')
    setIsValid(true)
    return true
  }, [])

  return { error, isValid, requirements, validate }
}