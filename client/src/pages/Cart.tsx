import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { Loader2, Trash2, Plus, Minus } from "lucide-react";
import { toast } from "sonner";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

function dispatchCartUpdate() {
  window.dispatchEvent(new Event("k2-cart-update"));
}

export default function Cart() {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedMinistry, setSelectedMinistry] = useState<number | null>(null);
  const ministriesQuery = trpc.ministries.list.useQuery();

  const checkoutMutation = trpc.checkout.createSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        localStorage.removeItem("k2_cart");
        dispatchCartUpdate();
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast.error(error.message || "Checkout failed. Please try again.");
    },
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("k2_cart");
      if (saved) {
        setCart(JSON.parse(saved));
      }
    }
  }, []);

  const handleUpdateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(id);
      return;
    }
    const updated = cart.map((item) =>
      item.id === id ? { ...item, quantity } : item
    );
    setCart(updated);
    localStorage.setItem("k2_cart", JSON.stringify(updated));
    dispatchCartUpdate();
  };

  const handleRemoveItem = (id: number) => {
    const updated = cart.filter((item) => item.id !== id);
    setCart(updated);
    localStorage.setItem("k2_cart", JSON.stringify(updated));
    dispatchCartUpdate();
    toast.success("Item removed from cart");
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      window.location.href = "/auth";
      return;
    }
    if (!selectedMinistry) {
      toast.error("Please select a ministry to support");
      return;
    }
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    checkoutMutation.mutate({
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      ministryId: selectedMinistry,
      totalAmount: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    });
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <section className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-2">Shopping Cart</h1>
          <p className="text-xl text-amber-100">Review your order and select a ministry to support</p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {cart.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-amber-900 mb-4">Your cart is empty</h2>
            <p className="text-amber-700 mb-8">Add some coffee to get started</p>
            <Link href="/shop">
              <Button className="bg-amber-900 hover:bg-amber-800">Continue Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-amber-900 mb-6">Order Items</h2>
              <div className="space-y-4">
                {cart.map((item) => (
                  <Card key={item.id} className="p-4 flex gap-4">
                    {item.imageUrl && (
                      <div className="w-24 h-24 bg-amber-100 rounded overflow-hidden flex-shrink-0">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-grow">
                      <h3 className="font-bold text-amber-900">{item.name}</h3>
                      <p className="text-amber-700 text-sm mb-3">£{(item.price / 100).toFixed(2)} each</p>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}>
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center font-bold">{item.quantity}</span>
                        <Button size="sm" variant="outline" onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right flex flex-col justify-between">
                      <p className="font-bold text-amber-900">£{((item.price * item.quantity) / 100).toFixed(2)}</p>
                      <Button size="sm" variant="ghost" onClick={() => handleRemoveItem(item.id)} className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="p-6 sticky top-20">
                <h2 className="text-xl font-bold text-amber-900 mb-6">Order Summary</h2>

                {/* Ministry Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-amber-900 mb-3">
                    Select Ministry to Support
                  </label>
                  {ministriesQuery.isLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  ) : ministriesQuery.data && ministriesQuery.data.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {ministriesQuery.data.map((ministry) => (
                        <label
                          key={ministry.id}
                          className={`flex items-center p-3 border rounded cursor-pointer hover:bg-amber-50 transition-colors ${
                            selectedMinistry === ministry.id
                              ? "border-amber-600 bg-amber-50"
                              : "border-amber-200"
                          }`}
                        >
                          <input
                            type="radio"
                            name="ministry"
                            value={ministry.id}
                            checked={selectedMinistry === ministry.id}
                            onChange={() => setSelectedMinistry(ministry.id)}
                            className="mr-3"
                          />
                          <div>
                            <p className="font-semibold text-amber-900">{ministry.name}</p>
                            <p className="text-xs text-amber-600 line-clamp-1">{ministry.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : null}
                </div>

                {/* Pricing */}
                <div className="space-y-3 mb-6 pb-6 border-b border-amber-200">
                  <div className="flex justify-between text-amber-700">
                    <span>Subtotal</span>
                    <span>£{(subtotal / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-amber-900 text-lg">
                    <span>Total</span>
                    <span>£{(subtotal / 100).toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                {isAuthenticated ? (
                  <Button
                    onClick={handleCheckout}
                    disabled={checkoutMutation.isPending || !selectedMinistry}
                    className="w-full bg-amber-900 hover:bg-amber-800 mb-3"
                  >
                    {checkoutMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Proceed to Checkout"
                    )}
                  </Button>
                ) : (
                  <Link href="/auth">
                    <Button className="w-full bg-amber-900 hover:bg-amber-800 mb-3">
                      Sign In to Checkout
                    </Button>
                  </Link>
                )}

                <Link href="/shop">
                  <Button variant="outline" className="w-full">Continue Shopping</Button>
                </Link>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
