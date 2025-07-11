import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { insertSettingsSchema } from "@shared/schema";
import type { Settings, InsertSettings } from "@shared/schema";

interface SettingsFormProps {
  settings?: Settings;
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const { toast } = useToast();

  const form = useForm<InsertSettings>({
    resolver: zodResolver(insertSettingsSchema),
    defaultValues: {
      contactPhone: settings?.contactPhone || "+48 123 456 789",
      storeName: settings?.storeName || "ProductHub",
      storeDescription: settings?.storeDescription || "Przeglądaj naszą wyselekcjonowaną kolekcję i skontaktuj się bezpośrednio ze sprzedawcami",
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: InsertSettings) => {
      return await apiRequest("/api/settings", {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Sukces",
        description: "Ustawienia zostały zaktualizowane pomyślnie",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
    onError: (error) => {
      toast({
        title: "Błąd",
        description: error.message || "Nie udało się zaktualizować ustawień",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertSettings) => {
    updateSettingsMutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ustawienia sklepu</CardTitle>
        <p className="text-sm text-gray-600">Skonfiguruj informacje o sklepie i dane kontaktowe</p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="contactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Główny numer telefonu sklepu</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="+48 123 456 789" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="storeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nazwa sklepu</FormLabel>
                  <FormControl>
                    <Input placeholder="ProductHub" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="storeDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opis sklepu</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Przeglądaj naszą wyselekcjonowaną kolekcję i skontaktuj się bezpośrednio ze sprzedawcami"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={updateSettingsMutation.isPending}
              >
                {updateSettingsMutation.isPending ? "Zapisywanie..." : "Zapisz ustawienia"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
