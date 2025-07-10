import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle, XCircle, Trash2, Mail } from "lucide-react";
import type { DeleteRequest } from "@shared/schema";

interface DeleteRequestsTableProps {
  requests: DeleteRequest[];
}

export function DeleteRequestsTable({ requests }: DeleteRequestsTableProps) {
  const [selectedRequest, setSelectedRequest] = useState<DeleteRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: number; status: string; notes: string }) => {
      const response = await apiRequest("PUT", `/api/delete-requests/${id}/status`, {
        status,
        adminNotes: notes,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/delete-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
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

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/delete-requests/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/delete-requests"] });
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

  const handleApprove = (request: DeleteRequest) => {
    setSelectedRequest(request);
  };

  const handleReject = (request: DeleteRequest) => {
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
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Oczekująca</Badge>;
      case "approved":
        return <Badge variant="default" className="bg-green-500">Zatwierdzona</Badge>;
      case "rejected":
        return <Badge variant="destructive">Odrzucona</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-8">
        <Trash2 className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Brak próśb o usunięcie</h3>
        <p className="mt-1 text-sm text-gray-500">
          Nie ma obecnie żadnych próśb o usunięcie produktów.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Produktu</TableHead>
              <TableHead>Email zgłaszającego</TableHead>
              <TableHead>Powód</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data zgłoszenia</TableHead>
              <TableHead>Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">#{request.productId}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    {request.submitterEmail}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-xs">
                    {request.reason ? (
                      <p className="text-sm text-gray-600 truncate" title={request.reason}>
                        {request.reason}
                      </p>
                    ) : (
                      <span className="text-gray-400 text-sm">Brak powodu</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(request.status)}</TableCell>
                <TableCell>
                  {format(new Date(request.submittedAt), "dd.MM.yyyy HH:mm")}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {request.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          className="bg-green-500 hover:bg-green-600"
                          onClick={() => handleApprove(request)}
                          disabled={updateStatusMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Zatwierdź
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(request)}
                          disabled={updateStatusMutation.isPending}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Odrzuć
                        </Button>
                      </>
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
            <DialogTitle>Potwierdzenie zatwierdzenia prośby o usunięcie</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="space-y-2">
                <p><strong>ID Produktu:</strong> #{selectedRequest.productId}</p>
                <p><strong>Email:</strong> {selectedRequest.submitterEmail}</p>
                {selectedRequest.reason && (
                  <p><strong>Powód:</strong> {selectedRequest.reason}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="adminNotes" className="text-sm font-medium">
                  Notatki administratora (opcjonalne):
                </label>
                <Textarea
                  id="adminNotes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Dodatkowe informacje..."
                  className="min-h-[80px]"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Uwaga:</strong> Zatwierdzenie tej prośby spowoduje <strong>nieodwracalne usunięcie</strong> produktu z systemu.
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedRequest(null)}
                  disabled={updateStatusMutation.isPending}
                >
                  Anuluj
                </Button>
                <Button 
                  variant="destructive"
                  onClick={confirmApproval}
                  disabled={updateStatusMutation.isPending}
                >
                  {updateStatusMutation.isPending ? "Przetwarzanie..." : "Zatwierdź i usuń produkt"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}