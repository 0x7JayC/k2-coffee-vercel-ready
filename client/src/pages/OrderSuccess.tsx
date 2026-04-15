import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Loader2, AlertCircle, MapPin, Package } from "lucide-react";
import { Link } from "wouter";

export default function OrderSuccess() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("session_id");
    setSessionId(id);
    setReady(true);
  }, []);

  const confirmMutation = trpc.orders.confirmFromStripe.useMutation();

  useEffect(() => {
    if (ready && sessionId && !confirmMutation.data && !confirmMutation.isPending && !confirmMutation.isError) {
      confirmMutation.mutate({ sessionId });
    }
  }, [ready, sessionId]);

  // Clear cart after successful confirmation
  useEffect(() => {
    if (confirmMutation.isSuccess) {
      localStorage.removeItem("k2_cart");
      window.dispatchEvent(new Event("k2-cart-update"));
    }
  }, [confirmMutation.isSuccess]);

  if (!ready || confirmMutation.isPending) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-white gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-amber-900" />
        <p className="text-amber-700 font-medium">Confirming your order…</p>
      </div>
    );
  }

  const order = confirmMutation.data;
  const hasError = confirmMutation.isError;

  // Parse items — stored as JSON string or array
  let items: Array<{ name: string; quantity: number; price: number }> = [];
  if (order?.items) {
    try {
      items = typeof order.items === "string" ? JSON.parse(order.items) : (order.items as any);
    } catch {}
  }

  // Shipping address
  let shipping: Record<string, string | null> | null = null;
  if (order?.shippingAddress) {
    try {
      shipping = typeof order.shippingAddress === "string"
        ? JSON.parse(order.shippingAddress)
        : (order.shippingAddress as any);
    } catch {}
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-2">
            {hasError ? "Payment Received" : "Order Confirmed!"}
          </h1>
          <p className="text-xl text-amber-100">Thank you for your purchase</p>
        </div>
      </section>

      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* Main confirmation card */}
          <Card className="p-8 text-center">
            <div className="flex justify-center mb-6">
              {hasError ? (
                <AlertCircle className="w-16 h-16 text-amber-500" />
              ) : (
                <CheckCircle className="w-16 h-16 text-green-600" />
              )}
            </div>

            <h2 className="text-2xl font-bold text-amber-900 mb-3">
              {hasError ? "Payment Successful" : `Order #${order?.id}`}
            </h2>

            {hasError ? (
              <p className="text-amber-700 mb-6">
                Your payment was received. A confirmation email is on its way — your order will be processed shortly.
              </p>
            ) : (
              <p className="text-amber-700 mb-6">
                Your order has been placed and saved. A confirmation email has been sent to{" "}
                <span className="font-semibold">{order?.customerEmail}</span>.
              </p>
            )}

            <div className="space-y-3">
              <Link href="/profile">
                <Button className="w-full bg-amber-900 hover:bg-amber-800 mb-3">
                  View My Orders
                </Button>
              </Link>
              <Link href="/shop">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </Card>

          {/* Order detail cards — only shown when order saved successfully */}
          {order && (
            <>
              {/* Items */}
              {items.length > 0 && (
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="w-4 h-4 text-amber-700" />
                    <h3 className="font-bold text-amber-900">Items Ordered</h3>
                  </div>
                  <div className="space-y-2">
                    {items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm text-amber-800">
                        <span>{item.name} × {item.quantity}</span>
                        <span>£{((item.price * item.quantity) / 100).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t border-amber-200 pt-2 flex justify-between font-bold text-amber-900">
                      <span>Total</span>
                      <span>£{(order.totalAmount / 100).toFixed(2)}</span>
                    </div>
                  </div>
                </Card>
              )}

              {/* Shipping address */}
              {shipping && shipping.line1 && (
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-4 h-4 text-amber-700" />
                    <h3 className="font-bold text-amber-900">Shipping To</h3>
                  </div>
                  <div className="text-sm text-amber-800 space-y-0.5">
                    {shipping.name && <p className="font-semibold">{shipping.name}</p>}
                    {shipping.line1 && <p>{shipping.line1}</p>}
                    {shipping.line2 && <p>{shipping.line2}</p>}
                    <p>
                      {[shipping.city, shipping.state, shipping.postalCode]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    {shipping.country && <p>{shipping.country}</p>}
                  </div>
                </Card>
              )}
            </>
          )}

          {/* What happens next */}
          <div className="bg-amber-50 rounded-lg p-6">
            <h3 className="font-bold text-amber-900 mb-3">What happens next?</h3>
            <ul className="space-y-2 text-amber-700 text-sm">
              <li>✓ Confirmation email sent to your inbox</li>
              <li>✓ Your order will be prepared for shipment within 2–3 business days</li>
              <li>✓ You'll receive a tracking number once it ships</li>
              <li>✓ 100% of your purchase supports the ministry you selected</li>
            </ul>
          </div>

        </div>
      </section>
    </div>
  );
}
