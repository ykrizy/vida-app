import { useState } from 'react'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, endOfWeek, isSameMonth, isToday, isSameDay, addMonths, subMonths
} from 'date-fns'
import { pt } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useTasks } from '../hooks/useTasks'
import { useProjects } from '../hooks/useProjects'
import { TaskItem } from '../components/TaskItem'
import { AddTaskModal } from '../components/AddTaskModal'

export function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showAdd, setShowAdd] = useState(false)
  const { getTasksForDate, toggleTask, deleteTask, addTask } = useTasks()
  const { projects } = useProjects()

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })
  const selectedTasks = getTasksForDate(selectedDate)

  return (
    <div className="min-h-svh bg-[#f2f2f7] pb-nav overflow-x-hidden">
      <div className="bg-white px-4 pb-4 border-b border-gray-100" style={{ paddingTop: 'calc(3.5rem + env(safe-area-inset-top, 0px))' }}>
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 rounded-full hover:bg-gray-100">
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <h1 className="text-base font-semibold text-gray-800 capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: pt })}
          </h1>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 rounded-full hover:bg-gray-100">
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
            const dayTasks = getTasksForDate(day)
            const completed = dayTasks.filter(t => t.completed).length
            const hasTasks = dayTasks.length > 0
            const isSelected = isSameDay(day, selectedDate)
            const isCurrentMonth = isSameMonth(day, currentMonth)

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={`flex flex-col items-center py-1.5 rounded-xl mx-0.5 transition-all relative ${
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
                {hasTasks && (
                  <div className="flex gap-0.5 mt-0.5">
                    {completed > 0 && (
                      <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-green-400'}`} />
                    )}
                    {dayTasks.length - completed > 0 && (
                      <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-indigo-200' : 'bg-indigo-300'}`} />
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected day tasks */}
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700 capitalize">
            {format(selectedDate, "EEEE, d 'de' MMMM", { locale: pt })}
          </h2>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1 text-indigo-600 text-sm font-medium"
          >
            <Plus size={16} /> Adicionar
          </button>
        </div>

        {selectedTasks.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p className="text-3xl mb-2">📅</p>
            <p className="text-sm">Nenhuma tarefa neste dia</p>
          </div>
        ) : (
          <div className="space-y-2">
            {selectedTasks.map(task => (
              <TaskItem key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
            ))}
          </div>
        )}
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
