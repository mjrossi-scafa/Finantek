'use client'
import { useState } from 'react'
import { Lock, Eye, EyeOff, CheckCircle, Circle } from 'lucide-react'
import { usePasswordValidation } from '@/hooks/usePasswordValidation'

interface PasswordInputProps {
  value: string
  onChange: (value: string) => void
  label?: string
  showRequirements?: boolean
  placeholder?: string
}

export function PasswordInput({
  value,
  onChange,
  label = 'Contraseña',
  showRequirements = false,
  placeholder = '••••••••',
}: PasswordInputProps) {
  const [show, setShow] = useState(false)
  const [touched, setTouched] = useState(false)
  const { error, isValid, requirements, validate } = usePasswordValidation()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
    if (touched) validate(e.target.value)
  }

  const handleBlur = () => {
    setTouched(true)
    validate(value)
  }

  const reqs = [
    { key: 'minLength', label: 'Mínimo 6 caracteres' },
    { key: 'hasLetter', label: 'Al menos una letra' },
    { key: 'hasNumber', label: 'Al menos un número' },
  ]

  return (
    <div>
      <label className="text-sm text-gray-300 block mb-2">
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <Lock size={16} style={{
          position: 'absolute', left: '14px', top: '50%',
          transform: 'translateY(-50%)',
          color: '#6B7280'
        }}/>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="w-full rounded-xl text-white placeholder-gray-500 focus:outline-none transition-all"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: `1px solid ${
              !touched ? 'rgba(255,255,255,0.1)' :
              error ? '#EF4444' :
              isValid ? '#84CC16' :
              'rgba(255,255,255,0.1)'
            }`,
            padding: '14px 40px',
            fontSize: '16px',
          }}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          style={{
            position: 'absolute', right: '14px', top: '50%',
            transform: 'translateY(-50%)',
            background: 'none', border: 'none',
            cursor: 'pointer', color: '#6B7280', padding: 0,
          }}>
          {show ? <EyeOff size={16}/> : <Eye size={16}/>}
        </button>
      </div>

      {touched && error && (
        <p className="text-xs mt-1.5" style={{ color: '#EF4444' }}>
          {error}
        </p>
      )}

      {showRequirements && value && (
        <div className="mt-2 space-y-1">
          {reqs.map(req => (
            <div key={req.key} className="flex items-center gap-1.5">
              {requirements[req.key as keyof typeof requirements]
                ? <CheckCircle size={11} color="#84CC16"/>
                : <Circle size={11} color="#3B1D6E"/>
              }
              <span style={{
                fontSize: '10px',
                color: requirements[req.key as keyof typeof requirements]
                  ? '#84CC16' : '#3B1D6E'
              }}>
                {req.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}