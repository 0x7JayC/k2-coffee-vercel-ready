import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "./ImageUpload";

interface ProductForm {
  name: string;
  description: string;
  price: string;
  weight: string;
  tastingNotes: string;
  imageUrl: string;
}

export default function AdminProducts() {
  const productsQuery = trpc.products.listAll.useQuery();
  const createMutation = trpc.products.create.useMutation();
  const updateMutation = trpc.products.update.useMutation();
  const deleteMutation = trpc.products.delete.useMutation();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>({
    name: "",
    description: "",
    price: "",
    weight: "",
    tastingNotes: "",
    imageUrl: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.price) {
      toast.error("Name and price are required");
      return;
    }

    try {
      const price = Math.round(parseFloat(form.price) * 100);

      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          name: form.name,
          description: form.description || undefined,
          price: price || undefined,
          weight: form.weight || undefined,
          tastingNotes: form.tastingNotes || undefined,
          imageUrl: form.imageUrl || undefined,
        });
        toast.success("Product updated");
      } else {
        await createMutation.mutateAsync({
          name: form.name,
          description: form.description || undefined,
          price,
          weight: form.weight || undefined,
          tastingNotes: form.tastingNotes || undefined,
          imageUrl: form.imageUrl || undefined,
        });
        toast.success("Product created");
      }

      setForm({
        name: "",
        description: "",
        price: "",
        weight: "",
        tastingNotes: "",
        imageUrl: "",
      });
      setEditingId(null);
      setShowForm(false);
      productsQuery.refetch();
    } catch (error) {
      toast.error("Failed to save product");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Product deleted");
      productsQuery.refetch();
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  const handleEdit = (product: any) => {
    setForm({
      name: product.name,
      description: product.description || "",
      price: (product.price / 100).toString(),
      weight: product.weight || "",
      tastingNotes: product.tastingNotes || "",
      imageUrl: product.imageUrl || "",
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-amber-900">Products</h2>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) {
              setEditingId(null);
              setForm({
                name: "",
                description: "",
                price: "",
                weight: "",
                tastingNotes: "",
                imageUrl: "",
              });
            }
          }}
          className="bg-amber-900 hover:bg-amber-800"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 bg-amber-50">
          <h3 className="text-xl font-bold text-amber-900 mb-4">
            {editingId ? "Edit Product" : "New Product"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-amber-900 mb-1">
                  Name *
                </label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Coffee name"
                  className="bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-900 mb-1">
                  Price (GBP) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="9.99"
                  className="bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-amber-900 mb-1">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Product description"
                rows={3}
                className="w-full px-3 py-2 border border-amber-200 rounded bg-white text-amber-900"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-amber-900 mb-1">
                  Weight
                </label>
                <Input
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                  placeholder="e.g., 12 oz"
                  className="bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-900 mb-1">
                  Tasting Notes
                </label>
                <Input
                  value={form.tastingNotes}
                  onChange={(e) => setForm({ ...form, tastingNotes: e.target.value })}
                  placeholder="e.g., Chocolate, Caramel"
                  className="bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-amber-900 mb-1">
                Product Image
              </label>
              <ImageUpload
                type="product"
                currentImageUrl={form.imageUrl}
                onUpload={(url) => setForm({ ...form, imageUrl: url })}
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-amber-900 hover:bg-amber-800"
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Product"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setForm({
                    name: "",
                    description: "",
                    price: "",
                    weight: "",
                    tastingNotes: "",
                    imageUrl: "",
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {productsQuery.isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-amber-900" />
        </div>
      ) : productsQuery.data && productsQuery.data.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {productsQuery.data.map((product) => (
            <Card key={product.id} className="overflow-hidden !py-0 gap-0">
              {product.imageUrl && (
                <div className="h-48 overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover block"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-bold text-amber-900 mb-1">{product.name}</h3>
                <p className="text-sm text-amber-700 mb-3">${(product.price / 100).toFixed(2)}</p>
                <p className="text-xs text-amber-600 mb-3 line-clamp-2">{product.description}</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(product)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(product.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-amber-700">No products yet. Create one to get started.</p>
        </div>
      )}
    </div>
  );
}
