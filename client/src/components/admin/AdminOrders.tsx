import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminOrders() {
  const ordersQuery = trpc.orders.list.useQuery();
  const updateMutation = trpc.orderNotifications.updateOrderStatus.useMutation();

  const handleStatusChange = async (orderId: number, newStatus: string | null) => {
    if (!newStatus) return;
    try {
      await updateMutation.mutateAsync({
        orderId,
        status: newStatus as "pending" | "paid" | "shipped" | "completed",
      });
      toast.success("Order status updated and notification sent");
      ordersQuery.refetch();
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  const getStatusColor = (status: string | null) => {
    if (!status) status = "pending";
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "paid":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-amber-900">Orders</h2>

      {ordersQuery.isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-amber-900" />
        </div>
      ) : ordersQuery.data && ordersQuery.data.length > 0 ? (
        <div className="space-y-4">
          {ordersQuery.data.map((order) => (
            <Card key={order.id} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-amber-600 font-medium uppercase">Order ID</p>
                  <p className="font-bold text-amber-900">#{order.id}</p>
                </div>
                <div>
                  <p className="text-xs text-amber-600 font-medium uppercase">Customer</p>
                  <p className="font-bold text-amber-900">{order.customerEmail}</p>
                </div>
                <div>
                  <p className="text-xs text-amber-600 font-medium uppercase">Total</p>
                  <p className="font-bold text-amber-900">${(order.totalAmount / 100).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-amber-600 font-medium uppercase">Date</p>
                  <p className="font-bold text-amber-900">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pb-4 border-b border-amber-200">
                <div>
                  <p className="text-xs text-amber-600 font-medium uppercase mb-1">Items</p>
                  <div className="text-sm text-amber-900">
                    {order.items && typeof order.items === "string"
                      ? (() => {
                          try {
                            const items = JSON.parse(order.items);
                            return items
                              .map((item: any) => `${item.name} x${item.quantity}`)
                              .join(", ");
                          } catch {
                            return "N/A";
                          }
                        })()
                      : "N/A"}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-amber-600 font-medium uppercase mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status || "pending"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-amber-600 font-medium uppercase mb-2">Update Status</p>
                  <Select
                    value={order.status || "pending"}
                    onValueChange={(value: string) => handleStatusChange(order.id, value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-amber-700">No orders yet.</p>
        </div>
      )}
    </div>
  );
}
