import { prisma } from "@/lib/prisma";
import { Card, CardHeader, EmptyState } from "@/components/ui/Card";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { deleteCategory } from "@/lib/actions/categories";
import { CategoryForm } from "./CategoryForm";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { categoryName: "asc" },
    include: { _count: { select: { parts: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Categories</h1>
        <p className="text-sm text-slate-500">Organize your parts inventory by category</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Add Category</h2>
          <CategoryForm />
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title={`${categories.length} Categories`} />
          {categories.length === 0 ? (
            <EmptyState message="No categories yet." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {categories.map((c) => (
                <li key={c.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{c.categoryName}</p>
                    <p className="text-xs text-slate-400">{c._count.parts} part(s)</p>
                  </div>
                  <DeleteButton action={deleteCategory.bind(null, c.id)} confirmText={`Delete category "${c.categoryName}"?`} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
