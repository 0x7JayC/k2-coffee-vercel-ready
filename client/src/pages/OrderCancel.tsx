import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function OrderCancel() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 text-white py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-2">Order Cancelled</h1>
          <p className="text-xl text-amber-100">Your payment was not processed</p>
        </div>
      </section>

      {/* Cancellation Message */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <div className="flex justify-center mb-6">
              <AlertCircle className="w-16 h-16 text-red-600" />
            </div>

            <h2 className="text-3xl font-bold text-amber-900 mb-4">Payment Cancelled</h2>

            <p className="text-lg text-amber-700 mb-6">
              Your order was not completed. No charges have been made to your account.
            </p>

            <div className="bg-amber-50 p-6 rounded mb-8 text-left">
              <h3 className="font-bold text-amber-900 mb-3">What you can do:</h3>
              <ul className="space-y-2 text-amber-700 text-sm">
                <li>• Return to your cart and try again</li>
                <li>• Check that all payment information is correct</li>
                <li>• Try a different payment method</li>
                <li>• Contact support if you need assistance</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Link href="/cart">
                <Button className="w-full bg-amber-900 hover:bg-amber-800 mb-3">
                  Return to Cart
                </Button>
              </Link>
              <Link href="/shop">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
