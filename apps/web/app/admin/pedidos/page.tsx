'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency, formatDate } from '@/lib/utils';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { toast } from '@/lib/use-toast';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  items: { id: string }[];
}

interface OrdersResponse {
  data: Order[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const statusOptions = [
  { value: 'PENDING', label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'PAID', label: 'Pago', color: 'bg-green-100 text-green-800' },
  { value: 'PROCESSING', label: 'Processando', color: 'bg-blue-100 text-blue-800' },
  { value: 'SHIPPED', label: 'Enviado', color: 'bg-purple-100 text-purple-800' },
  { value: 'DELIVERED', label: 'Entregue', color: 'bg-gray-100 text-gray-800' },
  { value: 'CANCELLED', label: 'Cancelado', color: 'bg-red-100 text-red-800' },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const token = useAuthStore((state) => state.token);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      if (statusFilter) params.set('status', statusFilter);

      const response = await api.get<OrdersResponse>(`/orders?${params}`, { token: token || undefined });
      setOrders(response.data);
      setTotalPages(response.meta.totalPages);
    } catch {
      console.error('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchOrders();
  }, [page, statusFilter, token]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus }, { token: token || undefined });
      toast({ title: 'Status atualizado!' });
      fetchOrders();
    } catch {
      toast({ title: 'Erro ao atualizar status', variant: 'destructive' });
    }
  };

  const getStatusInfo = (status: string) => {
    return statusOptions.find((s) => s.value === status) || statusOptions[0];
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Pedidos</h1>

      <div className="bg-background rounded-lg border">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por número..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            className="border rounded-md px-3 py-2 text-sm bg-background"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Todos os status</option>
            {statusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium">Pedido</th>
                <th className="text-left p-4 font-medium">Cliente</th>
                <th className="text-left p-4 font-medium">Data</th>
                <th className="text-left p-4 font-medium">Itens</th>
                <th className="text-left p-4 font-medium">Total</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-right p-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4"><div className="h-4 bg-muted rounded w-24" /></td>
                    <td className="p-4"><div className="h-4 bg-muted rounded w-32" /></td>
                    <td className="p-4"><div className="h-4 bg-muted rounded w-24" /></td>
                    <td className="p-4"><div className="h-4 bg-muted rounded w-8" /></td>
                    <td className="p-4"><div className="h-4 bg-muted rounded w-20" /></td>
                    <td className="p-4"><div className="h-4 bg-muted rounded w-20" /></td>
                    <td className="p-4"><div className="h-4 bg-muted rounded w-8 ml-auto" /></td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    Nenhum pedido encontrado
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const statusInfo = getStatusInfo(order.status);
                  return (
                    <tr key={order.id} className="hover:bg-muted/50">
                      <td className="p-4 font-medium">#{order.orderNumber}</td>
                      <td className="p-4">
                        <p className="font-medium">{order.user.name}</p>
                        <p className="text-sm text-muted-foreground">{order.user.email}</p>
                      </td>
                      <td className="p-4 text-sm">{formatDate(order.createdAt)}</td>
                      <td className="p-4 text-sm">{order.items.length}</td>
                      <td className="p-4 font-medium">{formatCurrency(order.total)}</td>
                      <td className="p-4">
                        <select
                          className={`text-xs font-medium px-2 py-1 rounded-full ${statusInfo.color}`}
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        >
                          {statusOptions.map((status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end">
                          <Link href={`/admin/pedidos/${order.id}`}>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t flex justify-between items-center">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {page} de {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Próxima
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
