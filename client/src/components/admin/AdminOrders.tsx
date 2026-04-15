import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, MapPin, Package } from "lucide-react";
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
          {ordersQuery.data.map((order) => {
            let items: Array<{ name: string; quantity: number; price: number }> = [];
            try {
              items = typeof order.items === "string"
                ? JSON.parse(order.items)
                : (order.items as any) ?? [];
            } catch {}

            let shipping: Record<string, string | null> | null = null;
            try {
              if (order.shippingAddress) {
                shipping = typeof order.shippingAddress === "string"
                  ? JSON.parse(order.shippingAddress)
                  : (order.shippingAddress as any);
              }
            } catch {}

            return (
              <Card key={order.id} className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-amber-600 font-medium uppercase">Order ID</p>
                    <p className="font-bold text-amber-900">#{order.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-amber-600 font-medium uppercase">Customer</p>
                    <p className="font-bold text-amber-900 truncate">{order.customerEmail}</p>
                  </div>
                  <div>
                    <p className="text-xs text-amber-600 font-medium uppercase">Total</p>
                    <p className="font-bold text-amber-900">£{(order.totalAmount / 100).toFixed(2)}</p>
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
                    <p className="text-xs text-amber-600 font-medium uppercase mb-1">Ministry</p>
                    <p className="text-sm text-amber-900 font-medium">
                      {(order as any).ministryName ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-amber-600 font-medium uppercase mb-1">Status</p>
                    <span className={`px-3 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status || "pending"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pb-4 border-b border-amber-200">
                  <div>
                    <div className="flex items-center gap-1 mb-2">
                      <Package className="w-3.5 h-3.5 text-amber-600" />
                      <p className="text-xs text-amber-600 font-medium uppercase">Items</p>
                    </div>
                    <div className="space-y-1">
                      {items.length > 0 ? items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm text-amber-900">
                          <span>{item.name} x{item.quantity}</span>
                          <span className="text-amber-600">£{((item.price * item.quantity) / 100).toFixed(2)}</span>
                        </div>
                      )) : (
                        <p className="text-sm text-amber-600">—</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1 mb-2">
                      <MapPin className="w-3.5 h-3.5 text-amber-600" />
                      <p className="text-xs text-amber-600 font-medium uppercase">Ship To</p>
                    </div>
                    {shipping && shipping.line1 ? (
                      <div className="text-sm text-amber-900 space-y-0.5">
                        {shipping.name && <p className="font-semibold">{shipping.name}</p>}
                        <p>{shipping.line1}</p>
                        {shipping.line2 && <p>{shipping.line2}</p>}
                        <p>
                          {[shipping.city, shipping.state, shipping.postalCode]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                        {shipping.country && <p>{shipping.country}</p>}
                      </div>
                    ) : (
                      <p className="text-sm text-amber-600">No address on record</p>
                    )}
                  </div>
                </div>

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
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-amber-700">No orders yet.</p>
        </div>
      )}
    </div>
  );
}
