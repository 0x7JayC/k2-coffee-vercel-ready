import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Menu, X, ShoppingCart } from "lucide-react";
import { useState, useEffect } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // Track cart count from localStorage
  useEffect(() => {
    const updateCartCount = () => {
      try {
        const saved = localStorage.getItem("k2_cart");
        if (saved) {
          const items = JSON.parse(saved);
          setCartCount(items.reduce((sum: number, item: any) => sum + item.quantity, 0));
        } else {
          setCartCount(0);
        }
      } catch {
        setCartCount(0);
      }
    };

    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    // Custom event for same-tab updates
    window.addEventListener("k2-cart-update", updateCartCount);
    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("k2-cart-update", updateCartCount);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-amber-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <svg width="32" height="32" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#78350f" d="M559.45,510.26l-95.49-150.6-59.05,93.01c-11.31,11.27-30,2.45-27.49-13.71.35-2.28,2.02-4.69,3.08-6.76,19.12-37.03,48.91-73.16,68.88-110.27,6.69-10.16,20.51-10.18,27.22,0l125.98,195.88c5.14,9.05.94,20.08-8.86,23.27l-383.24.71c-12.1-.56-19.1-13.29-13.07-23.98l157.87-252.58c6.47-9.1,19.17-9.46,26.01-.56,9.8,18.91,25.91,37.54,35.25,56.29,8.9,17.88-7.8,32.06-23.67,20.99l-23.31-36.8-2.03-.61-127.98,205.71h319.89Z"/>
                </svg>
                <span className="font-bold text-xl text-amber-900">
                  K2 Coffee
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link
                href="/shop"
                className="text-amber-900 hover:text-amber-700 font-medium"
              >
                Shop
              </Link>
              <Link
                href="/ministries"
                className="text-amber-900 hover:text-amber-700 font-medium"
              >
                Ministries
              </Link>
              {isAuthenticated && user?.role === "admin" && (
                <Link
                  href="/admin"
                  className="text-amber-900 hover:text-amber-700 font-medium"
                >
                  Admin
                </Link>
              )}
            </nav>

            {/* Right Section */}
            <div className="hidden md:flex items-center gap-4">
              {/* Cart */}
              <Link href="/cart">
                <Button variant="ghost" size="sm" className="relative">
                  <ShoppingCart className="w-5 h-5 text-amber-900" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-amber-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </Link>

              {isAuthenticated ? (
                <>
                  <span className="text-sm text-amber-700">
                    {user?.name || user?.email}
                  </span>
                  <Link href="/profile">
                    <Button variant="outline" size="sm" className="mr-2">
                      Profile
                    </Button>
                  </Link>
                  <Button onClick={handleLogout} variant="outline" size="sm">
                    Logout
                  </Button>
                </>
              ) : (
                <Link href="/auth">
                  <Button
                    className="bg-amber-900 hover:bg-amber-800"
                    size="sm"
                  >
                    Sign In
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2 md:hidden">
              <Link href="/cart">
                <Button variant="ghost" size="sm" className="relative">
                  <ShoppingCart className="w-5 h-5 text-amber-900" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-amber-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </Link>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-amber-900" />
                ) : (
                  <Menu className="w-6 h-6 text-amber-900" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-3">
              <Link
                href="/shop"
                className="block text-amber-900 hover:text-amber-700 font-medium py-2"
              >
                Shop
              </Link>
              <Link
                href="/ministries"
                className="block text-amber-900 hover:text-amber-700 font-medium py-2"
              >
                Ministries
              </Link>
              {isAuthenticated && user?.role === "admin" && (
                <Link
                  href="/admin"
                  className="block text-amber-900 hover:text-amber-700 font-medium py-2"
                >
                  Admin
                </Link>
              )}
              <div className="pt-2 space-y-2">
                {isAuthenticated ? (
                  <>
                    <p className="text-sm text-amber-700 py-2">
                      {user?.name || user?.email}
                    </p>
                    <Link href="/profile">
                      <Button variant="outline" size="sm" className="w-full mb-2">
                        Profile
                      </Button>
                    </Link>
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <Link href="/auth" className="block">
                    <Button
                      className="w-full bg-amber-900 hover:bg-amber-800"
                      size="sm"
                    >
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">{children}</main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <svg width="24" height="24" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#ffffff" d="M559.45,510.26l-95.49-150.6-59.05,93.01c-11.31,11.27-30,2.45-27.49-13.71.35-2.28,2.02-4.69,3.08-6.76,19.12-37.03,48.91-73.16,68.88-110.27,6.69-10.16,20.51-10.18,27.22,0l125.98,195.88c5.14,9.05.94,20.08-8.86,23.27l-383.24.71c-12.1-.56-19.1-13.29-13.07-23.98l157.87-252.58c6.47-9.1,19.17-9.46,26.01-.56,9.8,18.91,25.91,37.54,35.25,56.29,8.9,17.88-7.8,32.06-23.67,20.99l-23.31-36.8-2.03-.61-127.98,205.71h319.89Z"/>
                </svg>
                <span className="font-bold text-lg">K2 Coffee</span>
              </div>
              <p className="text-sm text-amber-100">
                Premium Yunnan Arabica supporting global ministries
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-3">Shop</h3>
              <ul className="space-y-2 text-sm text-amber-100">
                <li>
                  <Link href="/shop" className="hover:text-white">
                    Coffee
                  </Link>
                </li>
                <li>
                  <Link href="/ministries" className="hover:text-white">
                    Ministries
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-3">About</h3>
              <ul className="space-y-2 text-sm text-amber-100">
                <li>
                  <a href="#" className="hover:text-white">
                    Our Story
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Impact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-3">Support</h3>
              <ul className="space-y-2 text-sm text-amber-100">
                <li>
                  <a href="#" className="hover:text-white">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-amber-700 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-amber-100">
              <p>&copy; 2026 K2 Coffee Ministry. All rights reserved.</p>
              <div className="flex gap-6 md:justify-end">
                <a href="#" className="hover:text-white">
                  Privacy Policy
                </a>
                <a href="#" className="hover:text-white">
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
