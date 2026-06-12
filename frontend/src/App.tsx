import React from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Assessment from './pages/Assessment'
import Workouts from './pages/Workouts'
import Episodes from './pages/Episodes'
import Nutrition from './pages/Nutrition'
import Progress from './pages/Progress'
import Analytics from './pages/Analytics'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600" />
      </div>
    )
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/assessment"
        element={
          <PrivateRoute>
            <Layout>
              <Assessment />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/workouts"
        element={
          <PrivateRoute>
            <Layout>
              <Workouts />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/episodes"
        element={
          <PrivateRoute>
            <Layout>
              <Episodes />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/nutrition"
        element={
          <PrivateRoute>
            <Layout>
              <Nutrition />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/progress"
        element={
          <PrivateRoute>
            <Layout>
              <Progress />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <PrivateRoute>
            <Layout>
              <Analytics />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
