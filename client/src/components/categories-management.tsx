import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertCategorySchema, type Category, type InsertCategory } from "@shared/schema";

const formSchema = insertCategorySchema;

type FormData = InsertCategory;

export function CategoriesManagement() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertCategory) => {
      const response = await apiRequest("POST", "/api/categories", data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Sukces", description: "Kategoria została dodana" });
      form.reset();
      setIsAddOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
    },
    onError: () => {
      toast({ title: "Błąd", description: "Nie udało się dodać kategorii", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertCategory> }) => {
      const response = await apiRequest("PUT", `/api/categories/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Sukces", description: "Kategoria została zaktualizowana" });
      form.reset();
      setEditingCategory(null);
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
    },
    onError: () => {
      toast({ title: "Błąd", description: "Nie udało się zaktualizować kategorii", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/categories/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Sukces", description: "Kategoria została usunięta" });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
    },
    onError: () => {
      toast({ title: "Błąd", description: "Nie udało się usunąć kategorii", variant: "destructive" });
    },
  });

  const onSubmit = (data: FormData) => {
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    form.reset({
      name: category.name,
      description: category.description || "",
      isActive: category.isActive,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Czy na pewno chcesz usunąć tę kategorię?")) {
      deleteMutation.mutate(id);
    }
  };

  const closeDialog = () => {
    setIsAddOpen(false);
    setEditingCategory(null);
    form.reset();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Zarządzanie kategoriami</h3>
        <Dialog open={isAddOpen || !!editingCategory} onOpenChange={closeDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsAddOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Dodaj kategorię
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Edytuj kategorię" : "Dodaj nową kategorię"}
              </DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nazwa kategorii *</FormLabel>
                      <FormControl>
                        <Input placeholder="Np. Elektronika" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Opis (opcjonalny)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Opisz kategorię..." 
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={closeDialog}>
                    Anuluj
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {(createMutation.isPending || updateMutation.isPending) ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Zapisywanie...
                      </>
                    ) : (
                      editingCategory ? "Zaktualizuj" : "Dodaj"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Brak kategorii</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nazwa</TableHead>
                <TableHead>Opis</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data utworzenia</TableHead>
                <TableHead className="text-right">Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.description || "-"}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      category.isActive 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {category.isActive ? "Aktywna" : "Nieaktywna"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(category.createdAt).toLocaleDateString("pl-PL")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(category.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}