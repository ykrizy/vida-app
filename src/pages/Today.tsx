import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { pt } from 'date-fns/locale'
import { Plus, Smile, Meh, Frown, LogOut } from 'lucide-react'
import { useTasks } from '../hooks/useTasks'
import { useProjects } from '../hooks/useProjects'
import { useLogs } from '../hooks/useLogs'
import { useAuth } from '../contexts/AuthContext'
import { TaskItem } from '../components/TaskItem'
import { AddTaskModal } from '../components/AddTaskModal'

const MOODS = [
  { icon: Frown, label: 'Mau', value: 1, color: 'text-red-400' },
  { icon: Meh, label: 'Ok', value: 3, color: 'text-amber-400' },
  { icon: Smile, label: 'Bom', value: 5, color: 'text-green-400' },
]

export function Today() {
  const { user, signOut } = useAuth()
  const { getTodayTasks, toggleTask, deleteTask, addTask } = useTasks()
  const { projects } = useProjects()
  const { upsertLog, getLogByDate, fetchLogs } = useLogs()
  const [showAdd, setShowAdd] = useState(false)
  const [mood, setMood] = useState<number | undefined>()
  const [note, setNote] = useState('')
  const [noteSaved, setNoteSaved] = useState(false)

  const today = new Date()
  const todayStr = format(today, 'yyyy-MM-dd')
  const tasks = getTodayTasks()
  const completed = tasks.filter(t => t.completed).length
  const progress = tasks.length > 0 ? (completed / tasks.length) * 100 : 0
  const userName = user?.user_metadata?.name?.split(' ')[0] || 'olá'

  useEffect(() => {
    fetchLogs().then(() => {
      const log = getLogByDate(todayStr)
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

  const hour = today.getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 19 ? 'Boa tarde' : 'Boa noite'

  return (
    <div className="min-h-svh bg-gray-50 pb-safe">
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 px-5 pt-14 pb-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-indigo-200 text-sm capitalize">
              {format(today, "EEEE, d 'de' MMMM", { locale: pt })}
            </p>
            <h1 className="text-white text-2xl font-bold mt-1">{greeting}, {userName}! 👋</h1>
          </div>
          <button
            onClick={signOut}
            className="mt-1 p-2 rounded-full bg-white/10 text-white/70 hover:bg-white/20 transition-colors"
            title="Sair"
          >
            <LogOut size={18} />
          </button>
        </div>

        <div className="mt-5 bg-white/10 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/80 text-sm">{completed}/{tasks.length} tarefas</span>
            <span className="text-white font-semibold">{Math.round(progress)}%</span>
          </div>
          <div className="bg-white/20 rounded-full h-2">
            <div
              className="bg-white rounded-full h-2 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4">
        {/* Mood */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">Como te sentes hoje?</p>
          <div className="flex gap-3 justify-around">
            {MOODS.map(({ icon: Icon, label, value, color }) => (
              <button
                key={value}
                onClick={() => saveMood(value)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                  mood === value ? 'bg-indigo-50 scale-110' : 'hover:bg-gray-50'
                }`}
              >
                <Icon size={28} className={color} />
                <span className="text-xs text-gray-500">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tasks */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-800">Tarefas de hoje</h2>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1 text-indigo-600 text-sm font-medium"
            >
              <Plus size={18} /> Adicionar
            </button>
          </div>

          {tasks.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-4xl mb-2">✨</p>
              <p className="text-sm">Sem tarefas para hoje.</p>
              <p className="text-xs mt-1">Adiciona a primeira!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tasks
                .sort((a, b) => {
                  const pOrder = { high: 0, medium: 1, low: 2 }
                  if (a.completed !== b.completed) return a.completed ? 1 : -1
                  return pOrder[a.priority] - pOrder[b.priority]
                })
                .map(task => (
                  <TaskItem key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
                ))}
            </div>
          )}
        </div>

        {/* Daily note */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-2">Nota do dia</p>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Como foi o teu dia? O que conseguiste? O que podes melhorar?"
            rows={3}
            className="w-full text-sm text-gray-700 placeholder-gray-400 resize-none border border-gray-100 rounded-xl px-3 py-2 focus:border-indigo-300 focus:outline-none transition-all"
          />
          <button
            onClick={saveNote}
            className={`mt-2 w-full py-2.5 rounded-xl text-sm font-medium transition-all ${
              noteSaved ? 'bg-green-500 text-white' : 'bg-indigo-500 text-white hover:bg-indigo-600'
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
