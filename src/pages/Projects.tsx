import { useState } from 'react'
import { X, Plus, FolderOpen } from 'lucide-react'
import { useProjects } from '../hooks/useProjects'
import { useTasks } from '../hooks/useTasks'
import type { Project } from '../types'
import { TaskItem } from '../components/TaskItem'
import { AddTaskModal } from '../components/AddTaskModal'

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#22c55e', '#14b8a6', '#3b82f6', '#ef4444']
const EMOJIS = ['📁', '🚀', '💼', '📚', '🎯', '💡', '🏋️', '🎨', '🌱', '💰', '❤️', '⚡']

function AddProjectModal({ onClose, onAdd }: { onClose: () => void; onAdd: (p: Omit<Project, 'id' | 'created_at' | 'user_id'>) => void }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [emoji, setEmoji] = useState(EMOJIS[0])

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end" onClick={onClose}>
      <div className="bg-white rounded-t-2xl w-full p-5 pb-8" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Novo Projeto</h2>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Emoji</p>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map(e => (
                <button key={e} onClick={() => setEmoji(e)}
                  className={`text-2xl p-1.5 rounded-lg transition-all ${emoji === e ? 'bg-indigo-100 scale-110' : 'hover:bg-gray-100'}`}>
                  {e}
                </button>
              ))}
            </div>
          </div>
          <input
            autoFocus
            type="text"
            placeholder="Nome do projeto"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm text-gray-800 placeholder-gray-400 border border-gray-100 focus:border-indigo-300 focus:bg-white transition-all"
          />
          <textarea
            placeholder="Descrição (opcional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm text-gray-800 placeholder-gray-400 border border-gray-100 focus:border-indigo-300 focus:bg-white transition-all resize-none"
          />
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Cor</p>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-all ${color === c ? 'scale-125 ring-2 ring-offset-2 ring-gray-400' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <button
            onClick={() => { if (name.trim()) { onAdd({ name, description, color, emoji }); onClose() } }}
            disabled={!name.trim()}
            className="w-full py-3.5 bg-indigo-500 text-white rounded-xl font-semibold text-sm disabled:opacity-40"
          >
            Criar Projeto
          </button>
        </div>
      </div>
    </div>
  )
}

export function Projects() {
  const { projects, addProject } = useProjects()
  const { tasks, toggleTask, deleteTask, addTask } = useTasks()
  const [showAdd, setShowAdd] = useState(false)
  const [selected, setSelected] = useState<Project | null>(null)
  const [showAddTask, setShowAddTask] = useState(false)

  const projectTasks = selected ? tasks.filter(t => t.project_id === selected.id) : []
  const noProjectTasks = tasks.filter(t => !t.project_id)

  if (selected) {
    const completed = projectTasks.filter(t => t.completed).length
    return (
      <div className="min-h-svh bg-gray-50 pb-safe">
        <div className="px-4 pt-14 pb-4" style={{ backgroundColor: selected.color }}>
          <button onClick={() => setSelected(null)} className="text-white/70 text-sm mb-3">← Projetos</button>
          <div className="text-4xl mb-1">{selected.emoji}</div>
          <h1 className="text-white text-xl font-bold">{selected.name}</h1>
          {selected.description && <p className="text-white/70 text-sm mt-1">{selected.description}</p>}
          <p className="text-white/60 text-xs mt-2">{completed}/{projectTasks.length} tarefas completas</p>
        </div>

        <div className="px-4 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">Tarefas</h2>
            <button onClick={() => setShowAddTask(true)} className="flex items-center gap-1 text-indigo-600 text-sm font-medium">
              <Plus size={16} /> Adicionar
            </button>
          </div>
          {projectTasks.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-3xl mb-2">📋</p>
              <p className="text-sm">Sem tarefas neste projeto</p>
            </div>
          ) : (
            <div className="space-y-2">
              {projectTasks.map(task => (
                <TaskItem key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
              ))}
            </div>
          )}
        </div>

        {showAddTask && (
          <AddTaskModal
            onClose={() => setShowAddTask(false)}
            onAdd={(t) => addTask({ ...t, project_id: selected.id })}
            projects={projects}
          />
        )}
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-gray-50 pb-safe">
      <div className="bg-white px-4 pt-14 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">Projetos</h1>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-medium">
            <Plus size={16} /> Novo
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-3">
        {projects.map(project => {
          const ptasks = tasks.filter(t => t.project_id === project.id)
          const pCompleted = ptasks.filter(t => t.completed).length
          return (
            <button
              key={project.id}
              onClick={() => setSelected(project)}
              className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-left flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: project.color + '20' }}>
                {project.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800">{project.name}</p>
                {project.description && <p className="text-xs text-gray-400 mt-0.5 truncate">{project.description}</p>}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full transition-all"
                      style={{
                        width: ptasks.length ? `${(pCompleted / ptasks.length) * 100}%` : '0%',
                        backgroundColor: project.color
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">{pCompleted}/{ptasks.length}</span>
                </div>
              </div>
            </button>
          )
        })}

        {/* Tasks without project */}
        {noProjectTasks.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <FolderOpen size={18} className="text-gray-400" />
              <p className="font-semibold text-gray-600 text-sm">Sem projeto ({noProjectTasks.length})</p>
            </div>
            <div className="space-y-2">
              {noProjectTasks.map(task => (
                <TaskItem key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
              ))}
            </div>
          </div>
        )}

        {projects.length === 0 && noProjectTasks.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-3">🚀</p>
            <p className="font-medium text-gray-600">Nenhum projeto ainda</p>
            <p className="text-sm mt-1">Cria o teu primeiro projeto</p>
          </div>
        )}
      </div>

      {showAdd && <AddProjectModal onClose={() => setShowAdd(false)} onAdd={addProject} />}
    </div>
  )
}
