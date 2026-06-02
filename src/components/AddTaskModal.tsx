import { useState } from 'react'
import { X, RefreshCw } from 'lucide-react'
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

  const toggleDay = (day: number) => {
    setRecurrenceDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

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
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end" onClick={onClose}>
      <div
        className="bg-white rounded-t-2xl w-full p-5 pb-8 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Nova Tarefa</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3">
          <input
            autoFocus
            type="text"
            placeholder="O que precisas de fazer?"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm text-gray-800 placeholder-gray-400 border border-gray-100 focus:border-indigo-300 focus:bg-white transition-all"
          />

          <textarea
            placeholder="Descrição (opcional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm text-gray-800 placeholder-gray-400 border border-gray-100 focus:border-indigo-300 focus:bg-white transition-all resize-none"
          />

          {/* Priority */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Prioridade</p>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${
                    priority === p
                      ? p === 'high' ? 'bg-red-500 text-white border-red-500'
                        : p === 'medium' ? 'bg-amber-400 text-white border-amber-400'
                        : 'bg-gray-400 text-white border-gray-400'
                      : 'bg-gray-50 text-gray-500 border-gray-100'
                  }`}
                >
                  {p === 'high' ? 'Alta' : p === 'medium' ? 'Média' : 'Baixa'}
                </button>
              ))}
            </div>
          </div>

          {/* Recurring toggle */}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2">
              <RefreshCw size={16} className="text-gray-400" />
              <span className="text-sm text-gray-700">Tarefa recorrente</span>
            </div>
            <button
              onClick={() => setIsRecurring(!isRecurring)}
              className={`w-11 h-6 rounded-full transition-colors relative ${isRecurring ? 'bg-indigo-500' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${isRecurring ? 'left-5' : 'left-0.5'}`} />
            </button>
          </div>

          {isRecurring ? (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Repetir nos dias</p>
              <div className="flex gap-1.5">
                {DAYS.map((day, i) => (
                  <button
                    key={i}
                    onClick={() => toggleDay(i)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                      recurrenceDays.includes(i)
                        ? 'bg-indigo-500 text-white'
                        : 'bg-gray-50 text-gray-500 border border-gray-100'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Data</p>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm text-gray-800 border border-gray-100 focus:border-indigo-300 focus:bg-white transition-all"
              />
            </div>
          )}

          {projects.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Projeto</p>
              <select
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm text-gray-800 border border-gray-100 focus:border-indigo-300 transition-all"
              >
                <option value="">Nenhum projeto</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="w-full py-3.5 bg-indigo-500 text-white rounded-xl font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-600 active:scale-95 transition-all"
          >
            Adicionar Tarefa
          </button>
        </div>
      </div>
    </div>
  )
}
