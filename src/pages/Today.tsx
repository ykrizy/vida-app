import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { pt } from 'date-fns/locale'
import { Plus, LogOut } from 'lucide-react'
import { useTasks } from '../hooks/useTasks'
import { useProjects } from '../hooks/useProjects'
import { useLogs } from '../hooks/useLogs'
import { useAuth } from '../contexts/AuthContext'
import { TaskItem } from '../components/TaskItem'
import { AddTaskModal } from '../components/AddTaskModal'

const MOODS = [
  { emoji: '😞', label: 'Mau', value: 1 },
  { emoji: '😐', label: 'Ok', value: 3 },
  { emoji: '😄', label: 'Bom', value: 5 },
]

export function Today() {
  const { user, signOut } = useAuth()
  const { getTodayTasks, toggleTask, deleteTask, addTask } = useTasks()
  const { projects } = useProjects()
  const { upsertLog, fetchLogs } = useLogs()
  const [showAdd, setShowAdd] = useState(false)
  const [mood, setMood] = useState<number | undefined>()
  const [note, setNote] = useState('')
  const [noteSaved, setNoteSaved] = useState(false)

  const today = new Date()
  const todayStr = format(today, 'yyyy-MM-dd')
  const tasks = getTodayTasks()
  const completed = tasks.filter(t => t.completed).length
  const progress = tasks.length > 0 ? (completed / tasks.length) * 100 : 0
  const userName = user?.user_metadata?.name?.split(' ')[0] || ''
  const hour = today.getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 19 ? 'Boa tarde' : 'Boa noite'

  useEffect(() => {
    // Usa os dados devolvidos diretamente, não o estado (que ainda não atualizou)
    fetchLogs().then((data) => {
      const log = data.find((l: { date: string; mood?: number; notes?: string }) => l.date === todayStr)
      if (log) {
        setMood(log.mood)
        setNote(log.notes || '')
      }
    })
  }, [todayStr])

  const saveMood = async (value: number) => {
    setMood(value)
    await upsertLog({ date: todayStr, mood: value, notes: note })
  }

  const saveNote = async () => {
    await upsertLog({ date: todayStr, mood, notes: note })
    setNoteSaved(true)
    setTimeout(() => setNoteSaved(false), 2000)
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    // Completas vão para o fundo
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    // Tarefas com hora aparecem primeiro, ordenadas por hora
    if (a.due_time && b.due_time) return a.due_time.localeCompare(b.due_time)
    if (a.due_time) return -1
    if (b.due_time) return 1
    // Depois por prioridade
    const p = { high: 0, medium: 1, low: 2 }
    return p[a.priority] - p[b.priority]
  })

  return (
    <div className="min-h-svh bg-[#f2f2f7] pb-nav">

      {/* Header */}
      <div
        className="px-5 pb-6"
        style={{
          background: 'linear-gradient(135deg, #5b5bd6 0%, #7c3aed 100%)',
          paddingTop: 'calc(3.5rem + env(safe-area-inset-top, 0px))',
        }}
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-indigo-200 text-sm capitalize font-medium">
              {format(today, "EEEE, d 'de' MMMM", { locale: pt })}
            </p>
            <h1 className="text-white text-[26px] font-bold mt-0.5 tracking-tight">
              {greeting}{userName ? `, ${userName}` : ''}! 👋
            </h1>
          </div>
          <button
            onClick={signOut}
            className="mt-1 w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            <LogOut size={16} className="text-white" />
          </button>
        </div>

        {/* Progress card */}
        <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.15)' }}>
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-white font-semibold text-lg">{Math.round(progress)}%</p>
              <p className="text-indigo-200 text-xs">concluído hoje</p>
            </div>
            <p className="text-white/80 text-sm">{completed} / {tasks.length} tarefas</p>
          </div>
          <div className="rounded-full h-1.5" style={{ background: 'rgba(255,255,255,0.25)' }}>
            <div
              className="h-1.5 rounded-full bg-white transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="px-4 -mt-1 space-y-4 pt-4">

        {/* Mood */}
        <div className="bg-white rounded-2xl overflow-hidden">
          <div className="px-4 pt-4 pb-1">
            <p className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide">Como te sentes?</p>
          </div>
          <div className="flex divide-x divide-gray-100">
            {MOODS.map(({ emoji, label, value }) => (
              <button
                key={value}
                onClick={() => saveMood(value)}
                className={`flex-1 flex flex-col items-center py-3.5 gap-1 transition-all ${
                  mood === value ? 'bg-indigo-50' : 'active:bg-gray-50'
                }`}
              >
                <span className={`text-2xl transition-transform ${mood === value ? 'scale-125' : ''}`}>{emoji}</span>
                <span className={`text-xs font-medium ${mood === value ? 'text-indigo-600' : 'text-gray-400'}`}>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tasks section */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <p className="text-[17px] font-bold text-gray-900">Tarefas de hoje</p>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 bg-indigo-500 text-white text-sm font-semibold px-3.5 py-2 rounded-full active:scale-95 transition-transform"
            >
              <Plus size={15} strokeWidth={2.5} />
              Adicionar
            </button>
          </div>

          {tasks.length === 0 ? (
            <div className="bg-white rounded-2xl py-12 text-center">
              <p className="text-4xl mb-2">✨</p>
              <p className="text-gray-500 font-medium text-[15px]">Sem tarefas para hoje</p>
              <p className="text-gray-400 text-sm mt-1">Toca em Adicionar para começar</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedTasks.map(task => (
                <TaskItem key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
              ))}
            </div>
          )}
        </div>

        {/* Note */}
        <div className="bg-white rounded-2xl overflow-hidden">
          <div className="px-4 pt-4 pb-2">
            <p className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide">Nota do dia</p>
          </div>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Como foi o teu dia? O que conseguiste?"
            rows={3}
            className="w-full px-4 pb-3 text-[15px] text-gray-800 placeholder-gray-300 resize-none bg-transparent"
          />
          <button
            onClick={saveNote}
            className={`w-full py-3.5 text-sm font-semibold transition-all border-t border-gray-100 ${
              noteSaved ? 'text-green-600 bg-green-50' : 'text-indigo-600 active:bg-indigo-50'
            }`}
          >
            {noteSaved ? '✓ Guardado' : 'Guardar nota'}
          </button>
        </div>

      </div>

      {showAdd && (
        <AddTaskModal
          onClose={() => setShowAdd(false)}
          onAdd={addTask}
          projects={projects}
          defaultDate={todayStr}
        />
      )}
    </div>
  )
}
