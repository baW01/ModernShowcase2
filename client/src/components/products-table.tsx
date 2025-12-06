import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, CheckCircle, Undo, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { EditProductModal } from "./edit-product-modal";
import type { Product } from "@shared/schema";
import noImagePlaceholder from "@/assets/no-image-placeholder.svg";
import { parseImagePair } from "@/lib/image-utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImageGallery } from "@/components/image-gallery";

interface ProductsTableProps {
  products: Product[];
}

export function ProductsTable({ products }: ProductsTableProps) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Product> }) => {
      return await apiRequest(`/api/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] }); // refresh public cache
      toast({
        title: "Sukces",
        description: "Produkt zostal zaktualizowany pomyslnie",
      });
    },
    onError: (error) => {
      toast({
        title: "Blad",
        description: error.message || "Nie udalo sie zaktualizowac produktu",
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/products/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] }); // refresh public cache
      toast({
        title: "Sukces",
        description: "Produkt zostal usuniety pomyslnie",
      });
    },
    onError: (error) => {
      toast({
        title: "Blad",
        description: error.message || "Nie udalo sie usunac produktu",
        variant: "destructive",
      });
    },
  });

  const toggleSoldStatus = (product: Product) => {
    updateProductMutation.mutate({
      id: product.id,
      data: { isSold: !product.isSold },
    });
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditingProduct(null);
    setIsEditModalOpen(false);
  };

  const deleteProduct = (id: number) => {
    if (confirm("Czy na pewno chcesz usunac ten produkt?")) {
      deleteProductMutation.mutate(id);
    }
  };

  const formatPrice = (priceInCents: number) => {
    return `${(priceInCents / 100).toFixed(2)} zl`;
  };

  const getPrimaryImage = (product: Product) => {
    if (product.imageUrls && product.imageUrls.length > 0) {
      const { thumb, full } = parseImagePair(product.imageUrls[0]);
      return thumb || full || noImagePlaceholder;
    }
    return product.imageUrl || noImagePlaceholder;
  };

  const getAllImages = (product: Product) => {
    if (product.imageUrls && product.imageUrls.length > 0) {
      return product.imageUrls;
    }
    return product.imageUrl ? [product.imageUrl] : [];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Zarzadzanie produktami</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produkt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cena
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Telefon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Akcje
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <button
                          type="button"
                          className="h-10 w-10 rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                          onClick={() => setPreviewProduct(product)}
                          aria-label={`Podglad zdjecia ${product.title}`}
                        >
                          <img
                            className="h-full w-full object-cover"
                            src={getPrimaryImage(product)}
                            alt={product.title}
                          />
                        </button>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.title}</div>
                        <div className="text-sm text-gray-500">{product.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatPrice(product.price)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.contactPhone || "Brak"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={product.isSold ? "secondary" : "default"}>
                      {product.isSold ? "Sprzedane" : "Dostepne"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:text-blue-900"
                        onClick={() => openEditModal(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={product.isSold ? "text-secondary hover:text-green-900" : "text-yellow-600 hover:text-yellow-900"}
                        onClick={() => toggleSoldStatus(product)}
                        disabled={updateProductMutation.isPending}
                      >
                        {product.isSold ? <Undo className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-900"
                        onClick={() => deleteProduct(product.id)}
                        disabled={deleteProductMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>

      <EditProductModal
        product={editingProduct}
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
      />

      <Dialog open={!!previewProduct} onOpenChange={(open) => !open && setPreviewProduct(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Zdjecia: {previewProduct?.title}</DialogTitle>
          </DialogHeader>
          {previewProduct && (
            <ImageGallery
              images={getAllImages(previewProduct)}
              alt={previewProduct.title}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
