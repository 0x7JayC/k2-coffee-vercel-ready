import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";

export default function Profile() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const ordersQuery = trpc.orders.listMine.useQuery(undefined as any, {
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/auth");
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      setLocation("/");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 text-white py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-2">My Account</h1>
          <p className="text-xl text-amber-100">
            View your profile and order history
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <Card className="p-6 h-fit">
              <h2 className="text-2xl font-bold text-amber-900 mb-6">
                Profile
              </h2>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-xs text-amber-600 font-medium uppercase">
                    Name
                  </p>
                  <p className="text-lg font-semibold text-amber-900">
                    {user?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-amber-600 font-medium uppercase">
                    Email
                  </p>
                  <p className="text-lg font-semibold text-amber-900">
                    {user?.email || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-amber-600 font-medium uppercase">
                    Role
                  </p>
                  <p className="text-lg font-semibold text-amber-900 capitalize">
                    {user?.role || "customer"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-amber-600 font-medium uppercase">
                    Member Since
                  </p>
                  <p className="text-lg font-semibold text-amber-900">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>

              <Button
                onClick={handleLogout}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </Card>

            {/* Orders List */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-amber-900 mb-6">
                Order History
              </h2>

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
                          <p className="text-xs text-amber-600 font-medium uppercase">
                            Order ID
                          </p>
                          <p className="font-bold text-amber-900">
                            #{order.id}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-amber-600 font-medium uppercase">
                            Date
                          </p>
                          <p className="font-bold text-amber-900">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-amber-600 font-medium uppercase">
                            Total
                          </p>
                          <p className="font-bold text-amber-900">
                            £{(order.totalAmount / 100).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-amber-600 font-medium uppercase">
                            Status
                          </p>
                          <p
                            className={`font-bold capitalize px-3 py-1 rounded text-xs inline-block ${
                              order.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : order.status === "shipped"
                                ? "bg-blue-100 text-blue-800"
                                : order.status === "paid"
                                ? "bg-purple-100 text-purple-800"
                                : order.status === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {order.status}
                          </p>
                        </div>
                      </div>

                      {order.items && (
                        <div className="pt-4 border-t border-amber-200">
                          <p className="text-xs text-amber-600 font-medium uppercase mb-2">
                            Items
                          </p>
                          <div className="text-sm text-amber-900">
                            {(() => {
                              try {
                                const items =
                                  typeof order.items === "string"
                                    ? JSON.parse(order.items)
                                    : order.items;
                                return (items as any[])
                                  .map(
                                    (item: any) =>
                                      `${item.name} x${item.quantity}`
                                  )
                                  .join(", ");
                              } catch {
                                return "N/A";
                              }
                            })()}
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-amber-700 mb-4">
                    You haven't placed any orders yet.
                  </p>
                  <Link href="/shop">
                    <Button className="bg-amber-900 hover:bg-amber-800">
                      Start Shopping
                    </Button>
                  </Link>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
