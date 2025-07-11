import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X, Eye, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { ProductRequest } from "@shared/schema";

interface ProductRequestsTableProps {
  requests: ProductRequest[];
}

export function ProductRequestsTable({ requests }: ProductRequestsTableProps) {
  const [selectedRequest, setSelectedRequest] = useState<ProductRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: number; status: string; notes: string }) => {
      return await apiRequest(`/api/product-requests/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({
          status,
          adminNotes: notes,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/product-requests"] });
      setSelectedRequest(null);
      setAdminNotes("");
      toast({
        title: "Sukces",
        description: "Status prośby został zaktualizowany",
      });
    },
    onError: () => {
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować statusu",
        variant: "destructive",
      });
    },
  });

  const convertToProductMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/product-requests/${id}/convert`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/product-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      toast({
        title: "Sukces",
        description: "Produkt został dodany do katalogu",
      });
    },
    onError: () => {
      toast({
        title: "Błąd",
        description: "Nie udało się dodać produktu",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/product-requests/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/product-requests"] });
      toast({
        title: "Sukces",
        description: "Prośba została usunięta",
      });
    },
    onError: () => {
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć prośby",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (request: ProductRequest) => {
    setSelectedRequest(request);
  };

  const handleReject = (request: ProductRequest) => {
    updateStatusMutation.mutate({
      id: request.id,
      status: "rejected",
      notes: "",
    });
  };

  const confirmApproval = () => {
    if (selectedRequest) {
      updateStatusMutation.mutate({
        id: selectedRequest.id,
        status: "approved",
        notes: adminNotes,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: "secondary" as const, text: "Oczekuje" },
      approved: { variant: "default" as const, text: "Zatwierdzona" },
      rejected: { variant: "destructive" as const, text: "Odrzucona" },
    };
    
    const config = variants[status as keyof typeof variants] || variants.pending;
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(price / 100);
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Brak próśb o dodanie produktów</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produkt</TableHead>
              <TableHead>Kategoria</TableHead>
              <TableHead>Cena</TableHead>
              <TableHead>Zgłaszający</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data zgłoszenia</TableHead>
              <TableHead className="text-right">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>
                  <div className="font-medium">{request.title}</div>
                  <div className="text-sm text-muted-foreground line-clamp-2">
                    {request.description}
                  </div>
                </TableCell>
                <TableCell>{request.category}</TableCell>
                <TableCell>{formatPrice(request.price)}</TableCell>
                <TableCell>
                  <div>{request.submitterName}</div>
                  <div className="text-sm text-muted-foreground">{request.contactPhone}</div>
                </TableCell>
                <TableCell>{getStatusBadge(request.status)}</TableCell>
                <TableCell>{formatDate(request.submittedAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {request.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApprove(request)}
                          disabled={updateStatusMutation.isPending}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(request)}
                          disabled={updateStatusMutation.isPending}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {request.status === "approved" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => convertToProductMutation.mutate(request.id)}
                        disabled={convertToProductMutation.isPending}
                      >
                        <Package className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteMutation.mutate(request.id)}
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

      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Zatwierdź prośbę o dodanie produktu</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">{selectedRequest.title}</h3>
                <p className="text-sm text-muted-foreground">{selectedRequest.description}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Notatki administratora (opcjonalne)</label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Dodaj uwagi dotyczące zatwierdzenia..."
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                  Anuluj
                </Button>
                <Button onClick={confirmApproval} disabled={updateStatusMutation.isPending}>
                  Zatwierdź
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}