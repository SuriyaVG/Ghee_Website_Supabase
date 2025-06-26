import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/lib/useAdminAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { ProductWithVariants, ProductVariant } from '../../../shared/schemas/products.ts';
import { useNavigate, Link } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/lib/supabaseClient';

function AdminNavBar() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('admin_access_token');
    navigate('/admin', { replace: true });
  };
  return (
    <nav className="flex items-center gap-4 p-4 bg-muted border-b mb-6">
      <Link to="/admin/orders" className="font-bold text-primary hover:underline">Orders</Link>
      <Link to="/admin/inventory" className="font-bold text-primary hover:underline">Inventory Management</Link>
      <button onClick={handleLogout} className="ml-auto px-4 py-2 rounded bg-destructive text-white font-bold hover:bg-destructive/80 transition">Logout</button>
    </nav>
  );
}

export default function AdminInventoryPage() {
  useAdminAuth(); // Redirects if not admin
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: products, isLoading, refetch } = useQuery<ProductWithVariants[]>({
    queryKey: ['products-with-variants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_variants(*)');
      if (error) throw new Error(error.message);
      // Transform data to match ProductWithVariants[]
      return (data || []).map((product: any) => ({
        ...product,
        variants: product.product_variants || [],
      }));
    },
  });
  const [editStock, setEditStock] = useState<Record<number, { value: number; loading: boolean }>>({});

  const updateStockMutation = useMutation({
    mutationFn: async ({ variantId, stock_quantity }: { variantId: number; stock_quantity: number }) => {
      const { error } = await supabase
        .from('product_variants')
        .update({ stock_quantity })
        .eq('id', variantId);
      if (error) {
        throw new Error(error.message || 'Failed to update stock');
      }
      return { variantId, stock_quantity };
    },
    onMutate: ({ variantId }) => {
      setEditStock((prev) => ({
        ...prev,
        [variantId]: { ...(prev[variantId] || { value: 0, loading: false }), loading: true },
      }));
    },
    onSuccess: (data) => {
      toast({ title: 'Stock updated', description: 'Inventory updated successfully.' });
      queryClient.invalidateQueries({ queryKey: ['products-with-variants'] });
      setEditStock((prev) => {
        const newState = { ...prev };
        delete newState[data.variantId];
        return newState;
      });
    },
    onError: (err: any, variables) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      setEditStock((prev) => ({
        ...prev,
        [variables.variantId]: { ...(prev[variables.variantId] || { value: 0 }), loading: false },
      }));
    },
  });

  if (isLoading) return <div className="p-8">Loading inventory...</div>;

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">Inventory Management</h1>
      <table className="min-w-full border rounded bg-card">
        <thead>
          <tr className="bg-muted">
            <th className="p-2 text-left">Product</th>
            <th className="p-2 text-left">Variant</th>
            <th className="p-2 text-left">Size</th>
            <th className="p-2 text-left">Price</th>
            <th className="p-2 text-left">Stock</th>
            <th className="p-2 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {products?.flatMap((product) =>
            product.variants.map((variant: ProductVariant) => (
              <tr key={variant.id} className="border-b last:border-b-0">
                <td className="p-2">{product.name}</td>
                <td className="p-2">{variant.sku || '-'}</td>
                <td className="p-2">{variant.size}</td>
                <td className="p-2">₹{variant.price}</td>
                <td className="p-2">
                  <Input
                    type="number"
                    min={0}
                    value={editStock[variant.id]?.value ?? variant.stock_quantity ?? 0}
                    disabled={editStock[variant.id]?.loading}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10) || 0;
                      setEditStock((prev) => ({
                        ...prev,
                        [variant.id]: { ...(prev[variant.id] || { loading: false }), value },
                      }));
                    }}
                    className="w-24"
                  />
                </td>
                <td className="p-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      const newStock = editStock[variant.id]?.value;
                      if (newStock !== undefined && newStock !== (variant.stock_quantity ?? 0)) {
                        updateStockMutation.mutate({
                          variantId: variant.id,
                          stock_quantity: newStock,
                        });
                      }
                    }}
                    disabled={editStock[variant.id]?.loading || editStock[variant.id]?.value === undefined || editStock[variant.id]?.value === (variant.stock_quantity ?? 0)}
                  >
                    {editStock[variant.id]?.loading ? 'Saving...' : 'Save'}
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </AdminLayout>
  );
}
