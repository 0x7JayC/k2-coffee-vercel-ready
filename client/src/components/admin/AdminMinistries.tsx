import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";

interface MinistryForm {
  name: string;
  description: string;
  websiteUrl: string;
  imageUrl: string;
}

export default function AdminMinistries() {
  const ministriesQuery = trpc.ministries.listAll.useQuery();
  const createMutation = trpc.ministries.create.useMutation();
  const updateMutation = trpc.ministries.update.useMutation();
  const deleteMutation = trpc.ministries.delete.useMutation();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<MinistryForm>({
    name: "",
    description: "",
    websiteUrl: "",
    imageUrl: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name) {
      toast.error("Name is required");
      return;
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          name: form.name,
          description: form.description || undefined,
          websiteUrl: form.websiteUrl || undefined,
          imageUrl: form.imageUrl || undefined,
        });
        toast.success("Ministry updated");
      } else {
        await createMutation.mutateAsync({
          name: form.name,
          description: form.description || undefined,
          websiteUrl: form.websiteUrl || undefined,
          imageUrl: form.imageUrl || undefined,
        });
        toast.success("Ministry created");
      }

      setForm({
        name: "",
        description: "",
        websiteUrl: "",
        imageUrl: "",
      });
      setEditingId(null);
      setShowForm(false);
      ministriesQuery.refetch();
    } catch (error) {
      toast.error("Failed to save ministry");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this ministry?")) return;

    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Ministry deleted");
      ministriesQuery.refetch();
    } catch (error) {
      toast.error("Failed to delete ministry");
    }
  };

  const handleEdit = (ministry: any) => {
    setForm({
      name: ministry.name,
      description: ministry.description || "",
      websiteUrl: ministry.websiteUrl || "",
      imageUrl: ministry.imageUrl || "",
    });
    setEditingId(ministry.id);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-amber-900">Ministries</h2>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) {
              setEditingId(null);
              setForm({
                name: "",
                description: "",
                websiteUrl: "",
                imageUrl: "",
              });
            }
          }}
          className="bg-amber-900 hover:bg-amber-800"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Ministry
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 bg-amber-50">
          <h3 className="text-xl font-bold text-amber-900 mb-4">
            {editingId ? "Edit Ministry" : "New Ministry"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-1">
                Name *
              </label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ministry name"
                className="bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-amber-900 mb-1">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Ministry description"
                rows={3}
                className="w-full px-3 py-2 border border-amber-200 rounded bg-white text-amber-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-amber-900 mb-1">
                Website URL
              </label>
              <Input
                type="url"
                value={form.websiteUrl}
                onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
                placeholder="https://..."
                className="bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-amber-900 mb-1">
                Image URL
              </label>
              <Input
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://..."
                className="bg-white"
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
                  "Save Ministry"
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
                    websiteUrl: "",
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

      {ministriesQuery.isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-amber-900" />
        </div>
      ) : ministriesQuery.data && ministriesQuery.data.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ministriesQuery.data.map((ministry) => (
            <Card key={ministry.id} className="overflow-hidden">
              {ministry.imageUrl && (
                <div className="h-40 bg-amber-100 overflow-hidden">
                  <img
                    src={ministry.imageUrl}
                    alt={ministry.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-bold text-amber-900 mb-1">{ministry.name}</h3>
                <p className="text-xs text-amber-600 mb-3 line-clamp-2">{ministry.description}</p>
                {ministry.websiteUrl && (
                  <a
                    href={ministry.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-amber-600 hover:text-amber-700 mb-3 block"
                  >
                    Visit Website →
                  </a>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(ministry)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(ministry.id)}
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
          <p className="text-amber-700">No ministries yet. Create one to get started.</p>
        </div>
      )}
    </div>
  );
}
