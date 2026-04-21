import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { C, FD, FS, FM } from "@/lib/tokens";
import { useIsMobile } from "@/hooks/useMobile";

interface LayoutProps {
  children: React.ReactNode;
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function IconArrow({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14"/><path d="m13 5 7 7-7 7"/>
    </svg>
  );
}
function IconClose({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}

// ─── K2 Logo ──────────────────────────────────────────────────────────────────
export function K2Logo({ size = 28, color = C.bark }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size * 0.72} viewBox="175 240 425 305" aria-label="K2 Coffee">
      <path fill={color} d="M559.45,510.26l-95.49-150.6-59.05,93.01c-11.31,11.27-30,2.45-27.49-13.71.35-2.28,2.02-4.69,3.08-6.76,19.12-37.03,48.91-73.16,68.88-110.27,6.69-10.16,20.51-10.18,27.22,0l125.98,195.88c5.14,9.05.94,20.08-8.86,23.27l-383.24.71c-12.1-.56-19.1-13.29-13.07-23.98l157.87-252.58c6.47-9.1,19.17-9.46,26.01-.56,9.8,18.91,25.91,37.54,35.25,56.29,8.9,17.88-7.8,32.06-23.67,20.99l-23.31-36.8-2.03-.61-127.98,205.71h319.89Z"/>
    </svg>
  );
}

