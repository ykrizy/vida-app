import { useState } from 'react'
import { X, Plus, FolderOpen, Trash2 } from 'lucide-react'
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
    <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div
        className="w-full max-h-[92svh] overflow-y-auto rounded-t-3xl bg-white"
        style={{ paddingBottom: 'calc(5.5rem + env(safe-area-inset-bottom, 0px))', maxWidth: '448px', marginLeft: 'auto', marginRight: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>
        <div className="px-5 pb-2 pt-1 flex items-center justify-between">
          <h2 className="text-[18px] font-bold text-gray-900">Novo Projeto</h2>
          <button onClick={onClose} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
            <X size={16} className="text-gray-500" />
          </button>
        </div>
        <div className="px-5 space-y-4 pt-2">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2.5">Emoji</p>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map(e => (
                <button key={e} onClick={() => setEmoji(e)}
                  className={`text-2xl p-2 rounded-xl transition-all ${emoji === e ? 'bg-indigo-100 scale-110' : 'bg-gray-50'}`}>
                  {e}
                </button>
              ))}
            </div>
          </div>
          <input
            autoFocus type="text" placeholder="Nome do projeto"
            value={name} onChange={e => setName(e.target.value)}
            className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl text-[15px] text-gray-900 placeholder-gray-400"
          />
          <textarea
            placeholder="Descrição (opcional)" value={description}
            onChange={e => setDescription(e.target.value)} rows={2}
            className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl text-[15px] text-gray-900 placeholder-gray-400 resize-none"
          />
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2.5">Cor</p>
            <div className="flex gap-3">
              {COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)}
                  className={`w-9 h-9 rounded-full transition-all ${color === c ? 'scale-125 ring-2 ring-offset-2 ring-gray-400' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <button
            onClick={() => { if (name.trim()) { onAdd({ name, description, color, emoji }); onClose() } }}
            disabled={!name.trim()}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-semibold text-[15px] disabled:opacity-40 active:scale-[0.98] transition-all"
          >
            Criar Projeto
          </button>
        </div>
      </div>
    </div>
  )
}

export function Projects() {
  const { projects, addProject, deleteProject } = useProjects()
  const { tasks, toggleTask, deleteTask, addTask } = useTasks()
  const [showAdd, setShowAdd] = useState(false)
  const [selected, setSelected] = useState<Project | null>(null)
  const [showAddTask, setShowAddTask] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const projectTasks = selected ? tasks.filter(t => t.project_id === selected.id) : []
  const noProjectTasks = tasks.filter(t => !t.project_id)

  if (selected) {
    const completed = projectTasks.filter(t => t.completed).length
    return (
      <div className="min-h-svh bg-[#f2f2f7] pb-nav overflow-x-hidden">
        {/* Header colorido */}
        <div className="px-4 pb-5" style={{
          backgroundColor: selected.color,
          paddingTop: 'calc(3.5rem + env(safe-area-inset-top, 0px))',
        }}>
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => { setSelected(null); setConfirmDelete(false) }}
              className="flex items-center gap-1.5 text-white/80 text-sm font-medium">
              ← Projetos
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.2)' }}
            >
              <Trash2 size={16} className="text-white" />
            </button>
          </div>
          <div className="text-4xl mb-2">{selected.emoji}</div>
          <h1 className="text-white text-[22px] font-bold">{selected.name}</h1>
          {selected.description && <p className="text-white/70 text-sm mt-1">{selected.description}</p>}
          <p className="text-white/60 text-xs mt-2">{completed}/{projectTasks.length} tarefas completas</p>
        </div>

        <div className="px-4 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[17px] font-bold text-gray-900">Tarefas</h2>
            <button onClick={() => setShowAddTask(true)}
              className="flex items-center gap-1.5 bg-indigo-500 text-white text-sm font-semibold px-3.5 py-2 rounded-full">
              <Plus size={15} /> Adicionar
            </button>
          </div>
          {projectTasks.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">📋</p>
              <p className="text-sm font-medium">Sem tarefas neste projeto</p>
            </div>
          ) : (
            <div className="space-y-2">
              {projectTasks.map(task => (
                <TaskItem key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
              ))}
            </div>
          )}
        </div>

        {/* Modal confirmar eliminação */}
        {confirmDelete && (
          <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className="w-full bg-white rounded-t-3xl p-6"
              style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}>
              <p className="text-[18px] font-bold text-gray-900 mb-1">Eliminar projeto?</p>
              <p className="text-gray-500 text-sm mb-6">
                O projeto <strong>{selected.name}</strong> será eliminado. As tarefas ficam sem projeto.
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => { deleteProject(selected.id); setSelected(null); setConfirmDelete(false) }}
                  className="w-full py-4 bg-red-500 text-white rounded-2xl font-semibold text-[15px]"
                >
                  Sim, eliminar
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="w-full py-4 bg-gray-100 text-gray-700 rounded-2xl font-semibold text-[15px]"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

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
    <div className="min-h-svh bg-[#f2f2f7] pb-nav overflow-x-hidden">
      <div className="bg-white px-4 pb-4 border-b border-gray-100" style={{ paddingTop: 'calc(3.5rem + env(safe-area-inset-top, 0px))' }}>
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
