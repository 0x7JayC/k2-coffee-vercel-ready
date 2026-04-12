import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Loader2, TrendingUp, ShoppingCart, Users, DollarSign } from "lucide-react";

export default function AdminAnalytics() {
  const ordersQuery = trpc.orders.list.useQuery();

  if (ordersQuery.isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-amber-900" />
      </div>
    );
  }

  const orders = ordersQuery.data || [];

  // Calculate metrics
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);
  const uniqueCustomers = new Set(orders.map((o: any) => o.userId)).size;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Order status breakdown
  const statusCounts = {
    pending: orders.filter((o: any) => o.status === "pending").length,
    paid: orders.filter((o: any) => o.status === "paid").length,
    shipped: orders.filter((o: any) => o.status === "shipped").length,
    completed: orders.filter((o: any) => o.status === "completed").length,
  };

  // Ministry donations
  const ministryDonations: Record<string, number> = {};
  orders.forEach((order: any) => {
    if (order.selectedMinistryId) {
      ministryDonations[order.selectedMinistryId] =
        (ministryDonations[order.selectedMinistryId] || 0) + (order.totalAmount || 0);
    }
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-amber-900">Analytics Dashboard</h2>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-700 font-medium">Total Orders</p>
              <p className="text-3xl font-bold text-amber-900 mt-2">{totalOrders}</p>
            </div>
            <ShoppingCart className="w-12 h-12 text-amber-300 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">Total Revenue</p>
              <p className="text-3xl font-bold text-green-900 mt-2">
                ${(totalRevenue / 100).toFixed(2)}
              </p>
            </div>
            <DollarSign className="w-12 h-12 text-green-300 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">Unique Customers</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{uniqueCustomers}</p>
            </div>
            <Users className="w-12 h-12 text-blue-300 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 font-medium">Avg Order Value</p>
              <p className="text-3xl font-bold text-purple-900 mt-2">
                ${(averageOrderValue / 100).toFixed(2)}
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-purple-300 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Order Status Breakdown */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-amber-900 mb-4">Order Status Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-700 font-medium">Pending</p>
            <p className="text-2xl font-bold text-yellow-900 mt-2">{statusCounts.pending}</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700 font-medium">Paid</p>
            <p className="text-2xl font-bold text-blue-900 mt-2">{statusCounts.paid}</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-sm text-purple-700 font-medium">Shipped</p>
            <p className="text-2xl font-bold text-purple-900 mt-2">{statusCounts.shipped}</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-700 font-medium">Completed</p>
            <p className="text-2xl font-bold text-green-900 mt-2">{statusCounts.completed}</p>
          </div>
        </div>
      </Card>

      {/* Ministry Donations */}
      {Object.keys(ministryDonations).length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-bold text-amber-900 mb-4">Donations by Ministry</h3>
          <div className="space-y-3">
            {Object.entries(ministryDonations).map(([ministryId, amount]) => (
              <div key={ministryId} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                <p className="text-sm font-medium text-amber-900">Ministry ID: {ministryId}</p>
                <p className="text-lg font-bold text-amber-900">${(amount / 100).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Orders Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-amber-900 mb-4">Recent Orders</h3>
        {orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b-2 border-amber-200">
                <tr>
                  <th className="text-left py-2 px-2 font-bold text-amber-900">Order ID</th>
                  <th className="text-left py-2 px-2 font-bold text-amber-900">Customer</th>
                  <th className="text-left py-2 px-2 font-bold text-amber-900">Amount</th>
                  <th className="text-left py-2 px-2 font-bold text-amber-900">Status</th>
                  <th className="text-left py-2 px-2 font-bold text-amber-900">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 10).map((order: any) => (
                  <tr key={order.id} className="border-b border-amber-100 hover:bg-amber-50">
                    <td className="py-2 px-2 text-amber-900">#{order.id}</td>
                    <td className="py-2 px-2 text-amber-900">{order.customerEmail || "N/A"}</td>
                    <td className="py-2 px-2 text-amber-900">${(order.totalAmount / 100).toFixed(2)}</td>
                    <td className="py-2 px-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          order.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : order.status === "shipped"
                            ? "bg-blue-100 text-blue-800"
                            : order.status === "paid"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-amber-900">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-amber-700 text-center py-4">No orders yet</p>
        )}
      </Card>
    </div>
  );
}