// ─── Hamburger Icon ───────────────────────────────────────────────────────────
function IconMenu() {
  return (
    <svg width="22" height="16" viewBox="0 0 22 16" fill="none" aria-hidden>
      <line x1="0" y1="1.5" x2="22" y2="1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="4" y1="8" x2="22" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="0" y1="14.5" x2="22" y2="14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

// ─── Ministry Drawer ──────────────────────────────────────────────────────────
interface Ministry {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
}
interface DrawerProduct {
  id: number;
  name: string;
}

function MinistryDrawer({
  product,
  ministries,
  onClose,
  onConfirm,
}: {
  product: DrawerProduct;
  ministries: Ministry[];
  onClose: () => void;
  onConfirm: (ministryId: number | null) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    requestAnimationFrame(() => setOpen(true));
  }, []);

  const handleConfirm = () => {
    if (!selected) return;
    onConfirm(selected);
    setOpen(false);
    setTimeout(onClose, 350);
  };
  const handleClose = () => {
    setOpen(false);
    setTimeout(onClose, 350);
  };
  const handleSkip = () => {
    onConfirm(null);
    setOpen(false);
    setTimeout(onClose, 350);
  };

  const ministry = ministries.find(m => m.id === selected);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={handleClose} style={{
        position: 'absolute', inset: 0,
        background: `rgba(43,29,20,${open ? 0.45 : 0})`,
        transition: 'background 350ms ease', backdropFilter: 'blur(2px)',
      }}/>
      <div style={{
        position: 'relative', background: C.ivory, borderRadius: '24px 24px 0 0',
        padding: `32px ${isMobile ? 20 : 40}px 40px`, maxHeight: '80vh', overflowY: 'auto',
        transform: open ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 350ms cubic-bezier(0.16,1,0.3,1)',
        boxShadow: '0 -8px 40px rgba(43,29,20,0.12)',
      }}>
        <div style={{ width: 36, height: 4, background: C.hairline, borderRadius: 2, margin: '0 auto 28px' }}/>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
          <div>
            <p style={{ fontFamily: FM, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.mocha, marginBottom: 6 }}>
              Added: {product.name}
            </p>
            <h2 style={{ fontFamily: FD, fontSize: 28, fontWeight: 400, color: C.bark, letterSpacing: '-0.02em' }}>
              Now, pick a ministry.
            </h2>
            <p style={{ fontFamily: FS, fontSize: 14, color: C.mocha, marginTop: 6, lineHeight: 1.6, maxWidth: '52ch' }}>
              100% of profit funds the partner you choose. Not a vague cause — a specific name, a specific place.
            </p>
          </div>
          <button onClick={handleClose} style={{
            background: 'none', border: `1px solid ${C.hairline}`, borderRadius: '50%',
            width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: C.mocha, flexShrink: 0, marginLeft: 16,
          }}>
            <IconClose />
          </button>
        </div>

        <div style={{ display: 'grid',
          gridTemplateColumns: isMobile
            ? (ministries.length === 1 ? '1fr' : 'repeat(2,1fr)')
            : `repeat(${Math.min(ministries.length, 3)},1fr)`,
          gap: 12, margin: '24px 0' }}>
          {ministries.map(m => (
            <button key={m.id} onClick={() => setSelected(m.id)}
              style={{
                textAlign: 'left', background: selected === m.id ? C.paper : 'white',
                border: `1.5px solid ${selected === m.id ? C.crema : C.hairline}`,
                borderRadius: 16, overflow: 'hidden', cursor: 'pointer', padding: 0,
                transition: 'all 200ms', outline: 'none',
              }}>
              {m.imageUrl && (
                <div style={{ height: 120, overflow: 'hidden' }}>
                  <img src={m.imageUrl} alt={m.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.9) contrast(1.02)' }}/>
                </div>
              )}
              <div style={{ padding: '14px 16px' }}>
                {selected === m.id && (
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.crema, display: 'inline-block', marginRight: 6, marginBottom: 4 }}/>
                )}
                <p style={{ fontFamily: FS, fontSize: 13, fontWeight: 600, color: C.bark, marginBottom: 4 }}>{m.name}</p>
                {m.description && (
                  <p style={{ fontFamily: FS, fontSize: 12, color: C.mocha, lineHeight: 1.5 }}>{m.description}</p>
                )}
              </div>
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={handleConfirm} disabled={!selected}
            style={{
              flex: 1, background: selected ? C.bark : C.hairline, color: selected ? C.ivory : C.dust,
              border: 'none', borderRadius: 9999, padding: '14px 24px', fontFamily: FS, fontSize: 14, fontWeight: 500,
              cursor: selected ? 'pointer' : 'not-allowed', transition: 'all 200ms',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
            {selected ? `Confirm — fund ${ministry?.name}` : 'Select a ministry above'}
            {selected && <IconArrow size={16} />}
          </button>
          <button onClick={handleSkip}
            style={{
              background: 'none', border: `1px solid ${C.hairline}`, borderRadius: 9999,
              padding: '14px 20px', fontFamily: FS, fontSize: 13, color: C.mocha, cursor: 'pointer',
            }}>
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
export function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  const [vis, setVis] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setVis(true));
    const t = setTimeout(() => { setVis(false); setTimeout(onDone, 400); }, 2800);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{
      position: 'fixed', bottom: 32, left: '50%',
      transform: `translateX(-50%) translateY(${vis ? 0 : 16}px)`,
      opacity: vis ? 1 : 0, transition: 'all 380ms cubic-bezier(0.16,1,0.3,1)',
      background: C.bark, color: C.ivory, padding: '12px 24px', borderRadius: 9999,
      fontFamily: FS, fontSize: 13, fontWeight: 500, zIndex: 300, whiteSpace: 'nowrap',
      boxShadow: '0 4px 24px rgba(43,29,20,0.2)',
    }}>
      {message}
    </div>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
function Nav({ cartCount }: { cartCount: number }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => { setMenuOpen(false); }, [location]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Shop', href: '/shop' },
    { label: 'Subscriptions', href: '/subscribe' },
    { label: 'Ministries', href: '/ministries' },
  ];

  const CartIcon = () => (
    <Link href="/cart" style={{ position: 'relative', textDecoration: 'none', display: 'flex', padding: 4 }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.bark} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" x2="21" y1="6" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
      {cartCount > 0 && (
        <span style={{
          position: 'absolute', top: -4, right: -4, background: C.crema, color: C.bark,
          width: 16, height: 16, borderRadius: '50%', fontSize: 9, fontFamily: FM,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600,
        }}>
          {cartCount}
        </span>
      )}
    </Link>
  );

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: C.linen,
        borderBottom: `1px solid ${scrolled ? C.hairline : 'transparent'}`,
        transition: 'border-color 300ms ease',
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: `0 ${isMobile ? 20 : 40}px`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>

          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <K2Logo size={isMobile ? 32 : 42} />
            <span style={{ fontFamily: FD, fontSize: isMobile ? 18 : 21, fontWeight: 400, color: C.bark, letterSpacing: '-0.015em' }}>
              K2 Coffee
            </span>
          </Link>

          {!isMobile && (
            <nav style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
              {navLinks.map(l => (
                <Link key={l.href} href={l.href}
                  style={{
                    textDecoration: 'none', fontFamily: FS, fontSize: 14, fontWeight: 500,
                    color: location === l.href ? C.bark : C.mocha, transition: 'color 200ms',
                  }}>
                  {l.label}
                </Link>
              ))}
              {isAuthenticated && user?.role === 'admin' && (
                <Link href="/admin" style={{ textDecoration: 'none', fontFamily: FS, fontSize: 14, fontWeight: 500, color: C.mocha }}>
                  Admin
                </Link>
              )}
            </nav>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 16 }}>
            <CartIcon />
            {!isMobile && (
              isAuthenticated ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Link href="/profile"
                    style={{ fontFamily: FS, fontSize: 13, color: C.mocha, textDecoration: 'none' }}>
                    {user?.name || user?.email}
                  </Link>
                  <button onClick={() => logout()}
                    style={{ background: 'none', border: `1px solid ${C.hairline}`, cursor: 'pointer',
                      padding: '8px 16px', borderRadius: 9999, fontFamily: FS, fontSize: 13, color: C.mocha }}>
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link href="/auth"
                  style={{
                    background: C.bark, color: C.ivory, textDecoration: 'none',
                    padding: '8px 20px', borderRadius: 9999, fontFamily: FS, fontSize: 13, fontWeight: 500,
                  }}>
                  Sign In
                </Link>
              )
            )}
            {isMobile && (
              <button onClick={() => setMenuOpen(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer',
                  color: C.bark, padding: 4, display: 'flex', alignItems: 'center' }}>
                <IconMenu />
              </button>
            )}
          </div>
        </div>
      </header>

      {isMobile && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          pointerEvents: menuOpen ? 'auto' : 'none',
        }}>
          <div onClick={() => setMenuOpen(false)} style={{
            position: 'absolute', inset: 0,
            background: `rgba(43,29,20,${menuOpen ? 0.5 : 0})`,
            backdropFilter: menuOpen ? 'blur(4px)' : 'none',
            transition: 'background 300ms ease',
          }}/>
          <div style={{
            position: 'absolute', top: 0, right: 0, bottom: 0, width: '80%', maxWidth: 320,
            background: C.ivory, padding: '24px 24px 40px',
            display: 'flex', flexDirection: 'column',
            transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 320ms cubic-bezier(0.16,1,0.3,1)',
            boxShadow: '-8px 0 40px rgba(43,29,20,0.12)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
              <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                <K2Logo size={28} />
                <span style={{ fontFamily: FD, fontSize: 18, color: C.bark }}>K2 Coffee</span>
              </Link>
              <button onClick={() => setMenuOpen(false)}
                style={{ background: 'none', border: `1px solid ${C.hairline}`, borderRadius: '50%',
                  width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: C.mocha }}>
                <IconClose />
              </button>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: 0, flex: 1 }}>
              {navLinks.map(l => (
                <Link key={l.href} href={l.href}
                  style={{ textDecoration: 'none', fontFamily: FD, fontSize: 32, fontWeight: 400,
                    color: location === l.href ? C.bark : C.cocoa,
                    padding: '14px 0', borderBottom: `1px solid ${C.hairline}`,
                    display: 'block' }}>
                  {l.label}
                </Link>
              ))}
              {isAuthenticated && user?.role === 'admin' && (
                <Link href="/admin"
                  style={{ textDecoration: 'none', fontFamily: FD, fontSize: 32, fontWeight: 400,
                    color: C.cocoa, padding: '14px 0', borderBottom: `1px solid ${C.hairline}`, display: 'block' }}>
                  Admin
                </Link>
              )}
            </nav>

            <div style={{ marginTop: 32 }}>
              {isAuthenticated ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <Link href="/profile"
                    style={{ fontFamily: FS, fontSize: 14, color: C.mocha, textDecoration: 'none' }}>
                    {user?.name || user?.email}
                  </Link>
                  <button onClick={() => { logout(); setMenuOpen(false); }}
                    style={{ background: 'none', border: `1px solid ${C.hairline}`, cursor: 'pointer',
                      padding: '12px 16px', borderRadius: 9999, fontFamily: FS, fontSize: 14, color: C.mocha }}>
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link href="/auth"
                  style={{ display: 'block', background: C.bark, color: C.ivory, textDecoration: 'none',
                    padding: '14px 24px', borderRadius: 9999, fontFamily: FS, fontSize: 14, fontWeight: 500,
                    textAlign: 'center' }}>
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  const isMobile = useIsMobile();
  const pad = isMobile ? 20 : 40;
  return (
    <footer style={{ background: C.bark, color: C.ivory, padding: `${isMobile ? 48 : 64}px ${pad}px 40px` }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr 1fr',
          gap: isMobile ? 28 : 40, marginBottom: 48,
          borderBottom: `1px solid rgba(255,255,255,0.08)`, paddingBottom: 48 }}>
          <div style={{ gridColumn: isMobile ? 'span 2' : 'span 1', marginBottom: isMobile ? 8 : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <K2Logo size={22} color={C.ivory} />
              <span style={{ fontFamily: FD, fontSize: 16, color: C.ivory }}>K2 Coffee</span>
            </div>
            <p style={{ fontFamily: FS, fontSize: 13, color: C.dust, lineHeight: 1.7, maxWidth: '36ch' }}>
              Specialty Yunnan Arabica. Every bag funds a named ministry partner.
            </p>
            <p style={{ fontFamily: FM, fontSize: 11, color: C.mocha, marginTop: 16, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Rooted in Humility. Rising with Purpose.
            </p>
          </div>
          {[
            { title: 'Shop', links: [
              { label: 'The Harvest', href: 'https://www.k2coffee.xyz/shop' },
              { label: 'Subscriptions', href: '/subscribe' },
            ]},
            { title: 'Mission', links: [
              { label: 'Ministries', href: 'https://www.k2coffee.xyz/ministries' },
              { label: 'Our Story', href: 'https://open.substack.com/pub/k2coffee/p/i-started-a-coffee-brand-because' },
            ]},
            { title: 'Support', links: [
              { label: 'Contact', href: 'mailto:j.chen@wec-uk.org' },
            ]},
          ].map(col => (
            <div key={col.title}>
              <p style={{ fontFamily: FM, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.dust, marginBottom: 16 }}>
                {col.title}
              </p>
              {col.links.map(l => (
                <p key={l.label} style={{ marginBottom: 10 }}>
                  <a href={l.href} style={{ fontFamily: FS, fontSize: 13, color: 'rgba(250,245,234,0.6)', textDecoration: 'none' }}>{l.label}</a>
                </p>
              ))}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: 12 }}>
          <p style={{ fontFamily: FM, fontSize: 11, color: C.mocha, letterSpacing: '0.1em' }}>© 2026 K2 COFFEE MINISTRY</p>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Privacy Policy', 'Terms of Service'].map(t => (
              <span key={t} style={{ fontFamily: FM, fontSize: 11, color: C.mocha, letterSpacing: '0.08em', cursor: 'pointer' }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────
export default function Layout({ children }: LayoutProps) {
  const [cartCount, setCartCount] = useState(0);
  const [drawerProduct, setDrawerProduct] = useState<DrawerProduct | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const ministriesQuery = trpc.ministries.list.useQuery();

  useEffect(() => {
    const update = () => {
      try {
        const saved = localStorage.getItem('k2_cart');
        if (saved) {
          const items = JSON.parse(saved);
          setCartCount(items.reduce((s: number, i: any) => s + (i.quantity ?? i.qty ?? 0), 0));
        } else {
          setCartCount(0);
        }
      } catch { setCartCount(0); }
    };
    update();
    window.addEventListener('storage', update);
    window.addEventListener('k2-cart-update', update);
    return () => {
      window.removeEventListener('storage', update);
      window.removeEventListener('k2-cart-update', update);
    };
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as DrawerProduct;
      setDrawerProduct(detail);
    };
    window.addEventListener('k2-show-ministry-drawer', handler);
    return () => window.removeEventListener('k2-show-ministry-drawer', handler);
  }, []);

  const handleMinistryConfirm = (ministryId: number | null) => {
    if (ministryId !== null) {
      localStorage.setItem('k2_ministry', String(ministryId));
      const m = ministriesQuery.data?.find(x => x.id === ministryId);
      setToast(m ? `Added · funding ${m.name}` : 'Added to cart');
    } else {
      setToast('Added to cart');
    }
    setDrawerProduct(null);
  };

  const ministries: Ministry[] = (ministriesQuery.data ?? []).map(m => ({
    id: m.id,
    name: m.name,
    description: m.description ?? null,
    imageUrl: m.imageUrl ?? null,
  }));

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: C.linen }}>
      <div className="k2-grain" aria-hidden />
      <Nav cartCount={cartCount} />
      <main style={{ flex: 1 }} className="k2-page-enter">
        {children}
      </main>
      <Footer />
      {drawerProduct && (
        <MinistryDrawer
          product={drawerProduct}
          ministries={ministries}
          onClose={() => setDrawerProduct(null)}
          onConfirm={handleMinistryConfirm}
        />
      )}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
