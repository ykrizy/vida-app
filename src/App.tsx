import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { BottomNav } from './components/BottomNav'
import { Today } from './pages/Today'
import { Calendar } from './pages/Calendar'
import { Projects } from './pages/Projects'
import { Focus } from './pages/Focus'
import { WeeklyReview } from './pages/WeeklyReview'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import './index.css'

function AppRoutes() {
  const { user, loading } = useAuth()
  const [showRegister, setShowRegister] = useState(false)

  if (loading) {
    return (
      <div className="min-h-svh bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">✨</div>
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  if (!user) {
    return showRegister
      ? <Register onSwitch={() => setShowRegister(false)} />
      : <Login onSwitch={() => setShowRegister(true)} />
  }

  return (
    <BrowserRouter>
      <div className="max-w-md mx-auto min-h-svh relative bg-gray-50">
        <Routes>
          <Route path="/" element={<Today />} />
          <Route path="/calendario" element={<Calendar />} />
          <Route path="/projetos" element={<Projects />} />
          <Route path="/foco" element={<Focus />} />
          <Route path="/semana" element={<WeeklyReview />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
