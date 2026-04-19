import { useState } from "react";
import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { C, FD, FS, FM, fmt } from "@/lib/tokens";
import { K2Logo } from "@/components/Layout";

function IconArrow({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14"/><path d="m13 5 7 7-7 7"/>
    </svg>
  );
}

function addToCart(p: any, qty = 1) {
  try {
    const saved = localStorage.getItem('k2_cart');
    const cart = saved ? JSON.parse(saved) : [];
    const ex = cart.find((x: any) => x.id === p.id);
    const updated = ex
      ? cart.map((x: any) => x.id === p.id ? { ...x, quantity: x.quantity + qty } : x)
      : [...cart, { id: p.id, name: p.name, price: p.price, quantity: qty, imageUrl: p.imageUrl }];
    localStorage.setItem('k2_cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('k2-cart-update'));
    window.dispatchEvent(new CustomEvent('k2-show-ministry-drawer', { detail: { id: p.id, name: p.name } }));
  } catch {}
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<'notes' | 'origin' | 'brew'>('notes');
  const [imgLoaded, setImgLoaded] = useState(false);

  const productsQuery = trpc.products.list.useQuery();
  const products = productsQuery.data ?? [];
  const p = products.find(x => x.id === Number(id)) || products[0];
  const related = p ? products.filter(x => x.id !== p.id).slice(0, 3) : [];

  if (productsQuery.isLoading) {
    return (
      <div style={{ background: C.linen, minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: FM, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.dust }}>Loading…</div>
      </div>
    );
  }

  if (!p) {
    return (
      <div style={{ background: C.linen, minHeight: '80vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <p style={{ fontFamily: FM, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.dust }}>
          Product not found
        </p>
        <Link href="/shop"
          style={{ fontFamily: FS, fontSize: 14, color: C.cocoa, textDecoration: 'none',
            borderBottom: `1px solid ${C.cocoa}`, paddingBottom: 2 }}>
          Back to shop
        </Link>
      </div>
    );
  }

  const notes = p.tastingNotes ? p.tastingNotes.split(',').map(n => n.trim()).filter(Boolean) : [];
  const noteColors = ['#6b3820', '#7c2d44', '#b88957', '#e7a84d', '#dcd08a'];
  const BREW = { Coffee: '10g', Water: '200ml', Temp: '92°C', Time: '~3:30' };

  return (
    <div style={{ background: C.linen, minHeight: '100vh' }}>
      <div style={{ borderBottom: `1px solid ${C.hairline}`, padding: '16px 40px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href="/shop"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FM,
              fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.mocha,
              padding: 0, textDecoration: 'none' }}>
            Shop
          </Link>
          <span style={{ color: C.hairline, fontFamily: FM, fontSize: 11 }}>→</span>
          <span style={{ fontFamily: FM, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.bark }}>
            {p.name}
          </span>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '56px 40px 96px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'flex-start' }}>
          {/* Image */}
          <div style={{ position: 'sticky', top: 80 }}>
            <div style={{ position: 'relative', aspectRatio: '4/5', borderRadius: 24, overflow: 'hidden', background: C.paper }}>
              {p.imageUrl ? (
                <img src={p.imageUrl} alt={p.name} onLoad={() => setImgLoaded(true)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover',
                    filter: 'saturate(0.92) contrast(1.02)',
                    opacity: imgLoaded ? 1 : 0, transition: 'opacity 600ms ease' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <K2Logo size={64} color={C.dust} />
                </div>
              )}
              {p.weight && (
                <div style={{ position: 'absolute', top: 16, left: 16 }}>
                  <span style={{ fontFamily: FM, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase',
                    padding: '4px 12px', borderRadius: 9999, background: 'rgba(250,245,234,0.9)',
                    backdropFilter: 'blur(6px)', border: `1px solid ${C.hairline}`, color: C.cocoa }}>
                    {p.weight}
                  </span>
                </div>
              )}
            </div>
            {related.length > 0 && (
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                {related.map(r => (
                  <Link key={r.id} href={`/product/${r.id}`}
                    style={{ flex: 1, aspectRatio: '1', borderRadius: 12, overflow: 'hidden',
                      border: `1px solid ${C.hairline}`, display: 'block', background: C.paper,
                      opacity: 0.6, transition: 'opacity 200ms' }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}>
                    {r.imageUrl && (
                      <img src={r.imageUrl} alt={r.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.85)' }}/>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <p style={{ fontFamily: FM, fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
              color: C.crema, marginBottom: 12 }}>
              Single Origin · Yunnan
            </p>
            <h1 style={{ fontFamily: FD, fontSize: 'clamp(2.5rem,4vw,3.75rem)', fontWeight: 400,
              color: C.bark, letterSpacing: '-0.025em', lineHeight: 0.95, margin: '0 0 8px' }}>
              {p.name}
            </h1>
            <div style={{ fontFamily: FM, fontSize: 28, color: C.bark, marginBottom: 28 }}>
              {fmt(p.price)}
              <span style={{ fontFamily: FS, fontSize: 13, color: C.dust, marginLeft: 8 }}>
                {p.weight ? `/ ${p.weight}` : ''}
              </span>
            </div>

            {notes.length > 0 && (
              <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
                {notes.map((n, j) => (
                  <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 16px', borderRadius: 9999, background: C.paper, border: `1px solid ${C.hairline}` }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: noteColors[j % noteColors.length], display: 'inline-block', flexShrink: 0 }}/>
                    <span style={{ fontFamily: FS, fontSize: 13, color: C.bark }}>{n}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${C.hairline}`, marginBottom: 24 }}>
              {[['notes', 'Tasting Notes'], ['origin', 'Origin'], ['brew', 'Brew Guide']].map(([id, label]) => (
                <button key={id} onClick={() => setTab(id as any)}
                  style={{ padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: FS, fontSize: 13, fontWeight: tab === id ? 600 : 400,
                    color: tab === id ? C.bark : C.mocha,
                    borderBottom: `2px solid ${tab === id ? C.bark : 'transparent'}`,
                    marginBottom: -1, transition: 'all 200ms' }}>
                  {label}
                </button>
              ))}
            </div>

            <div style={{ minHeight: 100, marginBottom: 36 }}>
              {tab === 'notes' && (
                <div>
                  <p style={{ fontFamily: FS, fontSize: 15, color: C.mocha, lineHeight: 1.78, marginBottom: 20 }}>
                    {p.description || `A carefully sourced single-origin Arabica from Yunnan's volcanic highlands. Expect a complex, clean cup shaped by altitude.`}
                  </p>
                  {p.weight && (
                    <div style={{ background: C.paper, borderRadius: 12, padding: '14px 16px', display: 'inline-block' }}>
                      <div style={{ fontFamily: FM, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.dust, marginBottom: 4 }}>Weight</div>
                      <div style={{ fontFamily: FS, fontSize: 14, fontWeight: 500, color: C.bark }}>{p.weight}</div>
                    </div>
                  )}
                </div>
              )}
              {tab === 'origin' && (
                <p style={{ fontFamily: FS, fontSize: 15, color: C.mocha, lineHeight: 1.78 }}>
                  Grown on volcanic red soil in Yunnan's highlands — a region shaped by over a century of Arabica cultivation.
                  Specialty-grade, slow-grown at altitude, roasted to order in the UK within 10 days of green arrival.
                </p>
              )}
              {tab === 'brew' && (
                <div>
                  <p style={{ fontFamily: FS, fontSize: 15, color: C.mocha, lineHeight: 1.78, marginBottom: 20 }}>
                    Best brewed as an ear drip (耳挂咖啡) — a single-serve pour-over. No equipment required.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0,
                    borderTop: `1px solid ${C.hairline}`, borderBottom: `1px solid ${C.hairline}` }}>
                    {Object.entries(BREW).map(([k, v], i, arr) => (
                      <div key={k} style={{ padding: '16px 0',
                        borderRight: i < arr.length - 1 ? `1px solid ${C.hairline}` : 'none',
                        paddingLeft: i > 0 ? 16 : 0, paddingRight: i < arr.length - 1 ? 16 : 0 }}>
                        <div style={{ fontFamily: FM, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.dust, marginBottom: 4 }}>{k}</div>
                        <div style={{ fontFamily: FM, fontSize: 16, color: C.bark }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 0,
                border: `1px solid ${C.hairline}`, borderRadius: 9999, overflow: 'hidden', background: C.ivory }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))}
                  style={{ width: 44, height: 44, background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: FM, fontSize: 18, color: C.mocha, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  −
                </button>
                <span style={{ fontFamily: FM, fontSize: 14, color: C.bark, minWidth: 28, textAlign: 'center' }}>{qty}</span>
                <button onClick={() => setQty(q => q + 1)}
                  style={{ width: 44, height: 44, background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: FM, fontSize: 18, color: C.mocha, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  +
                </button>
              </div>
              <button onClick={() => addToCart(p, qty)}
                style={{ flex: 1, padding: '14px 24px', background: C.bark, color: C.ivory,
                  border: 'none', borderRadius: 9999, fontFamily: FS, fontSize: 14, fontWeight: 500,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                Add to cart · {fmt(p.price * qty)} <IconArrow />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '16px',
              borderRadius: 12, background: C.paper, border: `1px solid ${C.hairline}` }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.crema,
                display: 'inline-block', flexShrink: 0, marginTop: 5 }}/>
              <p style={{ fontFamily: FS, fontSize: 13, color: C.mocha, lineHeight: 1.65, margin: 0 }}>
                <strong style={{ color: C.bark }}>100% of profit</strong> goes to a ministry partner you choose at checkout.
                Not a general fund — a specific name, a specific place.
              </p>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div style={{ marginTop: 96, borderTop: `1px solid ${C.hairline}`, paddingTop: 64 }}>
            <p style={{ fontFamily: FM, fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: C.mocha, marginBottom: 12 }}>
              From the same harvest
            </p>
            <h2 style={{ fontFamily: FD, fontSize: 32, fontWeight: 400, color: C.bark, margin: '0 0 40px' }}>
              You might also like
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 28 }}>
              {related.map(r => {
                const rNotes = r.tastingNotes ? r.tastingNotes.split(',').map(n => n.trim()).filter(Boolean) : [];
                return (
                  <Link key={r.id} href={`/product/${r.id}`} style={{ textDecoration: 'none' }}>
                    <article style={{ cursor: 'pointer' }}>
                      <div style={{ aspectRatio: '4/5', borderRadius: 20, overflow: 'hidden', background: C.paper, marginBottom: 16 }}>
                        {r.imageUrl && (
                          <img src={r.imageUrl} alt={r.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.9)' }}/>
                        )}
                      </div>
                      <h3 style={{ fontFamily: FD, fontSize: 20, fontWeight: 400, color: C.bark, margin: '0 0 4px' }}>{r.name}</h3>
                      <div style={{ fontFamily: FM, fontSize: 14, color: C.mocha }}>{fmt(r.price)}</div>
                      {rNotes.length > 0 && (
                        <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                          {rNotes.slice(0, 2).map((n, j) => (
                            <span key={n} style={{ fontFamily: FS, fontSize: 12, color: C.mocha, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <span style={{ width: 5, height: 5, borderRadius: '50%', background: noteColors[j % noteColors.length], display: 'inline-block' }}/>
                              {n}
                            </span>
                          ))}
                        </div>
                      )}
                    </article>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
