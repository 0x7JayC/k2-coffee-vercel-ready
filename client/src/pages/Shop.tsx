import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { C, FD, FS, FM, fmt } from "@/lib/tokens";
import { K2Logo } from "@/components/Layout";
import { useIsMobile } from "@/hooks/useMobile";

function useReveal(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { rootMargin: '-40px 0px', threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, {
    opacity: vis ? 1 : 0,
    transform: vis ? 'none' : 'translateY(20px)',
    transition: `opacity 600ms ${delay}ms cubic-bezier(0.16,1,0.3,1), transform 600ms ${delay}ms cubic-bezier(0.16,1,0.3,1)`,
  } as React.CSSProperties] as const;
}

function IconArrow({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14"/><path d="m13 5 7 7-7 7"/>
    </svg>
  );
}

function addToCart(p: any) {
  try {
    const saved = localStorage.getItem('k2_cart');
    const cart = saved ? JSON.parse(saved) : [];
    const ex = cart.find((x: any) => x.id === p.id);
    const updated = ex
      ? cart.map((x: any) => x.id === p.id ? { ...x, quantity: x.quantity + 1 } : x)
      : [...cart, { id: p.id, name: p.name, price: p.price, quantity: 1, imageUrl: p.imageUrl }];
    localStorage.setItem('k2_cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('k2-cart-update'));
    window.dispatchEvent(new CustomEvent('k2-show-ministry-drawer', { detail: { id: p.id, name: p.name } }));
  } catch {}
}

function ShopCard({ p, i }: { p: any; i: number }) {
  const [hov, setHov] = useState(false);
  const [ref, style] = useReveal(i * 80);
  const notes = p.tastingNotes ? p.tastingNotes.split(',').map((n: string) => n.trim()).filter(Boolean) : [];
  const noteColors = ['#6b3820','#7c2d44','#b88957','#e7a84d','#dcd08a'];

  return (
    <article ref={ref} style={{ ...style }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <Link href={`/product/${p.id}`} style={{ textDecoration: 'none', display: 'block' }}>
        <div style={{ position: 'relative', aspectRatio: '4/5', borderRadius: 20, overflow: 'hidden',
          background: C.paper, transform: hov ? 'translateY(-5px)' : 'none',
          transition: 'transform 500ms cubic-bezier(0.16,1,0.3,1)' }}>
          {p.imageUrl ? (
            <img src={p.imageUrl} alt={p.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.92) contrast(1.02)',
                transform: hov ? 'scale(1.05)' : 'scale(1)', transition: 'transform 900ms cubic-bezier(0.16,1,0.3,1)' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <K2Logo size={56} color={C.dust} />
            </div>
          )}
          {p.weight && (
            <div style={{ position: 'absolute', top: 14, left: 14 }}>
              <span style={{ fontFamily: FM, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase',
                padding: '4px 10px', borderRadius: 9999, border: `1px solid ${C.hairline}`,
                color: C.cocoa, background: 'rgba(250,245,234,0.88)', backdropFilter: 'blur(6px)' }}>
                {p.weight}
              </span>
            </div>
          )}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 14px 14px',
            opacity: hov ? 1 : 0, transform: hov ? 'none' : 'translateY(8px)',
            transition: 'all 250ms ease' }}>
            <button onClick={e => { e.preventDefault(); addToCart(p); }}
              style={{ width: '100%', padding: '12px', background: C.bark, color: C.ivory,
                border: 'none', borderRadius: 12, fontFamily: FS, fontSize: 13, fontWeight: 500,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              Add to cart <IconArrow />
            </button>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
            <h3 style={{ fontFamily: FD, fontSize: 22, fontWeight: 400, color: C.bark, margin: 0 }}>{p.name}</h3>
            <div style={{ fontFamily: FM, fontSize: 16, color: C.bark, flexShrink: 0 }}>{fmt(p.price)}</div>
          </div>
          {notes.length > 0 && (
            <div style={{ display: 'flex', gap: 14, marginTop: 10, flexWrap: 'wrap' }}>
              {notes.slice(0, 3).map((n: string, j: number) => (
                <span key={n} style={{ fontFamily: FS, fontSize: 12, color: C.mocha, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: noteColors[j % noteColors.length], display: 'inline-block' }}/>
                  {n}
                </span>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: 12, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.hairline}` }}>
            {p.weight && (
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: FM, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.dust }}>Weight</div>
                <div style={{ fontFamily: FM, fontSize: 13, color: C.cocoa, marginTop: 2 }}>{p.weight}</div>
              </div>
            )}
            {p.description && (
              <div style={{ flex: 2 }}>
                <div style={{ fontFamily: FM, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.dust }}>About</div>
                <div style={{ fontFamily: FS, fontSize: 12, color: C.mocha, marginTop: 2, lineHeight: 1.5,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {p.description}
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}

export default function Shop() {
  const productsQuery = trpc.products.list.useQuery();
  const [filter, setFilter] = useState('All');
  const isMobile = useIsMobile();
  const filters = ['All', 'Light', 'Medium', 'Dark', 'Washed', 'Natural', 'Honey'];
  const pad = isMobile ? 20 : 40;

  const products = productsQuery.data ?? [];
  const filtered = filter === 'All' ? products : products.filter((p: any) =>
    p.name?.toLowerCase().includes(filter.toLowerCase()) ||
    p.description?.toLowerCase().includes(filter.toLowerCase()) ||
    p.tastingNotes?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div style={{ background: C.linen, minHeight: '100vh' }}>
      <div style={{ borderBottom: `1px solid ${C.hairline}`, padding: `${isMobile ? 40 : 64}px ${pad}px ${isMobile ? 32 : 48}px` }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <p style={{ fontFamily: FM, fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: C.mocha, marginBottom: 14 }}>
            The harvest
          </p>
          <h1 style={{ fontFamily: FD, fontSize: 'clamp(2.2rem,5vw,4.5rem)', fontWeight: 400,
            letterSpacing: '-0.025em', color: C.bark, lineHeight: 0.95, maxWidth: '16ch', margin: '0 0 16px' }}>
            Our roasts.<br/>
            <em style={{ fontStyle: 'italic', color: C.cocoa }}>One estate.</em>
          </h1>
          {!isMobile && (
            <p style={{ fontFamily: FS, fontSize: 15, color: C.mocha, maxWidth: '56ch', lineHeight: 1.72 }}>
              Specialty-grade Arabica from Yunnan's volcanic highlands. Cupped, scored, and roasted within 10 days of green arrival.
            </p>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 24, flexWrap: 'wrap' }}>
            {filters.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding: '6px 16px', borderRadius: 9999,
                  border: `1px solid ${filter === f ? C.bark : C.hairline}`,
                  background: filter === f ? C.bark : 'transparent',
                  color: filter === f ? C.ivory : C.mocha,
                  fontFamily: FM, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
                  cursor: 'pointer', transition: 'all 200ms' }}>
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: `${isMobile ? 32 : 56}px ${pad}px ${isMobile ? 64 : 96}px` }}>
        {productsQuery.isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <div style={{ fontFamily: FM, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.dust }}>
              Loading…
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(3, 1fr)',
            gap: isMobile ? 16 : 32 }}>
            {filtered.map((p: any, i: number) => <ShopCard key={p.id} p={p} i={i} />)}
          </div>
        )}

        {!productsQuery.isLoading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontFamily: FM, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.dust, marginBottom: 12 }}>
              No results
            </p>
            <h3 style={{ fontFamily: FD, fontSize: 28, color: C.bark, fontWeight: 400, margin: '0 0 20px' }}>
              No roasts match that filter.
            </h3>
            <button onClick={() => setFilter('All')}
              style={{ background: 'none', border: `1px solid ${C.hairline}`, borderRadius: 9999,
                padding: '8px 20px', fontFamily: FS, fontSize: 13, color: C.mocha, cursor: 'pointer' }}>
              Clear filter
            </button>
          </div>
        )}

        <div style={{ marginTop: isMobile ? 48 : 80, padding: isMobile ? '28px 20px' : '40px',
          background: C.paper, borderRadius: 20,
          display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr',
          gap: isMobile ? 16 : 40, alignItems: 'center' }}>
          <div>
            <p style={{ fontFamily: FM, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.crema, marginBottom: 12 }}>
              Origin note
            </p>
            <h3 style={{ fontFamily: FD, fontSize: 28, fontWeight: 400, color: C.bark, lineHeight: 1.1, margin: 0 }}>
              Why Yunnan?
            </h3>
          </div>
          <p style={{ fontFamily: FS, fontSize: 15, color: C.mocha, lineHeight: 1.75, margin: 0 }}>
            In 1904, Father Alfred Liétard planted the first Arabica trees in Yunnan — not for commerce,
            but as part of a life given to a place and its people. Over a century later, those same highlands
            are still growing Arabica. Quietly. Faithfully. Less than 5% of all coffee grown worldwide earns
            specialty grade. Ours does.
          </p>
        </div>
      </div>
    </div>
  );
}
