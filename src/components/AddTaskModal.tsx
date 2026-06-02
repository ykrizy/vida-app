import { useState } from 'react'
import { X, Clock, RefreshCw } from 'lucide-react'
import type { Task, Project } from '../types'

const DAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

type RecurrenceType = 'none' | 'daily' | 'weekdays' | 'weekend' | 'weekly' | 'custom'

const RECURRENCE_OPTIONS: { key: RecurrenceType; label: string; sub?: string; days?: number[] }[] = [
  { key: 'none',     label: 'Nunca' },
  { key: 'daily',    label: 'Todos os dias',   sub: 'Diário',      days: [0,1,2,3,4,5,6] },
  { key: 'weekdays', label: 'Dias úteis',       sub: 'Seg – Sex',   days: [1,2,3,4,5] },
  { key: 'weekend',  label: 'Fim de semana',    sub: 'Sáb – Dom',   days: [0,6] },
  { key: 'custom',   label: 'Personalizado' },
]

interface Props {
  onClose: () => void
  onAdd: (task: Omit<Task, 'id' | 'created_at' | 'user_id'>) => void
  projects: Project[]
  defaultDate?: string
}

export function AddTaskModal({ onClose, onAdd, projects, defaultDate }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Task['priority']>('medium')
  const [dueDate, setDueDate] = useState(defaultDate || '')
  const [dueTime, setDueTime] = useState('')
  const [hasTime, setHasTime] = useState(false)
  const [recurrence, setRecurrence] = useState<RecurrenceType>('none')
  const [customDays, setCustomDays] = useState<number[]>([])
  const [projectId, setProjectId] = useState('')

  const isRecurring = recurrence !== 'none'

  const toggleCustomDay = (day: number) =>
    setCustomDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )

  const getRecurrenceDays = (): number[] | undefined => {
    const preset = RECURRENCE_OPTIONS.find(o => o.key === recurrence)
    if (preset?.days) return preset.days
    if (recurrence === 'custom') return customDays
    return undefined
  }

  const handleSubmit = () => {
    if (!title.trim()) return
    if (recurrence === 'custom' && customDays.length === 0) return
    onAdd({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      due_date: isRecurring ? undefined : (dueDate || undefined),
      due_time: hasTime && dueTime ? dueTime : undefined,
      is_recurring: isRecurring,
      recurrence_days: isRecurring ? getRecurrenceDays() : undefined,
      project_id: projectId || undefined,
      completed: false,
    })
    onClose()
  }

  const canSubmit = title.trim() && (recurrence !== 'custom' || customDays.length > 0)

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-h-[92svh] overflow-y-auto rounded-t-3xl bg-white"
        style={{
          paddingBottom: 'calc(5.5rem + env(safe-area-inset-bottom, 0px))',
          maxWidth: '448px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        <div className="px-5 pb-2 pt-1 flex items-center justify-between">
          <h2 className="text-[18px] font-bold text-gray-900">Nova Tarefa</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0"
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        <div className="px-5 space-y-4 pt-2">
          {/* Title */}
          <input
            autoFocus
            type="text"
            placeholder="O que precisas de fazer?"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl text-[15px] text-gray-900 placeholder-gray-400"
          />

          {/* Description */}
          <textarea
            placeholder="Descrição (opcional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl text-[15px] text-gray-900 placeholder-gray-400 resize-none"
          />

          {/* Priority */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2.5">
              Prioridade
            </p>
            <div className="flex gap-2">
              {([
                { key: 'low',    label: 'Baixa', active: 'bg-gray-500 text-white' },
                { key: 'medium', label: 'Média', active: 'bg-amber-400 text-white' },
                { key: 'high',   label: 'Alta',  active: 'bg-red-500 text-white' },
              ] as const).map(({ key, label, active }) => (
                <button
                  key={key}
                  onClick={() => setPriority(key)}
                  className={`flex-1 py-2.5 rounded-2xl text-sm font-semibold transition-all border ${
                    priority === key
                      ? active + ' border-transparent'
                      : 'bg-gray-50 text-gray-600 border-gray-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Recurrence ── */}
          <div>
            <div className="flex items-center gap-1.5 mb-2.5">
              <RefreshCw size={12} className="text-gray-400" />
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Repetição
              </p>
            </div>

            {/* Preset chips — horizontal scroll */}
            <div
              className="flex gap-2 overflow-x-auto pb-0.5"
              style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
            >
              {RECURRENCE_OPTIONS.map(({ key, label, sub }) => {
                const active = recurrence === key
                return (
                  <button
                    key={key}
                    onClick={() => setRecurrence(key)}
                    className={`flex-shrink-0 rounded-2xl px-3.5 py-2 text-left transition-all border ${
                      active
                        ? 'bg-indigo-500 border-transparent'
                        : 'bg-gray-50 border-gray-100'
                    }`}
                  >
                    <span className={`block text-sm font-semibold ${active ? 'text-white' : 'text-gray-700'}`}>
                      {label}
                    </span>
                    {sub && (
                      <span className={`block text-[10px] font-medium mt-0.5 ${active ? 'text-indigo-200' : 'text-gray-400'}`}>
                        {sub}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Custom day picker */}
            {recurrence === 'custom' && (
              <div className="mt-3 bg-gray-50 rounded-2xl p-3">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2.5">
                  Dias da semana
                </p>
                <div className="grid grid-cols-7 gap-1.5">
                  {DAYS_SHORT.map((day, i) => (
                    <button
                      key={i}
                      onClick={() => toggleCustomDay(i)}
                      className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                        customDays.includes(i)
                          ? 'bg-indigo-500 text-white shadow-sm'
                          : 'bg-white text-gray-500 border border-gray-100'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
                {customDays.length === 0 && (
                  <p className="text-[11px] text-red-400 mt-2 text-center">
                    Seleciona pelo menos um dia
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Date — only when not recurring */}
          {!isRecurring && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2.5">
                Data
              </p>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl text-[15px] text-gray-900"
              />
            </div>
          )}

          {/* Time */}
          <div>
            <div className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3.5">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-gray-400" />
                <p className="text-[15px] font-medium text-gray-800">Hora específica</p>
              </div>
              <button
                onClick={() => { setHasTime(!hasTime); if (hasTime) setDueTime('') }}
                className={`w-12 h-7 rounded-full transition-colors relative ${hasTime ? 'bg-indigo-500' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all ${hasTime ? 'left-[22px]' : 'left-0.5'}`} />
              </button>
            </div>
            {hasTime && (
              <div className="mt-2">
                <input
                  type="time"
                  value={dueTime}
                  onChange={e => setDueTime(e.target.value)}
                  className="w-full px-4 py-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl text-[18px] font-semibold text-indigo-700 text-center"
                />
              </div>
            )}
          </div>

          {/* Project */}
          {projects.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2.5">
                Projeto
              </p>
              <select
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
                className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl text-[15px] text-gray-900"
              >
                <option value="">Sem projeto</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-semibold text-[15px] disabled:opacity-40 active:scale-[0.98] transition-all"
          >
            Adicionar Tarefa
          </button>
        </div>
      </div>
    </div>
  )
}
