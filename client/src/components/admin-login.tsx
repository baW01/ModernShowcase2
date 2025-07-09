import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const loginSchema = z.object({
  password: z.string().min(1, "Hasło jest wymagane"),
});

type LoginData = z.infer<typeof loginSchema>;

interface AdminLoginProps {
  onLogin: (password: string) => void;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      password: "",
    },
  });

  const onSubmit = async (data: LoginData) => {
    setIsLoading(true);
    try {
      // Sprawdź hasło (w tym przypadku: "Kopia15341534!")
      if (data.password === "Kopia15341534!") {
        onLogin(data.password);
        toast({
          title: "Sukces",
          description: "Zalogowano pomyślnie",
        });
      } else {
        toast({
          title: "Błąd",
          description: "Nieprawidłowe hasło",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Wystąpił błąd podczas logowania",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl">Panel Administracyjny</CardTitle>
          <p className="text-gray-600">Wprowadź hasło aby kontynuować</p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hasło</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Wprowadź hasło administratora"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Logowanie..." : "Zaloguj się"}
              </Button>
            </form>
          </Form>


        </CardContent>
      </Card>
    </div>
  );
}