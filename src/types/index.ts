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
  subdato: string
  email?: string
  phone?: string
  created_at: string
  updated_at: string
}

export interface UpsertContactInput {
  name: string
  subdato: string
  email?: string
  phone?: string
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
  contact?: Contact
  created_by_id: string
  created_by?: User
  paid: boolean
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
  category_id?: string
  paid?: boolean
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

export interface UpdateMeInput {
  username?: string
  email?: string
  current_password?: string
  new_password?: string
}
