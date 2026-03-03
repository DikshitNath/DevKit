import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/Forgotpassword'
import Profile from './pages/Profile'
import HomePage from './pages/HomePage'
import ApiTester from './components/ApiTester'
import SnippetManager from './components/SnippetManager'
import ColorPalette from './pages/tools/ColorPalatte'
import RegexTester from './pages/tools/RegexTester'
import JwtDecoder from './pages/tools/JwtDecoder'
import JSONForge from './pages/tools/JSON'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ background: '#0d0d14', minHeight: '100vh' }} />
  return user ? children : <Navigate to="/login" />
}

function AppRoutes() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0f0f1a',
            color: '#e2e2f0',
            border: '1px solid #1e1e30',
            fontSize: '13px',
            fontFamily: "'IBM Plex Sans', sans-serif",
          },
          success: { iconTheme: { primary: '#4ade80', secondary: '#0f0f1a' } },
          error: { iconTheme: { primary: '#f87171', secondary: '#0f0f1a' } },
        }}
      />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/test-api" element={<ProtectedRoute><ApiTester /></ProtectedRoute>} />
        <Route path="/snippets" element={<ProtectedRoute><SnippetManager /></ProtectedRoute>} />
        <Route path="/color-palette" element={<ProtectedRoute><ColorPalette /></ProtectedRoute>} />
        <Route path="/regex" element={<ProtectedRoute><RegexTester /></ProtectedRoute>} />
        <Route path="/jwt" element={<ProtectedRoute><JwtDecoder /></ProtectedRoute>} />
        <Route path="/json" element={<ProtectedRoute><JSONForge /></ProtectedRoute>} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}