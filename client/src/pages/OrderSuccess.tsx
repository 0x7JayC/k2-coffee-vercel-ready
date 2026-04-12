import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Loader2 } from "lucide-react";
import { Link } from "wouter";

export default function OrderSuccess() {
  const [location] = useLocation();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("session_id");
    setSessionId(id);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-white">
        <Loader2 className="w-8 h-8 animate-spin text-amber-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 text-white py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-xl text-amber-100">Thank you for your purchase</p>
        </div>
      </section>

      {/* Success Message */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <div className="flex justify-center mb-6">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>

            <h2 className="text-3xl font-bold text-amber-900 mb-4">Payment Successful</h2>

            <p className="text-lg text-amber-700 mb-2">
              Your order has been placed successfully!
            </p>

            {sessionId && (
              <p className="text-sm text-amber-600 mb-6">
                Session ID: <code className="bg-amber-50 px-2 py-1 rounded">{sessionId}</code>
              </p>
            )}

            <div className="bg-amber-50 p-6 rounded mb-8 text-left">
              <h3 className="font-bold text-amber-900 mb-3">What happens next?</h3>
              <ul className="space-y-2 text-amber-700 text-sm">
                <li>✓ You'll receive a confirmation email shortly</li>
                <li>✓ Your order will be processed and prepared for shipment</li>
                <li>✓ You'll receive a tracking number once shipped</li>
                <li>✓ 100% of your purchase supports the ministry you selected</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Link href="/">
                <Button className="w-full bg-amber-900 hover:bg-amber-800 mb-3">
                  Return to Home
                </Button>
              </Link>
              <Link href="/shop">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </Card>

          {/* Additional Info */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <h3 className="font-bold text-amber-900 mb-2">Fast Shipping</h3>
              <p className="text-sm text-amber-700">
                Orders typically ship within 2-3 business days
              </p>
            </Card>
            <Card className="p-6 text-center">
              <h3 className="font-bold text-amber-900 mb-2">Quality Guaranteed</h3>
              <p className="text-sm text-amber-700">
                Premium Yunnan Arabica roasted to perfection
              </p>
            </Card>
            <Card className="p-6 text-center">
              <h3 className="font-bold text-amber-900 mb-2">Ministry Impact</h3>
              <p className="text-sm text-amber-700">
                100% of proceeds support your chosen ministry
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
