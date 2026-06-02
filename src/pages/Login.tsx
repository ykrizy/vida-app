import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

interface Props { onSwitch: () => void }

export function Login({ onSwitch }: Props) {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true); setError('')
    const { error } = await signIn(email, password)
    if (error) setError(error === 'Invalid login credentials' ? 'Email ou password incorretos.' : error)
    setLoading(false)
  }

  return (
    <div
      className="min-h-svh flex flex-col px-6"
      style={{
        background: 'linear-gradient(160deg, #5b5bd6 0%, #7c3aed 60%, #a855f7 100%)',
        paddingTop: 'calc(5rem + env(safe-area-inset-top, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 1.5rem)',
      }}
    >
      {/* Logo */}
      <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-5 backdrop-blur">
            ✨
          </div>
          <h1 className="text-white text-4xl font-bold tracking-tight">Vida</h1>
          <p className="text-indigo-200 mt-2 text-base">O teu guia de vida</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-6 shadow-2xl">
          <h2 className="text-[22px] font-bold text-gray-900 mb-5">Entrar</h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block">Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="o.teu@email.com" autoComplete="email"
                className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl text-[15px] text-gray-900 placeholder-gray-400 border border-transparent focus:border-indigo-300 focus:bg-white transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block">Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" autoComplete="current-password"
                className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl text-[15px] text-gray-900 placeholder-gray-400 border border-transparent focus:border-indigo-300 focus:bg-white transition-all"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl">{error}</p>
            )}

            <button
              type="submit" disabled={loading || !email || !password}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-semibold text-[15px] disabled:opacity-40 active:scale-[0.98] transition-all mt-2"
            >
              {loading ? 'A entrar...' : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-5">
            Não tens conta?{' '}
            <button onClick={onSwitch} className="text-indigo-600 font-semibold">Criar conta</button>
          </p>
        </div>
      </div>
    </div>
  )
}
