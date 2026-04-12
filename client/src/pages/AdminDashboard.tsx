import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminProducts from "@/components/admin/AdminProducts";
import AdminMinistries from "@/components/admin/AdminMinistries";
import AdminOrders from "@/components/admin/AdminOrders";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import { Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && isAuthenticated && user?.role !== "admin") {
      setLocation("/");
    }
  }, [loading, isAuthenticated, user?.role]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-white">
        <Loader2 className="w-8 h-8 animate-spin text-amber-900" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-amber-900 mb-2">
            Access Denied
          </h1>
          <p className="text-amber-700">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 text-white py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold">Admin Dashboard</h1>
          <p className="text-amber-100 mt-2">
            Manage products, ministries, and orders
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="analytics" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="ministries">Ministries</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
            </TabsList>

            <TabsContent value="analytics" className="mt-6">
              <AdminAnalytics />
            </TabsContent>

            <TabsContent value="products" className="mt-6">
              <AdminProducts />
            </TabsContent>

            <TabsContent value="ministries" className="mt-6">
              <AdminMinistries />
            </TabsContent>

            <TabsContent value="orders" className="mt-6">
              <AdminOrders />
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
