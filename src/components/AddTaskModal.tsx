import { useState } from 'react'
import { X } from 'lucide-react'
import type { Task, Project } from '../types'

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

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
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>([])
  const [projectId, setProjectId] = useState('')

  const toggleDay = (day: number) =>
    setRecurrenceDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])

  const handleSubmit = () => {
    if (!title.trim()) return
    onAdd({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      due_date: isRecurring ? undefined : (dueDate || undefined),
      is_recurring: isRecurring,
      recurrence_days: isRecurring ? recurrenceDays : undefined,
      project_id: projectId || undefined,
      completed: false,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div
        className="w-full max-h-[92svh] overflow-y-auto rounded-t-3xl bg-white"
        style={{ paddingBottom: 'calc(5.5rem + env(safe-area-inset-bottom, 0px))', maxWidth: '448px', marginLeft: 'auto', marginRight: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        <div className="px-5 pb-2 pt-1 flex items-center justify-between">
          <h2 className="text-[18px] font-bold text-gray-900">Nova Tarefa</h2>
          <button onClick={onClose} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        <div className="px-5 space-y-4 pt-2">
          <input
            autoFocus type="text" placeholder="O que precisas de fazer?"
            value={title} onChange={e => setTitle(e.target.value)}
            className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl text-[15px] text-gray-900 placeholder-gray-400"
          />

          <textarea
            placeholder="Descrição (opcional)" value={description}
            onChange={e => setDescription(e.target.value)} rows={2}
            className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl text-[15px] text-gray-900 placeholder-gray-400 resize-none"
          />

          {/* Priority */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2.5">Prioridade</p>
            <div className="flex gap-2">
              {([
                { key: 'low', label: 'Baixa', active: 'bg-gray-500 text-white', dot: 'bg-gray-300' },
                { key: 'medium', label: 'Média', active: 'bg-amber-400 text-white', dot: 'bg-amber-400' },
                { key: 'high', label: 'Alta', active: 'bg-red-500 text-white', dot: 'bg-red-400' },
              ] as const).map(({ key, label, active }) => (
                <button key={key} onClick={() => setPriority(key)}
                  className={`flex-1 py-2.5 rounded-2xl text-sm font-semibold transition-all border ${
                    priority === key ? active + ' border-transparent' : 'bg-gray-50 text-gray-600 border-gray-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Recurring */}
          <div className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3.5">
            <p className="text-[15px] font-medium text-gray-800">Repetir todos os dias</p>
            <button onClick={() => setIsRecurring(!isRecurring)}
              className={`w-12 h-7 rounded-full transition-colors relative ${isRecurring ? 'bg-indigo-500' : 'bg-gray-300'}`}>
              <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all ${isRecurring ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </div>

          {isRecurring ? (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2.5">Dias da semana</p>
              <div className="grid grid-cols-7 gap-1.5">
                {DAYS.map((day, i) => (
                  <button key={i} onClick={() => toggleDay(i)}
                    className={`py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      recurrenceDays.includes(i) ? 'bg-indigo-500 text-white' : 'bg-gray-50 text-gray-500'
                    }`}>
                    {day}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2.5">Data</p>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl text-[15px] text-gray-900"
              />
            </div>
          )}

          {projects.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2.5">Projeto</p>
              <select value={projectId} onChange={e => setProjectId(e.target.value)}
                className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl text-[15px] text-gray-900">
                <option value="">Sem projeto</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>)}
              </select>
            </div>
          )}

          <button onClick={handleSubmit} disabled={!title.trim()}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-semibold text-[15px] disabled:opacity-40 active:scale-[0.98] transition-all">
            Adicionar Tarefa
          </button>
        </div>
      </div>
    </div>
  )
}
