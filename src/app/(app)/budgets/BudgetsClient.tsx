'use client'

import { useState } from 'react'
import { Budget, Category } from '@/types/database'
import { BudgetCard } from '@/components/budgets/BudgetCard'
import { BudgetForm } from '@/components/budgets/BudgetForm'
import { EmptyState } from '@/components/shared/EmptyState'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface BudgetsClientProps {
  budgets: Budget[]
  categories: Category[]
  spendingMap: Record<string, number>
  userId: string
}

export function BudgetsClient({ budgets, categories, spendingMap, userId }: BudgetsClientProps) {
  const [open, setOpen] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function deleteBudget(id: string) {
    const { error } = await supabase.from('budgets').delete().eq('id', id)
    if (error) {
      toast.error('Error al eliminar')
    } else {
      toast.success('Presupuesto eliminado')
      router.refresh()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 px-4 py-2 text-xs gradient-primary text-white hover:glow-violet-strong active:scale-[0.98]">
            <Plus className="h-4 w-4" />
            Nuevo presupuesto
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo presupuesto</DialogTitle>
            </DialogHeader>
            <BudgetForm
              categories={categories}
              userId={userId}
              onSuccess={() => setOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {budgets.length === 0 ? (
        <EmptyState
          icon="🎯"
          title="Sin presupuestos"
          description="Crea presupuestos para controlar tus gastos por categoria."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {budgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              spent={spendingMap[budget.category_id] ?? 0}
              onDelete={deleteBudget}
            />
          ))}
        </div>
      )}
    </div>
  )
}
