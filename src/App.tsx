import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { lazy, Suspense, useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import type { User } from './types'
import Layout from './components/layout/Layout'
import ErrorBoundary from './components/common/ErrorBoundary'
import { usePermissions } from './hooks/usePermissions'

const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const ProductsPage = lazy(() => import('./pages/ProductsPage'))
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'))
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'))
const UsersPage = lazy(() => import('./pages/UsersPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
})

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin } = usePermissions()
  if (!isAdmin) return <Navigate to="/products" replace />
  return <>{children}</>
}

function AppRoutes() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const demoToken = params.get('demo_token')
    if (!demoToken) return
    try {
      const parts = demoToken.split('.')
      if (parts.length !== 3) return
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
      const expiresAt = new Date(payload.exp * 1000).toISOString()
      const user: User = {
        id: payload.user_id ?? payload.sub,
        username: payload.username ?? 'demo',
        email: 'demo@jcrlabs.net',
        role: (payload.role ?? 'viewer') as User['role'],
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setAuth(user, demoToken, 'demo-readonly', expiresAt)
      window.history.replaceState({}, '', window.location.pathname)
      navigate('/products', { replace: true })
    } catch {
      // malformed token — ignore
    }
  }, [])

  return (
    <Suspense fallback={null}>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />}
        />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/products" replace />} />
          <Route path="/dashboard" element={<ErrorBoundary><DashboardPage /></ErrorBoundary>} />
          <Route path="/products" element={<ErrorBoundary><ProductsPage /></ErrorBoundary>} />
          <Route path="/products/:id" element={<ErrorBoundary><ProductDetailPage /></ErrorBoundary>} />
          <Route path="/categories" element={<ErrorBoundary><CategoriesPage /></ErrorBoundary>} />
          <Route
            path="/users"
            element={
              <AdminRoute>
                <ErrorBoundary><UsersPage /></ErrorBoundary>
              </AdminRoute>
            }
          />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              fontSize: '14px',
              background: '#27272a',
              color: '#e4e4e7',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 8px 32px -8px rgba(0,0,0,0.6)',
            },
            success: { iconTheme: { primary: '#f59e0b', secondary: '#1a1a1a' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#1a1a1a' } },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
