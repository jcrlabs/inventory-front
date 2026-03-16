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

export interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  sku: string
  image_url?: string
  category_id?: string
  category?: Category
  created_by_id: string
  created_by?: User
  active: boolean
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

export interface ProductFilters {
  search?: string
  category_id?: string
  active?: boolean
  page?: number
  page_size?: number
}

export interface CreateProductInput {
  name: string
  description: string
  price: number
  stock: number
  sku?: string
  category_id?: string
  active?: boolean
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
