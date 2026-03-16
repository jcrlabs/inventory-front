import { useAuthStore } from '../store/authStore'

export function usePermissions() {
  const user = useAuthStore((s) => s.user)
  const role = user?.role

  return {
    canView: !!role,
    canManage: role === 'admin' || role === 'manager',
    canDelete: role === 'admin',
    isAdmin: role === 'admin',
    role,
  }
}
