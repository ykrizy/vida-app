import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { pt } from 'date-fns/locale'
import { Plus, LogOut, BookOpen, Bell } from 'lucide-react'
import { useTasks } from '../hooks/useTasks'
import { useProjects } from '../hooks/useProjects'
import { useLogs } from '../hooks/useLogs'
import { useHabits } from '../hooks/useHabits'
import { useAuth } from '../contexts/AuthContext'
import { TaskItem } from '../components/TaskItem'
import { AddTaskModal } from '../components/AddTaskModal'
import { JournalModal } from '../components/JournalModal'
import { getLevelInfo, computeXP } from '../utils/gamification'
import { requestNotificationPermission, scheduleTodayNotifications } from '../utils/notifications'

const MOODS = [
  { emoji: '😞', label: 'Mau', value: 1 },
  { emoji: '😐', label: 'Ok',  value: 3 },
  { emoji: '😄', label: 'Bom', value: 5 },
]

export function Today() {
  const { user, signOut } = useAuth()
  const { tasks, getTodayTasks, toggleTask, deleteTask, addTask } = useTasks()
  const { projects } = useProjects()
  const { upsertLog, fetchLogs, logs } = useLogs()
  const { completions, getMissedHabitsCount } = useHabits()

  const [showAdd, setShowAdd] = useState(false)
  const [showJournal, setShowJournal] = useState(false)
  const [mood, setMood] = useState<number | undefined>()
  const [notifAsked, setNotifAsked] = useState(false)

  const today = new Date()
  const todayStr = format(today, 'yyyy-MM-dd')
  const dayTasks = getTodayTasks()
  const completed = dayTasks.filter(t => t.completed).length
  const progress = dayTasks.length > 0 ? (completed / dayTasks.length) * 100 : 0
  const userName = user?.user_metadata?.name?.split(' ')[0] || ''
  const hour = today.getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 19 ? 'Boa tarde' : 'Boa noite'

  // Gamification
  const overdueTasks = tasks.filter(t => !t.completed && t.due_date && t.due_date < todayStr).length
  const xp = computeXP({
    completedTasks:   tasks.filter(t => t.completed).length,
    habitCompletions: completions.length,
    dailyLogs:        logs.length,
    weeklyReviews:    0,
    overdueTasks,
    missedHabitDays:  getMissedHabitsCount(),
  })
  const levelInfo = getLevelInfo(xp)

  // Load today's mood
  useEffect(() => {
    fetchLogs().then((data) => {
      const log = data.find((l: { date: string; mood?: number }) => l.date === todayStr)
      if (log?.mood) setMood(log.mood)
    })
  }, [todayStr])

  // Schedule notifications when tasks load
  useEffect(() => {
    if (dayTasks.length > 0) scheduleTodayNotifications(dayTasks)
  }, [dayTasks.length])

  const saveMood = async (value: number) => {
    setMood(value)
    await upsertLog({ date: todayStr, mood: value })
  }

  const handleAskNotifications = async () => {
    const granted = await requestNotificationPermission()
    setNotifAsked(true)
    if (granted) scheduleTodayNotifications(dayTasks)
  }

  const todayLog = logs.find(l => l.date === todayStr)
  const journalHasEntry = !!(todayLog?.notes || todayLog?.win_of_day || todayLog?.gratitude)

  const sortedTasks = [...dayTasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    if (a.due_time && b.due_time) return a.due_time.localeCompare(b.due_time)
    if (a.due_time) return -1
    if (b.due_time) return 1
    const p = { high: 0, medium: 1, low: 2 }
    return p[a.priority] - p[b.priority]
  })

  return (
    <div className="min-h-svh bg-[#f2f2f7] pb-nav overflow-x-hidden">

      {/* Header */}
      <div
        className="px-5 pb-6"
        style={{
          background: 'linear-gradient(135deg, #5b5bd6 0%, #7c3aed 100%)',
          paddingTop: 'calc(3.5rem + env(safe-area-inset-top, 0px))',
        }}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-indigo-200 text-sm capitalize font-medium">
              {format(today, "EEEE, d 'de' MMMM", { locale: pt })}
            </p>
            <h1 className="text-white text-[26px] font-bold mt-0.5 tracking-tight">
              {greeting}{userName ? `, ${userName}` : ''}! 👋
            </h1>
          </div>
          <div className="flex items-center gap-2 mt-1">
            {!notifAsked && typeof Notification !== 'undefined' && Notification.permission === 'default' && (
              <button
                onClick={handleAskNotifications}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.15)' }}
                title="Ativar notificações"
              >
                <Bell size={16} className="text-white" />
              </button>
            )}
            <button
              onClick={signOut}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            >
              <LogOut size={16} className="text-white" />
            </button>
          </div>
        </div>

        {/* XP / Level bar */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">{levelInfo.icon}</span>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-indigo-200">
                Nível {levelInfo.level} · {levelInfo.name}
              </span>
              <span className="text-xs text-indigo-300">
                {levelInfo.xp}{levelInfo.nextXp ? `/${levelInfo.nextXp} XP` : ' XP'}
              </span>
            </div>
            <div className="rounded-full h-1.5" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <div
                className="h-1.5 rounded-full bg-yellow-300 transition-all duration-1000"
                style={{ width: `${levelInfo.progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Progress card */}
        <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.15)' }}>
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-white font-semibold text-lg">{Math.round(progress)}%</p>
              <p className="text-indigo-200 text-xs">concluído hoje</p>
            </div>
            <p className="text-white/80 text-sm">{completed} / {dayTasks.length} tarefas</p>
          </div>
          <div className="rounded-full h-1.5" style={{ background: 'rgba(255,255,255,0.25)' }}>
            <div className="h-1.5 rounded-full bg-white transition-all duration-700" style={{ width: `${progress}%` }} />
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
                className={`flex-1 flex flex-col items-center py-3.5 gap-1 transition-all ${mood === value ? 'bg-indigo-50' : 'active:bg-gray-50'}`}
              >
                <span className={`text-2xl transition-transform ${mood === value ? 'scale-125' : ''}`}>{emoji}</span>
                <span className={`text-xs font-medium ${mood === value ? 'text-indigo-600' : 'text-gray-400'}`}>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tasks */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <p className="text-[17px] font-bold text-gray-900">Tarefas de hoje</p>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 bg-indigo-500 text-white text-sm font-semibold px-3.5 py-2 rounded-full active:scale-95 transition-transform"
            >
              <Plus size={15} strokeWidth={2.5} /> Adicionar
            </button>
          </div>

          {dayTasks.length === 0 ? (
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

        {/* Journal */}
        <button
          onClick={() => setShowJournal(true)}
          className="w-full bg-white rounded-2xl p-4 text-left active:scale-[0.98] transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                <BookOpen size={18} className="text-indigo-500" />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-gray-900">Diário de hoje</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {journalHasEntry ? '✓ Entrada escrita hoje' : 'Sem entrada ainda — toca para escrever'}
                </p>
              </div>
            </div>
            <span className="text-gray-300 text-lg">→</span>
          </div>
        </button>

      </div>

      {showAdd && (
        <AddTaskModal
          onClose={() => setShowAdd(false)}
          onAdd={addTask}
          projects={projects}
          defaultDate={todayStr}
        />
      )}

      {showJournal && (
        <JournalModal date={todayStr} onClose={() => setShowJournal(false)} />
      )}
    </div>
  )
}
