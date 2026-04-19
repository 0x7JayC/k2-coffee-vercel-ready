import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { toast } from "sonner";
import { C, FD, FS, FM, fmt } from "@/lib/tokens";
import { useIsMobile } from "@/hooks/useMobile";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

function IconArrow({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14"/><path d="m13 5 7 7-7 7"/>
    </svg>
  );
}

export default function Cart() {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedMinistry, setSelectedMinistry] = useState<number | null>(null);
  const ministriesQuery = trpc.ministries.list.useQuery();
  const isMobile = useIsMobile();

  const checkoutMutation = trpc.checkout.createSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        localStorage.removeItem('k2_cart');
        localStorage.removeItem('k2_ministry');
        window.dispatchEvent(new Event('k2-cart-update'));
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Checkout failed. Please try again.');
    },
  });

  useEffect(() => {
    const saved = localStorage.getItem('k2_cart');
    if (saved) setCart(JSON.parse(saved));
    const ministry = localStorage.getItem('k2_ministry');
    if (ministry) setSelectedMinistry(Number(ministry));
  }, []);

  const updateQty = (id: number, qty: number) => {
    if (qty <= 0) {
      const updated = cart.filter(i => i.id !== id);
      setCart(updated);
      localStorage.setItem('k2_cart', JSON.stringify(updated));
      window.dispatchEvent(new Event('k2-cart-update'));
      return;
    }
    const updated = cart.map(i => i.id === id ? { ...i, quantity: qty } : i);
    setCart(updated);
    localStorage.setItem('k2_cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('k2-cart-update'));
  };

  const handleCheckout = () => {
    if (!isAuthenticated) { window.location.href = '/auth'; return; }
    if (!selectedMinistry) { toast.error('Please select a ministry to support'); return; }
    if (cart.length === 0) { toast.error('Your cart is empty'); return; }
    checkoutMutation.mutate({
      items: cart.map(i => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.price })),
      ministryId: selectedMinistry,
      totalAmount: cart.reduce((s, i) => s + i.price * i.quantity, 0),
    });
  };

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const ministry = ministriesQuery.data?.find(m => m.id === selectedMinistry);

  if (cart.length === 0) {
    return (
      <div style={{ background: C.linen, minHeight: '80vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <p style={{ fontFamily: FM, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.dust }}>
          Empty cart
        </p>
        <h2 style={{ fontFamily: FD, fontSize: 36, fontWeight: 400, color: C.bark, margin: 0 }}>
          Nothing in the bag yet.
        </h2>
        <p style={{ fontFamily: FS, fontSize: 15, color: C.mocha, maxWidth: '40ch', textAlign: 'center', lineHeight: 1.7 }}>
          Head back to the harvest and pick a roast.
        </p>
        <Link href="/shop"
          style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 24px', background: C.bark, color: C.ivory, textDecoration: 'none',
            borderRadius: 9999, fontFamily: FS, fontSize: 14, fontWeight: 500 }}>
          Shop the harvest <IconArrow />
        </Link>
      </div>
    );
  }

  const pad = isMobile ? 20 : 40;

  return (
    <div style={{ background: C.linen, minHeight: '100vh', padding: `${isMobile ? 40 : 64}px ${pad}px ${isMobile ? 64 : 96}px` }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ marginBottom: isMobile ? 32 : 48 }}>
          <p style={{ fontFamily: FM, fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: C.mocha, marginBottom: 12 }}>
            Your order
          </p>
          <h1 style={{ fontFamily: FD, fontSize: 'clamp(1.8rem,4vw,3.5rem)', fontWeight: 400,
            letterSpacing: '-0.025em', color: C.bark, lineHeight: 0.98, margin: 0 }}>
            Review & checkout.
          </h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: isMobile ? 32 : 40, alignItems: 'flex-start' }}>
          {/* Items */}
          <div>
            <div style={{ borderTop: `1px solid ${C.hairline}` }}>
              {cart.map(item => (
                <div key={item.id} style={{ display: 'grid', gridTemplateColumns: isMobile ? '64px 1fr' : '80px 1fr auto',
                  gap: isMobile ? 14 : 20, padding: '20px 0', borderBottom: `1px solid ${C.hairline}`, alignItems: 'flex-start' }}>
                  <div style={{ width: 80, height: 80, borderRadius: 12, overflow: 'hidden', background: C.paper, flexShrink: 0 }}>
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.9)' }}/>
                    )}
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
                      <div style={{ fontFamily: FD, fontSize: isMobile ? 17 : 20, fontWeight: 400, color: C.bark }}>
                        {item.name}
                      </div>
                      {isMobile && (
                        <div style={{ fontFamily: FM, fontSize: 14, color: C.bark, flexShrink: 0 }}>
                          {fmt(item.price * item.quantity)}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <button onClick={() => updateQty(item.id, item.quantity - 1)}
                        style={{ width: 28, height: 28, borderRadius: '50%', border: `1px solid ${C.hairline}`,
                          background: 'transparent', cursor: 'pointer', fontFamily: FM, fontSize: 16, color: C.mocha,
                          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        −
                      </button>
                      <span style={{ fontFamily: FM, fontSize: 14, color: C.bark, minWidth: 20, textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button onClick={() => updateQty(item.id, item.quantity + 1)}
                        style={{ width: 28, height: 28, borderRadius: '50%', border: `1px solid ${C.hairline}`,
                          background: 'transparent', cursor: 'pointer', fontFamily: FM, fontSize: 16, color: C.mocha,
                          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        +
                      </button>
                      <button onClick={() => updateQty(item.id, 0)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FS,
                          fontSize: 12, color: C.dust, marginLeft: 8, padding: 0 }}>
                        Remove
                      </button>
                    </div>
                  </div>
                  {!isMobile && (
                    <div style={{ fontFamily: FM, fontSize: 16, color: C.bark, textAlign: 'right' }}>
                      {fmt(item.price * item.quantity)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div style={isMobile ? {} : { position: 'sticky', top: 80 }}>
            <div style={{ background: C.paper, borderRadius: 20, padding: 32 }}>
              <h2 style={{ fontFamily: FD, fontSize: 22, fontWeight: 400, color: C.bark, margin: '0 0 24px' }}>
                Order summary
              </h2>

              {/* Ministry tag */}
              <div style={{ marginBottom: 24, padding: '16px', borderRadius: 12,
                background: ministry ? 'rgba(196,151,100,0.12)' : C.linen,
                border: `1px solid ${ministry ? C.crema : C.hairline}` }}>
                {ministry ? (
                  <div>
                    <div style={{ fontFamily: FM, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.crema, marginBottom: 6 }}>
                      Funding
                    </div>
                    <div style={{ fontFamily: FS, fontSize: 14, fontWeight: 600, color: C.bark, marginBottom: 4 }}>
                      {ministry.name}
                    </div>
                    <div style={{ fontFamily: FS, fontSize: 12, color: C.mocha, lineHeight: 1.5 }}>
                      100% of profit goes here.
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontFamily: FM, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.dust, marginBottom: 8 }}>
                      Select a ministry
                    </div>
                    {ministriesQuery.data?.map(m => (
                      <label key={m.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10,
                        marginBottom: 10, cursor: 'pointer' }}>
                        <input type="radio" name="ministry" value={m.id}
                          checked={selectedMinistry === m.id}
                          onChange={() => { setSelectedMinistry(m.id); localStorage.setItem('k2_ministry', String(m.id)); }}
                          style={{ accentColor: C.crema, marginTop: 2, flexShrink: 0 }}/>
                        <span style={{ fontFamily: FS, fontSize: 13, color: C.bark }}>{m.name}</span>
                      </label>
                    ))}
                  </div>
                )}
                {ministry && (
                  <button onClick={() => setSelectedMinistry(null)}
                    style={{ marginTop: 8, background: 'none', border: 'none', cursor: 'pointer',
                      fontFamily: FM, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.dust }}>
                    Change
                  </button>
                )}
              </div>

              <div style={{ borderTop: `1px solid ${C.hairline}`, paddingTop: 20, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontFamily: FS, fontSize: 14, color: C.mocha }}>Subtotal</span>
                  <span style={{ fontFamily: FM, fontSize: 14, color: C.bark }}>{fmt(subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontFamily: FS, fontSize: 14, color: C.mocha }}>Shipping</span>
                  <span style={{ fontFamily: FM, fontSize: 12, color: C.dust }}>Calculated at checkout</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${C.hairline}`, paddingTop: 14, marginTop: 14 }}>
                  <span style={{ fontFamily: FD, fontSize: 18, color: C.bark }}>Total</span>
                  <span style={{ fontFamily: FM, fontSize: 18, color: C.bark }}>{fmt(subtotal)}</span>
                </div>
              </div>

              <button onClick={handleCheckout}
                disabled={checkoutMutation.isPending}
                style={{ width: '100%', padding: '14px', background: C.bark, color: C.ivory,
                  border: 'none', borderRadius: 9999, fontFamily: FS, fontSize: 14, fontWeight: 500,
                  cursor: checkoutMutation.isPending ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12,
                  opacity: checkoutMutation.isPending ? 0.7 : 1 }}>
                {checkoutMutation.isPending ? 'Processing…' : isAuthenticated ? 'Proceed to checkout' : 'Sign in to checkout'}
                {!checkoutMutation.isPending && <IconArrow />}
              </button>
              <Link href="/shop"
                style={{ display: 'block', width: '100%', padding: '14px', background: 'transparent',
                  color: C.mocha, border: `1px solid ${C.hairline}`, borderRadius: 9999,
                  fontFamily: FS, fontSize: 14, cursor: 'pointer', textDecoration: 'none', textAlign: 'center' }}>
                Continue shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
