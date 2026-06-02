import { useState } from 'react'
import { Plus, X, Flame, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { useHabits } from '../hooks/useHabits'
import type { Habit } from '../types'

const HABIT_EMOJIS = ['🏋️', '💧', '📚', '🧘', '🏃', '💊', '✏️', '🎸', '🌿', '🥗', '😴', '🚫', '🧹', '💰', '❤️', '🧠']
const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#22c55e', '#14b8a6', '#3b82f6', '#ef4444']

type RecurrencePreset = 'daily' | 'weekdays' | 'weekend' | 'custom'
const RECURRENCE: { key: RecurrencePreset; label: string; sub?: string; days?: number[] }[] = [
  { key: 'daily',    label: 'Todos os dias',  days: [0,1,2,3,4,5,6] },
  { key: 'weekdays', label: 'Dias úteis',     sub: 'Seg–Sex', days: [1,2,3,4,5] },
  { key: 'weekend',  label: 'Fim de semana',  sub: 'Sáb–Dom', days: [0,6] },
  { key: 'custom',   label: 'Personalizado' },
]
const DAY_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function AddHabitModal({ onClose, onAdd }: { onClose: () => void; onAdd: (h: Omit<Habit, 'id' | 'user_id' | 'created_at'>) => void }) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState(HABIT_EMOJIS[0])
  const [color, setColor] = useState(COLORS[0])
  const [preset, setPreset] = useState<RecurrencePreset>('daily')
  const [customDays, setCustomDays] = useState<number[]>([])

  const toggleDay = (d: number) => setCustomDays(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d])

  const getFrequencyDays = (): number[] => {
    const found = RECURRENCE.find(r => r.key === preset)
    if (found?.days) return found.days
    return customDays
  }

  const canSubmit = name.trim() && (preset !== 'custom' || customDays.length > 0)

  return (
    <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div
        className="w-full max-h-[92svh] overflow-y-auto rounded-t-3xl bg-white"
        style={{ paddingBottom: 'calc(5.5rem + env(safe-area-inset-bottom, 0px))', maxWidth: '448px', marginLeft: 'auto', marginRight: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 bg-gray-200 rounded-full" /></div>
        <div className="px-5 pb-2 pt-1 flex items-center justify-between">
          <h2 className="text-[18px] font-bold text-gray-900">Novo Hábito</h2>
          <button onClick={onClose} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center"><X size={16} className="text-gray-500" /></button>
        </div>
        <div className="px-5 space-y-4 pt-2">
          {/* Emoji */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2.5">Emoji</p>
            <div className="flex flex-wrap gap-2">
              {HABIT_EMOJIS.map(e => (
                <button key={e} onClick={() => setEmoji(e)}
                  className={`text-2xl p-2 rounded-xl transition-all ${emoji === e ? 'bg-indigo-100 scale-110' : 'bg-gray-50'}`}>{e}</button>
              ))}
            </div>
          </div>

          {/* Name */}
          <input
            autoFocus type="text" placeholder="Nome do hábito"
            value={name} onChange={e => setName(e.target.value)}
            className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl text-[15px] text-gray-900 placeholder-gray-400"
          />

          {/* Recurrence */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2.5">Repetição</p>
            <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' } as React.CSSProperties}>
              {RECURRENCE.map(({ key, label, sub }) => (
                <button key={key} onClick={() => setPreset(key)}
                  className={`flex-shrink-0 rounded-2xl px-3.5 py-2 text-left border transition-all ${preset === key ? 'bg-indigo-500 border-transparent' : 'bg-gray-50 border-gray-100'}`}>
                  <span className={`block text-sm font-semibold ${preset === key ? 'text-white' : 'text-gray-700'}`}>{label}</span>
                  {sub && <span className={`block text-[10px] font-medium mt-0.5 ${preset === key ? 'text-indigo-200' : 'text-gray-400'}`}>{sub}</span>}
                </button>
              ))}
            </div>
            {preset === 'custom' && (
              <div className="mt-3 grid grid-cols-7 gap-1.5">
                {DAY_SHORT.map((d, i) => (
                  <button key={i} onClick={() => toggleDay(i)}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all ${customDays.includes(i) ? 'bg-indigo-500 text-white' : 'bg-gray-50 text-gray-500 border border-gray-100'}`}>{d}</button>
                ))}
              </div>
            )}
          </div>

          {/* Color */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2.5">Cor</p>
            <div className="flex gap-3">
              {COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)}
                  className={`w-9 h-9 rounded-full transition-all ${color === c ? 'scale-125 ring-2 ring-offset-2 ring-gray-400' : ''}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>

          <button
            disabled={!canSubmit}
            onClick={() => { if (canSubmit) { onAdd({ name, emoji, color, frequency_days: getFrequencyDays() }); onClose() } }}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-semibold text-[15px] disabled:opacity-40 active:scale-[0.98] transition-all"
          >
            Criar Hábito
          </button>
        </div>
      </div>
    </div>
  )
}

export function Habits() {
  const { habits, loading, addHabit, deleteHabit, toggleCompletion, isCompleted, getStreak, getLast7Days } = useHabits()
  const [showAdd, setShowAdd] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const today = format(new Date(), 'yyyy-MM-dd')
  const todayDow = new Date().getDay()

  const todayHabits = habits.filter(h => h.frequency_days.includes(todayDow))
  const todayDone = todayHabits.filter(h => isCompleted(h.id, today)).length
  const progress = todayHabits.length > 0 ? (todayDone / todayHabits.length) * 100 : 0

  return (
    <div className="min-h-svh bg-[#f2f2f7] pb-nav overflow-x-hidden">
      {/* Header */}
      <div
        className="px-5 pb-6"
        style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          paddingTop: 'calc(3.5rem + env(safe-area-inset-top, 0px))',
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-indigo-200 text-sm font-medium">Construindo hábitos</p>
            <h1 className="text-white text-[26px] font-bold mt-0.5 tracking-tight">Hábitos</h1>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.2)' }}
          >
            <Plus size={20} className="text-white" />
          </button>
        </div>

        {/* Progress */}
        <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.15)' }}>
          <div className="flex justify-between items-center mb-2">
            <p className="text-white font-semibold">{todayDone}/{todayHabits.length} hoje</p>
            <p className="text-indigo-200 text-sm">{Math.round(progress)}%</p>
          </div>
          <div className="rounded-full h-2" style={{ background: 'rgba(255,255,255,0.25)' }}>
            <div className="h-2 rounded-full bg-white transition-all duration-700" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-3">
        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <div className="w-6 h-6 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mx-auto" />
          </div>
        ) : habits.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-3">🌱</p>
            <p className="font-semibold text-gray-700">Sem hábitos ainda</p>
            <p className="text-sm text-gray-400 mt-1">Toca em + para criar o teu primeiro</p>
          </div>
        ) : (
          habits.map(habit => {
            const scheduledToday = habit.frequency_days.includes(todayDow)
            const done = isCompleted(habit.id, today)
            const streak = getStreak(habit)
            const last7 = getLast7Days(habit.id)

            return (
              <div
                key={habit.id}
                className={`bg-white rounded-2xl p-4 transition-all ${!scheduledToday ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center gap-3">
                  {/* Completion circle */}
                  <button
                    onClick={() => scheduledToday && toggleCompletion(habit.id, today)}
                    disabled={!scheduledToday}
                    className={`w-11 h-11 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      done
                        ? 'border-transparent active:scale-90'
                        : 'border-gray-200 active:scale-90'
                    }`}
                    style={done ? { backgroundColor: habit.color, borderColor: habit.color } : {}}
                  >
                    {done ? (
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-xl">{habit.emoji}</span>
                    )}
                  </button>

                  {/* Name + streak */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {!done && <span className="text-base">{habit.emoji}</span>}
                      <p className={`text-[15px] font-semibold ${done ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                        {habit.name}
                      </p>
                    </div>
                    {!scheduledToday && (
                      <p className="text-xs text-gray-400 mt-0.5">Não agendado hoje</p>
                    )}
                    {/* Last 7 days mini dots */}
                    <div className="flex items-center gap-1 mt-1.5">
                      {last7.map(({ date, done: d }) => (
                        <div
                          key={date}
                          className="w-4 h-4 rounded-full transition-all"
                          style={{ backgroundColor: d ? habit.color : '#e5e7eb' }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Streak + delete */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {streak > 0 && (
                      <div className="flex items-center gap-1 bg-orange-50 rounded-full px-2.5 py-1">
                        <Flame size={12} className="text-orange-500" />
                        <span className="text-xs font-bold text-orange-600">{streak}</span>
                      </div>
                    )}
                    <button
                      onClick={() => setConfirmDeleteId(habit.id)}
                      className="text-gray-200 active:text-red-400 transition-colors p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Delete confirmation */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full bg-white rounded-t-3xl p-6" style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}>
            <p className="text-[18px] font-bold text-gray-900 mb-1">Eliminar hábito?</p>
            <p className="text-gray-500 text-sm mb-6">
              O historial e streak serão perdidos.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => { deleteHabit(confirmDeleteId); setConfirmDeleteId(null) }}
                className="w-full py-4 bg-red-500 text-white rounded-2xl font-semibold"
              >Sim, eliminar</button>
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="w-full py-4 bg-gray-100 text-gray-700 rounded-2xl font-semibold"
              >Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {showAdd && <AddHabitModal onClose={() => setShowAdd(false)} onAdd={addHabit} />}
    </div>
  )
}
