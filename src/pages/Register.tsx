import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

interface Props { onSwitch: () => void }

export function Register({ onSwitch }: Props) {
  const { signUp } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password) return
    if (password.length < 6) { setError('Password com mínimo 6 caracteres.'); return }
    setLoading(true); setError('')
    const { error } = await signUp(email, password, name)
    if (error) setError(error === 'User already registered' ? 'Este email já está registado.' : error)
    else setSuccess(true)
    setLoading(false)
  }

  const headerStyle = {
    background: 'linear-gradient(160deg, #5b5bd6 0%, #7c3aed 60%, #a855f7 100%)',
    paddingTop: 'calc(5rem + env(safe-area-inset-top, 0px))',
    paddingBottom: 'env(safe-area-inset-bottom, 1.5rem)',
  }

  if (success) return (
    <div className="min-h-svh flex flex-col items-center justify-center px-6" style={headerStyle}>
      <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full text-center">
        <div className="text-6xl mb-4">📬</div>
        <h2 className="text-[22px] font-bold text-gray-900 mb-2">Verifica o teu email</h2>
        <p className="text-gray-500 text-[15px] leading-relaxed">
          Enviámos um link para <span className="font-semibold text-gray-700">{email}</span>. Confirma e depois entra.
        </p>
        <button onClick={onSwitch}
          className="mt-6 w-full py-4 bg-indigo-600 text-white rounded-2xl font-semibold text-[15px] active:scale-[0.98] transition-all">
          Ir para Login
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-svh flex flex-col px-6" style={headerStyle}>
      <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-5 backdrop-blur">✨</div>
          <h1 className="text-white text-4xl font-bold tracking-tight">Vida</h1>
          <p className="text-indigo-200 mt-2 text-base">O teu guia de vida</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-2xl">
          <h2 className="text-[22px] font-bold text-gray-900 mb-5">Criar conta</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            {[
              { label: 'Nome', type: 'text', value: name, onChange: setName, placeholder: 'O teu nome', autoComplete: 'name' },
              { label: 'Email', type: 'email', value: email, onChange: setEmail, placeholder: 'o.teu@email.com', autoComplete: 'email' },
              { label: 'Password', type: 'password', value: password, onChange: setPassword, placeholder: 'Mínimo 6 caracteres', autoComplete: 'new-password' },
            ].map(({ label, type, value, onChange, placeholder, autoComplete }) => (
              <div key={label} className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block">{label}</label>
                <input
                  type={type} value={value} onChange={e => onChange(e.target.value)}
                  placeholder={placeholder} autoComplete={autoComplete}
                  className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl text-[15px] text-gray-900 placeholder-gray-400 border border-transparent focus:border-indigo-300 focus:bg-white transition-all"
                />
              </div>
            ))}

            {error && <p className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl">{error}</p>}

            <button
              type="submit" disabled={loading || !name || !email || !password}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-semibold text-[15px] disabled:opacity-40 active:scale-[0.98] transition-all mt-2"
            >
              {loading ? 'A criar conta...' : 'Criar conta'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-400 mt-5">
            Já tens conta?{' '}
            <button onClick={onSwitch} className="text-indigo-600 font-semibold">Entrar</button>
          </p>
        </div>
      </div>
    </div>
  )
}
