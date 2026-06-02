import { useState, useEffect } from 'react'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, endOfWeek, isSameMonth, isToday, isSameDay, addMonths, subMonths
} from 'date-fns'
import { pt } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useTasks } from '../hooks/useTasks'
import { useProjects } from '../hooks/useProjects'
import { useLogs } from '../hooks/useLogs'
import { TaskItem } from '../components/TaskItem'
import { AddTaskModal } from '../components/AddTaskModal'

const MOODS = [
  { emoji: '😞', label: 'Mau',  value: 1 },
  { emoji: '😐', label: 'Ok',   value: 3 },
  { emoji: '😄', label: 'Bom',  value: 5 },
]

export function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showAdd, setShowAdd] = useState(false)
  const [note, setNote] = useState('')
  const [mood, setMood] = useState<number | undefined>()
  const [noteSaved, setNoteSaved] = useState(false)

  const { getTasksForDate, toggleTask, deleteTask, addTask } = useTasks()
  const { projects } = useProjects()
  const { fetchLogs, logs, upsertLog } = useLogs()

  // Load all logs once
  useEffect(() => { fetchLogs() }, [fetchLogs])

  // When selected date changes, populate mood + note from saved log
  useEffect(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    const log = logs.find(l => l.date === dateStr)
    setNote(log?.notes || '')
    setMood(log?.mood)
    setNoteSaved(false)
  }, [selectedDate, logs])

  const saveMood = async (value: number) => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    setMood(value)
    await upsertLog({ date: dateStr, mood: value, notes: note })
  }

  const saveNote = async () => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    await upsertLog({ date: dateStr, mood, notes: note })
    setNoteSaved(true)
    setTimeout(() => setNoteSaved(false), 2000)
  }

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })
  const selectedTasks = getTasksForDate(selectedDate)

  return (
    <div className="min-h-svh bg-[#f2f2f7] pb-nav overflow-x-hidden">
      {/* Header + calendar */}
      <div
        className="bg-white px-4 pb-4 border-b border-gray-100"
        style={{ paddingTop: 'calc(3.5rem + env(safe-area-inset-top, 0px))' }}
      >
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 rounded-full active:bg-gray-100"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <h1 className="text-base font-semibold text-gray-800 capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: pt })}
          </h1>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 rounded-full active:bg-gray-100"
          >
            <ChevronRight size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-1">
          {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(d => (
            <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-y-1">
          {days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const dayTasks = getTasksForDate(day)
            const completed = dayTasks.filter(t => t.completed).length
            const hasTasks = dayTasks.length > 0
            const hasLog = logs.some(l => l.date === dateStr && (l.mood || l.notes))
            const isSelected = isSameDay(day, selectedDate)
            const isCurrentMonth = isSameMonth(day, currentMonth)

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={`flex flex-col items-center py-1.5 rounded-xl mx-0.5 transition-all ${
                  isSelected ? 'bg-indigo-500' :
                  isToday(day) ? 'bg-indigo-50' : ''
                }`}
              >
                <span className={`text-sm font-medium ${
                  isSelected ? 'text-white' :
                  isToday(day) ? 'text-indigo-600' :
                  isCurrentMonth ? 'text-gray-800' : 'text-gray-300'
                }`}>
                  {format(day, 'd')}
                </span>
                {/* Dots: tasks + log */}
                {(hasTasks || hasLog) && (
                  <div className="flex gap-0.5 mt-0.5">
                    {completed > 0 && (
                      <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-green-400'}`} />
                    )}
                    {dayTasks.length - completed > 0 && (
                      <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-indigo-200' : 'bg-indigo-300'}`} />
                    )}
                    {hasLog && (
                      <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-yellow-300' : 'bg-amber-400'}`} />
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="px-4 pt-4 space-y-3">
        {/* Date header */}
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-bold text-gray-900 capitalize">
            {format(selectedDate, "EEEE, d 'de' MMMM", { locale: pt })}
          </h2>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 bg-indigo-500 text-white text-sm font-semibold px-3.5 py-2 rounded-full active:scale-95 transition-transform"
          >
            <Plus size={15} /> Adicionar
          </button>
        </div>

        {/* Tasks */}
        {selectedTasks.length === 0 ? (
          <div className="bg-white rounded-2xl py-10 text-center">
            <p className="text-3xl mb-2">📅</p>
            <p className="text-sm text-gray-400 font-medium">Nenhuma tarefa neste dia</p>
          </div>
        ) : (
          <div className="space-y-2">
            {selectedTasks.map(task => (
              <TaskItem key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
            ))}
          </div>
        )}

        {/* ── Mood + Note for selected day ── */}
        <div className="bg-white rounded-2xl overflow-hidden">
          <div className="px-4 pt-4 pb-1">
            <p className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide">
              Como foi este dia?
            </p>
          </div>
          {/* Mood picker */}
          <div className="flex divide-x divide-gray-100">
            {MOODS.map(({ emoji, label, value }) => (
              <button
                key={value}
                onClick={() => saveMood(value)}
                className={`flex-1 flex flex-col items-center py-3.5 gap-1 transition-all ${
                  mood === value ? 'bg-indigo-50' : 'active:bg-gray-50'
                }`}
              >
                <span className={`text-2xl transition-transform ${mood === value ? 'scale-125' : ''}`}>
                  {emoji}
                </span>
                <span className={`text-xs font-medium ${mood === value ? 'text-indigo-600' : 'text-gray-400'}`}>
                  {label}
                </span>
              </button>
            ))}
          </div>
          {/* Note textarea */}
          <div className="px-4 pt-2 pb-1">
            <p className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Nota
            </p>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Como foi? O que fizeste? O que sentiste?"
              rows={3}
              className="w-full text-[15px] text-gray-800 placeholder-gray-300 resize-none bg-transparent"
            />
          </div>
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
          defaultDate={format(selectedDate, 'yyyy-MM-dd')}
        />
      )}
    </div>
  )
}
