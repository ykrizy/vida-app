import { Trash2, Clock } from 'lucide-react'
import type { Task } from '../types'

const priorityDot: Record<Task['priority'], string> = {
  high: 'bg-red-400',
  medium: 'bg-amber-400',
  low: 'bg-gray-300',
}

interface Props {
  task: Task
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export function TaskItem({ task, onToggle, onDelete }: Props) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3.5 bg-white rounded-2xl transition-all ${
      task.completed ? 'opacity-50' : ''
    }`}>
      <button
        onClick={() => onToggle(task.id)}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
          task.completed
            ? 'bg-indigo-500 border-indigo-500'
            : 'border-gray-300 active:scale-90'
        }`}
      >
        {task.completed && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-[15px] font-medium leading-snug ${
          task.completed ? 'line-through text-gray-400' : 'text-gray-900'
        }`}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {task.due_time && (
            <span className={`flex items-center gap-1 text-xs font-semibold ${
              task.completed ? 'text-gray-400' : 'text-indigo-500'
            }`}>
              <Clock size={11} />
              {task.due_time.slice(0, 5)}
            </span>
          )}
          {task.description && (
            <p className="text-xs text-gray-400 line-clamp-1">{task.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`w-2 h-2 rounded-full ${priorityDot[task.priority]}`} />
        <button
          onClick={() => onDelete(task.id)}
          className="text-gray-300 active:text-red-400 transition-colors p-1 -mr-1"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  )
}
