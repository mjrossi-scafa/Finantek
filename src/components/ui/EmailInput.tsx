'use client'
import { useState } from 'react'
import { Mail, CheckCircle, XCircle } from 'lucide-react'
import { useEmailValidation } from '@/hooks/useEmailValidation'

interface EmailInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function EmailInput({
  value,
  onChange,
  placeholder = 'tu@email.com',
}: EmailInputProps) {
  const { error, isValid, validate } = useEmailValidation()
  const [touched, setTouched] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
    if (touched) validate(e.target.value)
  }

  const handleBlur = () => {
    setTouched(true)
    validate(value)
  }

  return (
    <div>
      <label className="text-sm text-gray-300 block mb-2">
        Correo electrónico
      </label>
      <div style={{ position: 'relative' }}>
        <Mail size={16} style={{
          position: 'absolute', left: '14px', top: '50%',
          transform: 'translateY(-50%)',
          color: error && touched ? '#EF4444' : '#6B7280'
        }}/>
        <input
          type="email"
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
        {touched && (
          <div style={{
            position: 'absolute', right: '14px', top: '50%',
            transform: 'translateY(-50%)'
          }}>
            {isValid
              ? <CheckCircle size={16} color="#84CC16"/>
              : error
                ? <XCircle size={16} color="#EF4444"/>
                : null
            }
          </div>
        )}
      </div>
      {touched && error && (
        <p className="text-xs mt-1.5" style={{ color: '#EF4444' }}>
          {error}
        </p>
      )}
    </div>
  )
}