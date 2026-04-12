import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { Loader2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export default function Shop() {
  const productsQuery = trpc.products.list.useQuery();
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("k2_cart");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const handleAddToCart = (product: any) => {
    const existingItem = cart.find((item) => item.id === product.id);

    let updatedCart;
    if (existingItem) {
      updatedCart = cart.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      updatedCart = [
        ...cart,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          imageUrl: product.imageUrl,
        },
      ];
    }

    setCart(updatedCart);
    localStorage.setItem("k2_cart", JSON.stringify(updatedCart));
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 text-white py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Shop Our Coffee</h1>
          <p className="text-xl text-amber-100 max-w-2xl mx-auto">
            100% Arabica beans from Yunnan, China — grown at altitude on volcanic red soil by smallholder farming families.
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {productsQuery.isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-amber-900" />
            </div>
          ) : productsQuery.data && productsQuery.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {productsQuery.data.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                  {product.imageUrl && (
                    <div className="h-64 bg-amber-100 overflow-hidden">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-amber-900 mb-1">{product.name}</h3>
                    {product.weight && (
                      <p className="text-xs uppercase tracking-wider text-amber-600 mb-3">{product.weight}</p>
                    )}
                    <p className="text-amber-700 text-sm leading-relaxed mb-4 flex-grow">
                      {product.description}
                    </p>
                    {product.tastingNotes && (
                      <p className="text-xs text-amber-600 font-medium mb-4">
                        Notes: {product.tastingNotes}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-4 border-t border-amber-100">
                      <span className="text-2xl font-bold text-amber-900">
                        ${(product.price / 100).toFixed(2)}
                      </span>
                      <Button
                        onClick={() => handleAddToCart(product)}
                        className="bg-amber-900 hover:bg-amber-800"
                        size="sm"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold text-amber-900 mb-2">Coming Soon</h2>
              <p className="text-amber-700">Our coffee selection is being curated. Check back soon.</p>
            </div>
          )}
        </div>
      </section>

      {/* Cart Summary */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-amber-200 shadow-lg">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <ShoppingCart className="w-6 h-6 text-amber-900" />
              <div>
                <p className="text-sm text-amber-700">
                  {cart.length} item{cart.length !== 1 ? "s" : ""} in cart
                </p>
                <p className="text-lg font-bold text-amber-900">
                  ${(cart.reduce((sum, item) => sum + item.price * item.quantity, 0) / 100).toFixed(2)}
                </p>
              </div>
            </div>
            <Link href="/cart">
              <Button className="bg-amber-900 hover:bg-amber-800">
                View Cart
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
