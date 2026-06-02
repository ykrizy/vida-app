import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, CheckCircle } from 'lucide-react'

const PRESETS = [
  { label: '25 min', minutes: 25, emoji: '🍅', desc: 'Pomodoro clássico' },
  { label: '45 min', minutes: 45, emoji: '⚡', desc: 'Sessão longa' },
  { label: '15 min', minutes: 15, emoji: '🌊', desc: 'Sessão curta' },
  { label: '5 min', minutes: 5, emoji: '☕', desc: 'Pausa' },
]

function pad(n: number) {
  return n.toString().padStart(2, '0')
}

export function Focus() {
  const [preset, setPreset] = useState(PRESETS[0])
  const [secondsLeft, setSecondsLeft] = useState(PRESETS[0].minutes * 60)
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const [sessions, setSessions] = useState<{ label: string; at: string }[]>([])
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const total = preset.minutes * 60
  const progress = ((total - secondsLeft) / total) * 100
  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!)
            setRunning(false)
            setFinished(true)
            setSessions(s => [...s, { label: preset.label, at: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) }])
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, preset.label])

  const selectPreset = (p: typeof PRESETS[0]) => {
    setPreset(p)
    setSecondsLeft(p.minutes * 60)
    setRunning(false)
    setFinished(false)
  }

  const reset = () => {
    setSecondsLeft(preset.minutes * 60)
    setRunning(false)
    setFinished(false)
  }

  const circumference = 2 * Math.PI * 54
  const strokeDash = circumference - (progress / 100) * circumference

  return (
    <div className="min-h-svh bg-[#f2f2f7] pb-nav overflow-x-hidden">
      <div className="bg-white px-4 pt-14 pb-4 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-800">Foco</h1>
        <p className="text-sm text-gray-400 mt-0.5">Mantém-te concentrado e produtivo</p>
      </div>

      <div className="px-4 pt-6">
        {/* Presets */}
        <div className="grid grid-cols-4 gap-2 mb-8">
          {PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => selectPreset(p)}
              className={`flex flex-col items-center py-3 rounded-2xl border transition-all ${
                preset.label === p.label
                  ? 'bg-indigo-500 border-indigo-500 text-white'
                  : 'bg-white border-gray-100 text-gray-600'
              }`}
            >
              <span className="text-xl mb-1">{p.emoji}</span>
              <span className="text-xs font-semibold">{p.label}</span>
            </button>
          ))}
        </div>

        {/* Timer circle */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-40 h-40">
            <svg className="w-40 h-40 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="8" />
              <circle
                cx="60" cy="60" r="54" fill="none"
                stroke={finished ? '#22c55e' : '#6366f1'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDash}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {finished ? (
                <CheckCircle size={40} className="text-green-500" />
              ) : (
                <>
                  <span className="text-3xl font-bold text-gray-800 tabular-nums">
                    {pad(minutes)}:{pad(seconds)}
                  </span>
                  <span className="text-xs text-gray-400 mt-1">{preset.desc}</span>
                </>
              )}
            </div>
          </div>

          {finished && (
            <p className="text-green-600 font-semibold mt-3 animate-bounce">
              🎉 Sessão completa!
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-3 justify-center mb-8">
          <button
            onClick={reset}
            className="w-14 h-14 bg-white rounded-full border border-gray-200 flex items-center justify-center text-gray-500 shadow-sm"
          >
            <RotateCcw size={20} />
          </button>
          <button
            onClick={() => setRunning(!running)}
            className={`w-20 h-14 rounded-full flex items-center justify-center text-white shadow-lg font-medium gap-2 transition-all active:scale-95 ${
              running ? 'bg-red-400' : 'bg-indigo-500'
            }`}
          >
            {running ? <Pause size={22} /> : <Play size={22} />}
            {running ? 'Pausa' : 'Iniciar'}
          </button>
        </div>

        {/* Session history */}
        {sessions.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Sessões hoje ({sessions.length})
            </p>
            <div className="space-y-2">
              {[...sessions].reverse().map((s, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full" />
                    <span className="text-gray-700">{s.label} de foco</span>
                  </div>
                  <span className="text-gray-400">{s.at}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-500">
              <span>Total hoje</span>
              <span className="font-semibold text-indigo-600">
                {sessions.reduce((acc, s) => acc + parseInt(s.label), 0)} min
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
