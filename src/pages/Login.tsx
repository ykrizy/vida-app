import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

interface Props {
  onSwitch: () => void
}

export function Login({ onSwitch }: Props) {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    setError('')
    const { error } = await signIn(email, password)
    if (error) setError(error)
    setLoading(false)
  }

  return (
    <div className="min-h-svh bg-gradient-to-br from-indigo-600 to-purple-700 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">✨</div>
          <h1 className="text-white text-3xl font-bold">Vida</h1>
          <p className="text-indigo-200 mt-1 text-sm">O teu guia de vida</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-xl">
          <h2 className="text-gray-800 text-xl font-bold mb-5">Entrar</h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="o.teu@email.com"
                autoComplete="email"
                className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm text-gray-800 border border-gray-100 focus:border-indigo-300 focus:bg-white transition-all outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm text-gray-800 border border-gray-100 focus:border-indigo-300 focus:bg-white transition-all outline-none"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-xs text-red-600">
                {error === 'Invalid login credentials'
                  ? 'Email ou password incorretos.'
                  : error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-3.5 bg-indigo-500 text-white rounded-xl font-semibold text-sm disabled:opacity-40 hover:bg-indigo-600 active:scale-95 transition-all mt-1"
            >
              {loading ? 'A entrar...' : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-5">
            Não tens conta?{' '}
            <button onClick={onSwitch} className="text-indigo-500 font-semibold">
              Criar conta
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
