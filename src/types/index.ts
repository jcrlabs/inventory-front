export type Role = 'admin' | 'manager' | 'viewer'

export interface User {
  id: string
  username: string
  email: string
  role: Role
  active: boolean
  last_login?: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  description: string
  created_at: string
  updated_at: string
}

export interface Contact {
  id: string
  product_id: string
  name: string
  email?: string
  phone?: string
  created_at: string
  updated_at: string
}

export interface UpsertContactInput {
  name: string
  email?: string
  phone?: string
}

export interface ProductImage {
  id: string
  product_id: string
  image_url?: string
  position: number
  created_at: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  sku: string
  image_url?: string
  images?: ProductImage[]
  category_id?: string
  category?: Category
  contact?: Contact
  created_by_id: string
  created_by?: User
  paid: boolean
  status: string
  created_at: string
  updated_at: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  page_size: number
}

export interface ListResponse<T> {
  data: T[]
  total: number
}

export interface LoginRequest {
  identifier: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

export type ProductStatus = 'reparado' | 'en_progreso' | 'no_reparado'

export interface ProductFilters {
  search?: string
  category_id?: string
  status?: ProductStatus
  paid?: boolean
  page?: number
  page_size?: number
}

export interface CreateProductInput {
  name: string
  description: string
  price: number
  category_id?: string
  paid?: boolean
  status?: ProductStatus
}

export interface UpdateProductInput extends Partial<CreateProductInput> {}

export interface CreateCategoryInput {
  name: string
  description: string
}

export interface CreateUserInput {
  username: string
  email: string
  password: string
  role: Role
}

export interface UpdateUserInput {
  username?: string
  email?: string
  password?: string
  role?: Role
  active?: boolean
}

export interface UpdateMeInput {
  username?: string
  email?: string
  current_password?: string
  new_password?: string
}
