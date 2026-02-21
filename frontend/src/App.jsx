import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import ApiTester from './components/ApiTester'
import SnippetManager from './components/SnippetManager'
import HomePage from './pages/HomePage'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ background: '#0d0d14', minHeight: '100vh' }} />
  return user ? children : <Navigate to="/login" />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<HomePage />} />
      <Route path="/api-tester" element={
        <ProtectedRoute>
          <ApiTester />
        </ProtectedRoute>
      } />
      <Route path="/snippets" element={
        <ProtectedRoute>
          <SnippetManager />
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}