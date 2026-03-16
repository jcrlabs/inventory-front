import { useAuthStore } from '../store/authStore'
import type { Product } from '../types'

export function usePermissions() {
  const user = useAuthStore((s) => s.user)
  const role = user?.role

  return {
    canView: !!role,
    canManage: role === 'admin' || role === 'manager',
    canDelete: role === 'admin',
    canDeleteProduct: (product: Product) =>
      role === 'admin' || (role === 'manager' && product.created_by_id === user?.id),
    isAdmin: role === 'admin',
    role,
    user,
  }
}
