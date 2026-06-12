import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: '/api',
})

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('iblitz_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('iblitz_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export interface RegisterData {
  username: string
  email: string
  password: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user_id: number
  username: string
}

export interface User {
  id: number
  username: string
  email: string
  is_active: boolean
  created_at: string
}

export interface EpisodeRequest {
  pbf: number
  smm: string
  goal: string
  restriction?: string
  user_id?: number
  username?: string
}

export interface EpisodeResponse {
  classification: string
  recommendation: string
  program: string
  episode_id: number
  assessment_id: number
}

export interface Episode {
  id: number
  episode_name?: string
  sequence?: number
  program?: string
  outcomes?: string
  started_at?: string
  completed_at?: string
  user_id?: number
  username?: string
}

export interface WorkoutRequest {
  program: string
  goal: string
  restriction?: string
  user_id?: number
  username?: string
  episode_id?: number
}

export interface Workout {
  id: number
  program?: string
  goal?: string
  details?: string
  created_at?: string
  user_id?: number
}

export interface NutritionPlan {
  id: number
  title: string
  goal?: string
  calories?: number
  protein_g?: number
  carbs_g?: number
  fat_g?: number
  meals?: string
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface NutritionPlanRequest {
  title: string
  goal?: string
  calories?: number
  protein_g?: number
  carbs_g?: number
  fat_g?: number
  meals?: string
  notes?: string
}

export interface ProgressLog {
  id: number
  weight_kg?: number
  pbf?: number
  smm_kg?: number
  notes?: string
  metrics?: Record<string, unknown>
  logged_at?: string
  created_at?: string
}

export interface ProgressLogRequest {
  weight_kg?: number
  pbf?: number
  smm_kg?: number
  notes?: string
  metrics?: Record<string, unknown>
}

export interface Analytics {
  total_episodes: number
  avg_score: number
  classification_counts: Record<string, number>
  recommendation_counts: Record<string, number>
  program_counts: Record<string, number>
}

export const api = {
  // Auth
  register: (data: RegisterData) => axiosInstance.post<AuthResponse>('/auth/register', data),
  login: (username: string, password: string) => {
    const form = new URLSearchParams()
    form.append('username', username)
    form.append('password', password)
    return axiosInstance.post<AuthResponse>('/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
  },
  me: () => axiosInstance.get<User>('/auth/me'),

  // Engine
  generateEpisode: (data: EpisodeRequest) =>
    axiosInstance.post<EpisodeResponse>('/engine/generate-episode', data),
  getEpisodes: (userId?: number) =>
    axiosInstance.get<Episode[]>('/engine/episodes', {
      params: userId ? { user_id: userId } : {},
    }),
  generateWorkout: (data: WorkoutRequest) =>
    axiosInstance.post<Workout>('/engine/generate-workout', data),
  getWorkouts: (userId?: number) =>
    axiosInstance.get<Workout[]>('/engine/workouts', {
      params: userId ? { user_id: userId } : {},
    }),

  // Nutrition
  createNutritionPlan: (data: NutritionPlanRequest) =>
    axiosInstance.post<NutritionPlan>('/nutrition/plans', data),
  getNutritionPlans: () => axiosInstance.get<NutritionPlan[]>('/nutrition/plans'),
  updateNutritionPlan: (id: number, data: Partial<NutritionPlanRequest>) =>
    axiosInstance.put<NutritionPlan>(`/nutrition/plans/${id}`, data),
  deleteNutritionPlan: (id: number) => axiosInstance.delete(`/nutrition/plans/${id}`),

  // Progress
  createProgressLog: (data: ProgressLogRequest) =>
    axiosInstance.post<ProgressLog>('/progress/logs', data),
  getProgressLogs: () => axiosInstance.get<ProgressLog[]>('/progress/logs'),
  deleteProgressLog: (id: number) => axiosInstance.delete(`/progress/logs/${id}`),

  // Analytics
  getAnalytics: () => axiosInstance.get<Analytics>('/analytics/effectiveness'),
}
