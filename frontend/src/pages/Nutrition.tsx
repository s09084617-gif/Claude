import { useState, useEffect, FormEvent } from 'react'
import { Utensils, Plus, Pencil, Trash2, X, Check, Loader2 } from 'lucide-react'
import { api, NutritionPlan, NutritionPlanRequest } from '../api/client'

const GOAL_OPTIONS = [
  { value: '', label: 'Select a goal (optional)' },
  { value: 'fat_loss', label: 'Fat Loss' },
  { value: 'muscle_gain', label: 'Muscle Gain' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'general_fitness', label: 'General Fitness' },
]

const emptyForm = (): NutritionPlanRequest => ({
  title: '',
  goal: '',
  calories: undefined,
  protein_g: undefined,
  carbs_g: undefined,
  fat_g: undefined,
  meals: '',
  notes: '',
})

interface PlanFormProps {
  initial?: Partial<NutritionPlanRequest>
  onSave: (data: NutritionPlanRequest) => Promise<void>
  onCancel: () => void
  saving: boolean
  submitLabel: string
}

function PlanForm({ initial, onSave, onCancel, saving, submitLabel }: PlanFormProps) {
  const [form, setForm] = useState<NutritionPlanRequest>({ ...emptyForm(), ...initial })

  const set = (field: keyof NutritionPlanRequest, value: string | number | undefined) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    await onSave({
      ...form,
      goal: form.goal || undefined,
      meals: form.meals || undefined,
      notes: form.notes || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            required
            placeholder="e.g. Cutting Phase Plan"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Goal</label>
          <select
            value={form.goal ?? ''}
            onChange={(e) => set('goal', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
          >
            {GOAL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Calories (kcal)</label>
          <input
            type="number"
            value={form.calories ?? ''}
            onChange={(e) => set('calories', e.target.value ? parseInt(e.target.value) : undefined)}
            min={0}
            placeholder="e.g. 2000"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Protein (g)</label>
          <input
            type="number"
            value={form.protein_g ?? ''}
            onChange={(e) =>
              set('protein_g', e.target.value ? parseFloat(e.target.value) : undefined)
            }
            min={0}
            step={0.1}
            placeholder="e.g. 150"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Carbs (g)</label>
          <input
            type="number"
            value={form.carbs_g ?? ''}
            onChange={(e) =>
              set('carbs_g', e.target.value ? parseFloat(e.target.value) : undefined)
            }
            min={0}
            step={0.1}
            placeholder="e.g. 250"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fat (g)</label>
          <input
            type="number"
            value={form.fat_g ?? ''}
            onChange={(e) =>
              set('fat_g', e.target.value ? parseFloat(e.target.value) : undefined)
            }
            min={0}
            step={0.1}
            placeholder="e.g. 70"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Meals</label>
          <input
            type="text"
            value={form.meals ?? ''}
            onChange={(e) => set('meals', e.target.value)}
            placeholder="e.g. Breakfast, Lunch, Dinner, Snack"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            value={form.notes ?? ''}
            onChange={(e) => set('notes', e.target.value)}
            rows={3}
            placeholder="Additional notes..."
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition-colors"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg text-sm transition-colors"
        >
          <X size={14} />
          Cancel
        </button>
      </div>
    </form>
  )
}

export default function Nutrition() {
  const [plans, setPlans] = useState<NutritionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchPlans = async () => {
    try {
      const res = await api.getNutritionPlans()
      setPlans(res.data)
    } catch {
      setError('Failed to load nutrition plans.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  const handleAdd = async (data: NutritionPlanRequest) => {
    setSaving(true)
    try {
      await api.createNutritionPlan(data)
      await fetchPlans()
      setShowAddForm(false)
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } }
      setError(axiosError.response?.data?.detail ?? 'Failed to create plan.')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (id: number, data: NutritionPlanRequest) => {
    setSaving(true)
    try {
      await api.updateNutritionPlan(id, data)
      await fetchPlans()
      setEditingId(null)
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } }
      setError(axiosError.response?.data?.detail ?? 'Failed to update plan.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    setDeleting(true)
    try {
      await api.deleteNutritionPlan(id)
      setPlans((prev) => prev.filter((p) => p.id !== id))
      setDeleteConfirmId(null)
    } catch {
      setError('Failed to delete plan.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nutrition Plans</h1>
          <p className="text-gray-500 mt-1">Manage your personalized nutrition plans.</p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => {
              setShowAddForm(true)
              setEditingId(null)
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg text-sm transition-colors"
          >
            <Plus size={16} />
            Add Plan
          </button>
        )}
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm border border-brand-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
              <Plus size={16} className="text-brand-600" />
            </div>
            <h2 className="font-semibold text-gray-900">New Nutrition Plan</h2>
          </div>
          <PlanForm
            onSave={handleAdd}
            onCancel={() => setShowAddForm(false)}
            saving={saving}
            submitLabel="Create Plan"
          />
        </div>
      )}

      {/* Plans list */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={28} className="animate-spin text-gray-400" />
          </div>
        ) : plans.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center text-gray-400">
            <Utensils size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-base font-medium">No nutrition plans yet</p>
            <p className="text-sm mt-1">Click "Add Plan" to create your first plan.</p>
          </div>
        ) : (
          plans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {editingId === plan.id ? (
                <>
                  <h3 className="font-semibold text-gray-900 mb-4">Edit: {plan.title}</h3>
                  <PlanForm
                    initial={{
                      title: plan.title,
                      goal: plan.goal,
                      calories: plan.calories,
                      protein_g: plan.protein_g,
                      carbs_g: plan.carbs_g,
                      fat_g: plan.fat_g,
                      meals: plan.meals,
                      notes: plan.notes,
                    }}
                    onSave={(data) => handleUpdate(plan.id, data)}
                    onCancel={() => setEditingId(null)}
                    saving={saving}
                    submitLabel="Save Changes"
                  />
                </>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{plan.title}</h3>
                      {plan.goal && (
                        <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-medium">
                          {plan.goal}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingId(plan.id)
                          setShowAddForm(false)
                        }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      {deleteConfirmId === plan.id ? (
                        <div className="flex items-center gap-1.5 ml-1">
                          <span className="text-xs text-gray-500">Confirm?</span>
                          <button
                            onClick={() => handleDelete(plan.id)}
                            disabled={deleting}
                            className="px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-medium disabled:opacity-50"
                          >
                            {deleting ? '...' : 'Yes'}
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-50 text-gray-600 text-xs font-medium"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(plan.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Macros */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                    {plan.calories !== undefined && (
                      <div className="p-3 rounded-lg bg-gray-50 border border-gray-100 text-center">
                        <p className="text-xs text-gray-500">Calories</p>
                        <p className="font-bold text-gray-900">{plan.calories}</p>
                        <p className="text-xs text-gray-400">kcal</p>
                      </div>
                    )}
                    {plan.protein_g !== undefined && (
                      <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-center">
                        <p className="text-xs text-red-500">Protein</p>
                        <p className="font-bold text-gray-900">{plan.protein_g}g</p>
                      </div>
                    )}
                    {plan.carbs_g !== undefined && (
                      <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-100 text-center">
                        <p className="text-xs text-yellow-600">Carbs</p>
                        <p className="font-bold text-gray-900">{plan.carbs_g}g</p>
                      </div>
                    )}
                    {plan.fat_g !== undefined && (
                      <div className="p-3 rounded-lg bg-green-50 border border-green-100 text-center">
                        <p className="text-xs text-green-600">Fat</p>
                        <p className="font-bold text-gray-900">{plan.fat_g}g</p>
                      </div>
                    )}
                  </div>

                  {plan.meals && (
                    <p className="mt-3 text-sm text-gray-600">
                      <span className="font-medium">Meals:</span> {plan.meals}
                    </p>
                  )}
                  {plan.notes && (
                    <p className="mt-2 text-sm text-gray-500 italic">{plan.notes}</p>
                  )}
                  {plan.created_at && (
                    <p className="mt-3 text-xs text-gray-400">
                      Created {new Date(plan.created_at).toLocaleDateString()}
                    </p>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
