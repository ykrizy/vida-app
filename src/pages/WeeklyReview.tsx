import { useState, useMemo } from 'react'
import { format, startOfWeek, endOfWeek, subWeeks, eachDayOfInterval } from 'date-fns'
import { pt } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, TrendingUp, Target, Star } from 'lucide-react'
import { useTasks } from '../hooks/useTasks'
import { useLogs } from '../hooks/useLogs'
import { useWeeklyReviews } from '../hooks/useWeeklyReviews'

const MOOD_LABELS: Record<number, string> = { 1: '😞', 2: '😕', 3: '😐', 4: '🙂', 5: '😄' }

export function WeeklyReview() {
  const [weekOffset, setWeekOffset] = useState(0)
  const { tasks } = useTasks()
  const { logs } = useLogs()
  const { saveReview } = useWeeklyReviews()
  const [highlights, setHighlights] = useState('')
  const [improvements, setImprovements] = useState('')
  const [saved, setSaved] = useState(false)

  const weekStart = startOfWeek(subWeeks(new Date(), -weekOffset), { weekStartsOn: 1 })
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })
  const isCurrentWeek = weekOffset === 0

  const stats = useMemo(() => {
    let tasksCompleted = 0
    let tasksTotal = 0
    let moodSum = 0
    let moodCount = 0
    const dayStats: { date: Date; completed: number; total: number; mood?: number }[] = []

    days.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd')
      const dayOfWeek = day.getDay()
      const dayTasks = tasks.filter(t => {
        if (t.is_recurring && t.recurrence_days?.includes(dayOfWeek)) return true
        if (t.due_date === dateStr) return true
        return false
      })
      const dayCompleted = dayTasks.filter(t => {
        if (!t.completed_at) return t.completed && t.due_date === dateStr
        return t.completed_at.startsWith(dateStr)
      }).length

      const log = logs.find(l => l.date === dateStr)
      const mood = log?.mood

      tasksCompleted += dayCompleted
      tasksTotal += dayTasks.length
      if (mood) { moodSum += mood; moodCount++ }
      dayStats.push({ date: day, completed: dayCompleted, total: dayTasks.length, mood })
    })

    return {
      tasksCompleted,
      tasksTotal,
      rate: tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : 0,
      moodAvg: moodCount > 0 ? Math.round(moodSum / moodCount) : undefined,
      dayStats,
    }
  }, [days, tasks, logs])

  const handleSave = async () => {
    await saveReview({
      week_start: format(weekStart, 'yyyy-MM-dd'),
      week_end: format(weekEnd, 'yyyy-MM-dd'),
      tasks_completed: stats.tasksCompleted,
      tasks_total: stats.tasksTotal,
      highlights: highlights || undefined,
      improvements: improvements || undefined,
      mood_avg: stats.moodAvg,
      generated_at: new Date().toISOString(),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const rateColor = stats.rate >= 80 ? 'text-green-600' : stats.rate >= 50 ? 'text-amber-500' : 'text-red-500'
  const rateBg = stats.rate >= 80 ? 'bg-green-500' : stats.rate >= 50 ? 'bg-amber-400' : 'bg-red-400'

  return (
    <div className="min-h-svh bg-[#f2f2f7] pb-nav overflow-x-hidden">
      <div className="bg-white px-4 pb-4 border-b border-gray-100"
        style={{ paddingTop: 'calc(3.5rem + env(safe-area-inset-top, 0px))' }}>
        <h1 className="text-xl font-bold text-gray-800">Avaliação Semanal</h1>
        <div className="flex items-center justify-between mt-3">
          <button onClick={() => setWeekOffset(o => o - 1)} className="p-2 rounded-full hover:bg-gray-100">
            <ChevronLeft size={18} className="text-gray-500" />
          </button>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-700">
              {isCurrentWeek ? 'Esta semana' : format(weekStart, "'Semana de' d MMM", { locale: pt })}
            </p>
            <p className="text-xs text-gray-400">
              {format(weekStart, 'd MMM', { locale: pt })} – {format(weekEnd, 'd MMM yyyy', { locale: pt })}
            </p>
          </div>
          <button
            onClick={() => setWeekOffset(o => Math.min(o + 1, 0))}
            disabled={isCurrentWeek}
            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30"
          >
            <ChevronRight size={18} className="text-gray-500" />
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
            <Target size={20} className="text-indigo-500 mx-auto mb-1" />
            <p className={`text-2xl font-bold ${rateColor}`}>{stats.rate}%</p>
            <p className="text-xs text-gray-400">Completo</p>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
            <TrendingUp size={20} className="text-green-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-800">{stats.tasksCompleted}</p>
            <p className="text-xs text-gray-400">Feitas</p>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
            <Star size={20} className="text-amber-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-800">
              {stats.moodAvg ? MOOD_LABELS[stats.moodAvg] : '—'}
            </p>
            <p className="text-xs text-gray-400">Humor</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>{stats.tasksCompleted} de {stats.tasksTotal} tarefas</span>
            <span className={`font-semibold ${rateColor}`}>{stats.rate}%</span>
          </div>
          <div className="bg-gray-100 rounded-full h-3">
            <div className={`h-3 rounded-full transition-all duration-700 ${rateBg}`}
              style={{ width: `${stats.rate}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-700 mb-3">Por dia</p>
          <div className="space-y-2">
            {stats.dayStats.map(({ date, completed, total, mood }) => (
              <div key={date.toISOString()} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-12 capitalize">
                  {format(date, 'EEE', { locale: pt })}
                </span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  {total > 0 && (
                    <div className="bg-indigo-400 h-2 rounded-full transition-all"
                      style={{ width: `${(completed / total) * 100}%` }} />
                  )}
                </div>
                <span className="text-xs text-gray-500 w-10 text-right">{completed}/{total}</span>
                <span className="text-sm w-5">{mood ? MOOD_LABELS[mood] : ''}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-700 mb-3">Reflexão</p>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-500">🌟 Destaques da semana</label>
              <textarea
                value={highlights}
                onChange={e => setHighlights(e.target.value)}
                placeholder="O que correu bem? Que conquistas tiveste?"
                rows={2}
                className="mt-1 w-full text-sm text-gray-700 placeholder-gray-400 resize-none border border-gray-100 rounded-xl px-3 py-2 focus:border-indigo-300 focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">🎯 O que melhorar</label>
              <textarea
                value={improvements}
                onChange={e => setImprovements(e.target.value)}
                placeholder="O que podes fazer diferente na próxima semana?"
                rows={2}
                className="mt-1 w-full text-sm text-gray-700 placeholder-gray-400 resize-none border border-gray-100 rounded-xl px-3 py-2 focus:border-indigo-300 focus:outline-none transition-all"
              />
            </div>
            <button
              onClick={handleSave}
              className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                saved ? 'bg-green-500 text-white' : 'bg-indigo-500 text-white hover:bg-indigo-600'
              }`}
            >
              {saved ? '✓ Avaliação guardada' : 'Guardar avaliação'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
