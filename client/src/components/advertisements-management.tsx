import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Plus, Edit, Trash2, Eye, MousePointer, ExternalLink } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ImageUploadDropzone } from "./image-upload-dropzone";
import type { Advertisement, InsertAdvertisement } from "@shared/schema";

const advertisementFormSchema = z.object({
  title: z.string().min(1, "Tytuł jest wymagany"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  targetUrl: z.string().url("Podaj prawidłowy URL").optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  priority: z.number().min(1).max(10).default(1)
});

type AdvertisementFormData = z.infer<typeof advertisementFormSchema>;

export function AdvertisementsManagement() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const { toast } = useToast();

  const { data: advertisements = [], isLoading } = useQuery<Advertisement[]>({
    queryKey: ["/api/advertisements"],
    staleTime: 0, // Always refetch when cache is invalidated
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  // Create advertisement mutation
  const createAdMutation = useMutation({
    mutationFn: async (data: InsertAdvertisement) => {
      return await apiRequest("/api/advertisements", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/advertisements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/advertisements/active"] });
      queryClient.refetchQueries({ queryKey: ["/api/advertisements"] });
      queryClient.refetchQueries({ queryKey: ["/api/advertisements/active"] });
      setIsAddOpen(false);
      toast({
        title: "Sukces",
        description: "Reklama została utworzona pomyślnie",
      });
    },
    onError: (error) => {
      toast({
        title: "Błąd",
        description: error.message || "Nie udało się utworzyć reklamy",
        variant: "destructive",
      });
    },
  });

  // Update advertisement mutation
  const updateAdMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertAdvertisement> }) => {
      return await apiRequest(`/api/advertisements/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/advertisements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/advertisements/active"] });
      queryClient.refetchQueries({ queryKey: ["/api/advertisements"] });
      queryClient.refetchQueries({ queryKey: ["/api/advertisements/active"] });
      setEditingAd(null);
      toast({
        title: "Sukces",
        description: "Reklama została zaktualizowana pomyślnie",
      });
    },
    onError: (error) => {
      toast({
        title: "Błąd",
        description: error.message || "Nie udało się zaktualizować reklamy",
        variant: "destructive",
      });
    },
  });

  // Delete advertisement mutation
  const deleteAdMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/advertisements/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/advertisements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/advertisements/active"] });
      queryClient.refetchQueries({ queryKey: ["/api/advertisements"] });
      queryClient.refetchQueries({ queryKey: ["/api/advertisements/active"] });
      toast({
        title: "Sukces",
        description: "Reklama została usunięta pomyślnie",
      });
    },
    onError: (error) => {
      toast({
        title: "Błąd",
        description: error.message || "Nie udało się usunąć reklamy",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: number) => {
    if (confirm("Czy na pewno chcesz usunąć tę reklamę?")) {
      deleteAdMutation.mutate(id);
    }
  };

  function AdvertisementForm({ advertisement, onClose }: { advertisement?: Advertisement; onClose: () => void }) {
    const form = useForm<AdvertisementFormData>({
      resolver: zodResolver(advertisementFormSchema),
      defaultValues: {
        title: advertisement?.title || "",
        description: advertisement?.description || "",
        imageUrl: advertisement?.imageUrl || "",
        targetUrl: advertisement?.targetUrl || "",
        isActive: advertisement?.isActive ?? true,
        priority: advertisement?.priority || 1
      }
    });

    const onSubmit = (data: AdvertisementFormData) => {
      const submitData: InsertAdvertisement = {
        title: data.title,
        description: data.description || null,
        imageUrl: data.imageUrl || null,
        targetUrl: data.targetUrl || null,
        isActive: data.isActive,
        priority: data.priority
      };

      if (advertisement) {
        updateAdMutation.mutate({ id: advertisement.id, data: submitData });
      } else {
        createAdMutation.mutate(submitData);
      }
    };

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tytuł reklamy</FormLabel>
                <FormControl>
                  <Input placeholder="Np. Promocja 50% zniżki" {...field} />
                </FormControl>
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
                    placeholder="Opisz reklamę..." 
                    rows={3}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Zdjęcie reklamy</FormLabel>
                <FormControl>
                  <ImageUploadDropzone
                    onImageUpload={(url) => field.onChange(url)}
                    currentImageUrl={field.value}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="targetUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link docelowy (opcjonalny)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="https://example.com" 
                    type="url"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priorytet (1-10)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1" 
                      max="10"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-2 pt-2">
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <Label>{field.value ? "Aktywna" : "Nieaktywna"}</Label>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Anuluj
            </Button>
            <Button 
              type="submit" 
              disabled={createAdMutation.isPending || updateAdMutation.isPending}
            >
              {advertisement ? "Zaktualizuj" : "Utwórz"}
            </Button>
          </div>
        </form>
      </Form>
    );
  }

  if (isLoading) {
    return <div className="p-6">Ładowanie reklam...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Zarządzanie reklamami</h2>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Dodaj reklamę
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nowa reklama</DialogTitle>
            </DialogHeader>
            <AdvertisementForm onClose={() => setIsAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {advertisements.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Brak reklam. Dodaj pierwszą reklamę.</p>
            </CardContent>
          </Card>
        ) : (
          advertisements.map((ad) => (
            <Card key={ad.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {ad.title}
                      <Badge variant={ad.isActive ? "default" : "secondary"}>
                        {ad.isActive ? "Aktywna" : "Nieaktywna"}
                      </Badge>
                      <Badge variant="outline">Priorytet: {ad.priority}</Badge>
                    </CardTitle>
                    {ad.description && (
                      <p className="text-sm text-muted-foreground mt-1">{ad.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingAd(ad)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(ad.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  {ad.imageUrl && (
                    <div className="flex-shrink-0">
                      <img
                        src={ad.imageUrl}
                        alt={ad.title}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {ad.views} wyświetleń
                      </div>
                      <div className="flex items-center gap-1">
                        <MousePointer className="h-4 w-4" />
                        {ad.clicks} kliknięć
                      </div>
                      {ad.targetUrl && (
                        <div className="flex items-center gap-1">
                          <ExternalLink className="h-4 w-4" />
                          <a
                            href={ad.targetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Otwórz link
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingAd} onOpenChange={() => setEditingAd(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edytuj reklamę</DialogTitle>
          </DialogHeader>
          {editingAd && (
            <AdvertisementForm 
              advertisement={editingAd} 
              onClose={() => setEditingAd(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}