import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { C, FD, FS, FM, fmt } from "@/lib/tokens";
import { K2Logo } from "@/components/Layout";

function IconArrow({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14"/><path d="m13 5 7 7-7 7"/>
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  );
}

const FREQUENCIES = [
  { id: 'weekly',    label: 'Weekly',     sub: 'Every 7 days',  badge: null,       discount: 0   },
  { id: 'biweekly', label: 'Fortnightly', sub: 'Every 14 days', badge: 'Popular',  discount: 5   },
  { id: 'monthly',  label: 'Monthly',     sub: 'Every 30 days', badge: 'Best value', discount: 10 },
];

const QUANTITIES = [1, 2, 3, 4];

const PERKS = [
  'Free local collection and Free UK shipping over £59',
  'Pause or cancel any time — no penalty',
  '100% of profit goes to your chosen ministry',
  'Priority access to new harvests',
];

export default function Subscribe() {
  const productsQuery = trpc.products.list.useQuery();
  const ministriesQuery = trpc.ministries.list.useQuery();

  const [freq, setFreq]       = useState('monthly');
  const [qty, setQty]         = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [selectedMinistry, setSelectedMinistry] = useState<number | null>(null);
  const [step, setStep]       = useState<1 | 2 | 3>(1);

  const products    = productsQuery.data ?? [];
  const ministries  = ministriesQuery.data ?? [];
  const chosenFreq  = FREQUENCIES.find(f => f.id === freq)!;
  const chosenProd  = products.find(p => p.id === selectedProduct);
  const chosenMin   = ministries.find(m => m.id === selectedMinistry);

  const basePrice   = chosenProd ? chosenProd.price * qty : 0;
  const discounted  = Math.round(basePrice * (1 - chosenFreq.discount / 100));

  const canNext1 = selectedProduct !== null;
  const canNext2 = selectedMinistry !== null;

  const pillStyle = (active: boolean): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    padding: '2px 8px', borderRadius: 9999, fontSize: 9, fontFamily: FM,
    letterSpacing: '0.14em', textTransform: 'uppercase',
    background: active ? C.crema : 'rgba(196,151,100,0.18)',
    color: active ? C.ivory : C.crema,
  });

  return (
    <div style={{ background: C.linen, minHeight: '100vh' }}>

      {/* ── Hero ── */}
      <section style={{ background: C.bark, padding: '80px 40px 72px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          <div>
            <p style={{ fontFamily: FM, fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: C.crema, marginBottom: 20 }}>
              Subscribe & save
            </p>
            <h1 style={{ fontFamily: FD, fontSize: 'clamp(2.5rem,4.5vw,4.5rem)', fontWeight: 400,
              letterSpacing: '-0.025em', color: C.ivory, lineHeight: 0.97, margin: '0 0 24px' }}>
              Coffee that<br/><em style={{ fontStyle: 'italic', color: C.crema }}>keeps showing up.</em>
            </h1>
            <p style={{ fontFamily: FS, fontSize: 16, color: C.dust, lineHeight: 1.75, maxWidth: '44ch', margin: '0 0 40px' }}>
              Set your roast. Set your rhythm. Every delivery funds the ministry you choose — automatically,
              consistently, without you having to remember.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {PERKS.map(p => (
                <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(196,151,100,0.20)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: C.crema }}>
                    <IconCheck />
                  </span>
                  <span style={{ fontFamily: FS, fontSize: 14, color: C.dust }}>{p}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Frequency cards in hero */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FREQUENCIES.map(f => {
              const active = freq === f.id;
              return (
                <button key={f.id} onClick={() => setFreq(f.id)}
                  style={{ textAlign: 'left', padding: '20px 24px', borderRadius: 16,
                    background: active ? C.cocoa : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${active ? C.crema : 'rgba(255,255,255,0.10)'}`,
                    cursor: 'pointer', transition: 'all 220ms ease' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontFamily: FS, fontSize: 15, fontWeight: 600, color: active ? C.ivory : C.dust }}>
                          {f.label}
                        </span>
                        {f.badge && <span style={pillStyle(active)}>{f.badge}</span>}
                      </div>
                      <span style={{ fontFamily: FM, fontSize: 11, letterSpacing: '0.12em', color: active ? C.crema : C.mocha }}>
                        {f.sub}
                      </span>
                    </div>
                    {f.discount > 0 && (
                      <span style={{ fontFamily: FM, fontSize: 13, color: active ? C.crema : C.dust }}>
                        Save {f.discount}%
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Step indicator ── */}
      <div style={{ background: C.paper, borderBottom: `1px solid ${C.hairline}` }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 40px',
          display: 'flex', gap: 0 }}>
          {[['1', 'Choose your roast'], ['2', 'Pick your ministry'], ['3', 'Review & subscribe']].map(([n, label], i) => {
            const stepNum = (i + 1) as 1 | 2 | 3;
            const active  = step === stepNum;
            const done    = step > stepNum;
            return (
              <button key={n} onClick={() => done && setStep(stepNum)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '18px 28px 18px 0',
                  background: 'none', border: 'none', cursor: done ? 'pointer' : 'default',
                  borderBottom: active ? `2px solid ${C.bark}` : '2px solid transparent',
                  marginBottom: -1, transition: 'border-color 200ms' }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%',
                  background: done ? C.bark : active ? C.bark : C.hairline,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: done || active ? C.ivory : C.dust, transition: 'all 200ms' }}>
                  {done
                    ? <IconCheck />
                    : <span style={{ fontFamily: FM, fontSize: 10 }}>{n}</span>}
                </span>
                <span style={{ fontFamily: FS, fontSize: 13, fontWeight: active ? 600 : 400,
                  color: active ? C.bark : C.mocha }}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '56px 40px 96px' }}>

        {/* ── Step 1: Choose roast ── */}
        {step === 1 && (
          <div>
            <div style={{ marginBottom: 40 }}>
              <h2 style={{ fontFamily: FD, fontSize: 'clamp(1.8rem,3vw,2.8rem)', fontWeight: 400, color: C.bark, margin: '0 0 8px' }}>
                Which roast?
              </h2>
              <p style={{ fontFamily: FS, fontSize: 15, color: C.mocha }}>
                You'll receive this roast with every delivery. You can change it any time.
              </p>
            </div>

            {/* Quantity selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
              <span style={{ fontFamily: FM, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.dust }}>
                Bags per delivery
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                {QUANTITIES.map(q => (
                  <button key={q} onClick={() => setQty(q)}
                    style={{ width: 40, height: 40, borderRadius: 10,
                      background: qty === q ? C.bark : 'transparent',
                      border: `1px solid ${qty === q ? C.bark : C.hairline}`,
                      color: qty === q ? C.ivory : C.mocha, fontFamily: FM, fontSize: 13,
                      cursor: 'pointer', transition: 'all 180ms' }}>
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Product grid */}
            {productsQuery.isLoading ? (
              <div style={{ fontFamily: FM, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.dust }}>Loading…</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20, marginBottom: 40 }}>
                {products.map(p => {
                  const active = selectedProduct === p.id;
                  const price  = Math.round(p.price * qty * (1 - chosenFreq.discount / 100));
                  return (
                    <button key={p.id} onClick={() => setSelectedProduct(p.id)}
                      style={{ textAlign: 'left', background: active ? C.paper : C.ivory,
                        border: `2px solid ${active ? C.bark : C.hairline}`,
                        borderRadius: 20, padding: 0, cursor: 'pointer', overflow: 'hidden',
                        transition: 'all 220ms', outline: 'none' }}>
                      <div style={{ aspectRatio: '4/3', overflow: 'hidden', position: 'relative' }}>
                        {p.imageUrl
                          ? <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover',
                              filter: 'saturate(0.9)', transform: active ? 'scale(1.03)' : 'scale(1)', transition: 'transform 400ms' }} />
                          : <div style={{ width: '100%', height: '100%', background: C.paper,
                              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <K2Logo size={40} color={C.dust} />
                            </div>
                        }
                        {active && (
                          <div style={{ position: 'absolute', top: 12, right: 12, width: 28, height: 28, borderRadius: '50%',
                            background: C.bark, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.ivory }}>
                            <IconCheck />
                          </div>
                        )}
                        {chosenFreq.discount > 0 && (
                          <div style={{ position: 'absolute', top: 12, left: 12 }}>
                            <span style={{ fontFamily: FM, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase',
                              padding: '3px 8px', borderRadius: 9999, background: C.crema, color: C.ivory }}>
                              -{chosenFreq.discount}%
                            </span>
                          </div>
                        )}
                      </div>
                      <div style={{ padding: '16px 20px 20px' }}>
                        <div style={{ fontFamily: FD, fontSize: 20, fontWeight: 400, color: C.bark, marginBottom: 4 }}>
                          {p.name}
                        </div>
                        <div style={{ fontFamily: FM, fontSize: 13, color: C.crema }}>
                          {fmt(price)} / delivery
                          {qty > 1 && <span style={{ color: C.dust, fontSize: 11 }}> · {qty} bags</span>}
                        </div>
                        {p.tastingNotes && (
                          <div style={{ fontFamily: FS, fontSize: 12, color: C.mocha, marginTop: 8, lineHeight: 1.5 }}>
                            {p.tastingNotes.split(',').slice(0, 2).map(n => n.trim()).join(' · ')}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <button onClick={() => canNext1 && setStep(2)} disabled={!canNext1}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 32px',
                background: canNext1 ? C.bark : C.hairline, color: canNext1 ? C.ivory : C.dust,
                border: 'none', borderRadius: 9999, fontFamily: FS, fontSize: 14, fontWeight: 500,
                cursor: canNext1 ? 'pointer' : 'not-allowed', transition: 'all 200ms' }}>
              Choose ministry <IconArrow />
            </button>
          </div>
        )}

        {/* ── Step 2: Ministry ── */}
        {step === 2 && (
          <div>
            <div style={{ marginBottom: 40 }}>
              <h2 style={{ fontFamily: FD, fontSize: 'clamp(1.8rem,3vw,2.8rem)', fontWeight: 400, color: C.bark, margin: '0 0 8px' }}>
                Who does your coffee fund?
              </h2>
              <p style={{ fontFamily: FS, fontSize: 15, color: C.mocha }}>
                Every delivery automatically routes your contribution to this partner.
              </p>
            </div>

            {ministriesQuery.isLoading ? (
              <div style={{ fontFamily: FM, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.dust }}>Loading…</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, marginBottom: 40 }}>
                {ministries.map(m => {
                  const active = selectedMinistry === m.id;
                  return (
                    <button key={m.id} onClick={() => setSelectedMinistry(m.id)}
                      style={{ textAlign: 'left', background: active ? C.paper : C.ivory,
                        border: `2px solid ${active ? C.bark : C.hairline}`,
                        borderRadius: 20, padding: 0, cursor: 'pointer', overflow: 'hidden',
                        transition: 'all 220ms', outline: 'none' }}>
                      <div style={{ position: 'relative', height: 160, overflow: 'hidden', background: C.paper }}>
                        {m.imageUrl
                          ? <img src={m.imageUrl} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover',
                              filter: 'saturate(0.88)', transform: active ? 'scale(1.04)' : 'scale(1)', transition: 'transform 400ms' }} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <K2Logo size={36} color={C.dust} />
                            </div>
                        }
                        {active && (
                          <div style={{ position: 'absolute', top: 12, right: 12, width: 28, height: 28, borderRadius: '50%',
                            background: C.bark, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.ivory }}>
                            <IconCheck />
                          </div>
                        )}
                      </div>
                      <div style={{ padding: '16px 20px 20px' }}>
                        <div style={{ fontFamily: FD, fontSize: 20, fontWeight: 400, color: C.bark, marginBottom: 6 }}>
                          {m.name}
                        </div>
                        <div style={{ fontFamily: FS, fontSize: 13, color: C.mocha, lineHeight: 1.6,
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {m.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setStep(1)}
                style={{ padding: '14px 28px', background: 'transparent', color: C.mocha,
                  border: `1px solid ${C.hairline}`, borderRadius: 9999,
                  fontFamily: FS, fontSize: 14, cursor: 'pointer' }}>
                ← Back
              </button>
              <button onClick={() => canNext2 && setStep(3)} disabled={!canNext2}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 32px',
                  background: canNext2 ? C.bark : C.hairline, color: canNext2 ? C.ivory : C.dust,
                  border: 'none', borderRadius: 9999, fontFamily: FS, fontSize: 14, fontWeight: 500,
                  cursor: canNext2 ? 'pointer' : 'not-allowed', transition: 'all 200ms' }}>
                Review order <IconArrow />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Review ── */}
        {step === 3 && chosenProd && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 48, alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ fontFamily: FD, fontSize: 'clamp(1.8rem,3vw,2.8rem)', fontWeight: 400, color: C.bark, margin: '0 0 32px' }}>
                Your subscription.
              </h2>

              {/* Summary cards */}
              {[
                {
                  label: 'Roast',
                  value: chosenProd.name,
                  sub: `${qty} bag${qty > 1 ? 's' : ''} per delivery`,
                  img: chosenProd.imageUrl,
                  action: () => setStep(1),
                },
                {
                  label: 'Ministry',
                  value: chosenMin?.name ?? '—',
                  sub: 'Receives 100% of profit',
                  img: chosenMin?.imageUrl,
                  action: () => setStep(2),
                },
              ].map(card => (
                <div key={card.label} style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '24px',
                  background: C.paper, borderRadius: 20, marginBottom: 16 }}>
                  <div style={{ width: 72, height: 72, borderRadius: 14, overflow: 'hidden', flexShrink: 0, background: C.linen }}>
                    {card.img
                      ? <img src={card.img} alt={card.value} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <K2Logo size={28} color={C.dust} />
                        </div>
                    }
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: FM, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.dust, marginBottom: 4 }}>
                      {card.label}
                    </div>
                    <div style={{ fontFamily: FD, fontSize: 20, color: C.bark }}>{card.value}</div>
                    <div style={{ fontFamily: FS, fontSize: 12, color: C.mocha, marginTop: 2 }}>{card.sub}</div>
                  </div>
                  <button onClick={card.action}
                    style={{ background: 'none', border: `1px solid ${C.hairline}`, borderRadius: 9999,
                      padding: '6px 14px', fontFamily: FS, fontSize: 12, color: C.mocha, cursor: 'pointer' }}>
                    Change
                  </button>
                </div>
              ))}

              {/* Delivery frequency */}
              <div style={{ padding: '24px', background: C.paper, borderRadius: 20, marginBottom: 16 }}>
                <div style={{ fontFamily: FM, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.dust, marginBottom: 12 }}>
                  Delivery frequency
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {FREQUENCIES.map(f => (
                    <button key={f.id} onClick={() => setFreq(f.id)}
                      style={{ padding: '8px 16px', borderRadius: 9999,
                        background: freq === f.id ? C.bark : 'transparent',
                        border: `1px solid ${freq === f.id ? C.bark : C.hairline}`,
                        color: freq === f.id ? C.ivory : C.mocha,
                        fontFamily: FS, fontSize: 13, cursor: 'pointer', transition: 'all 180ms' }}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={() => setStep(2)}
                style={{ padding: '14px 28px', background: 'transparent', color: C.mocha,
                  border: `1px solid ${C.hairline}`, borderRadius: 9999,
                  fontFamily: FS, fontSize: 14, cursor: 'pointer', marginTop: 8 }}>
                ← Back
              </button>
            </div>

            {/* Sticky order summary */}
            <div style={{ position: 'sticky', top: 80, background: C.bark, borderRadius: 24, padding: '36px 32px', color: C.ivory }}>
              <div style={{ fontFamily: FM, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.crema, marginBottom: 24 }}>
                Order summary
              </div>

              {[
                [`${chosenProd.name} ×${qty}`, fmt(chosenProd.price * qty)],
                chosenFreq.discount > 0 ? [`${chosenFreq.label} discount`, `-${chosenFreq.discount}%`] : null,
                ['UK shipping', 'Free'],
              ].filter(Boolean).map(([k, v]) => (
                <div key={String(k)} style={{ display: 'flex', justifyContent: 'space-between',
                  fontFamily: FS, fontSize: 14, color: C.dust, marginBottom: 14 }}>
                  <span>{k}</span>
                  <span style={{ color: String(k).includes('discount') ? C.crema : C.dust }}>{v}</span>
                </div>
              ))}

              <div style={{ borderTop: `1px solid rgba(255,255,255,0.10)`, paddingTop: 18, marginTop: 4,
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: FS, fontSize: 14, color: C.ivory }}>Per delivery</span>
                <span style={{ fontFamily: FD, fontSize: 28, color: C.ivory }}>{fmt(discounted)}</span>
              </div>

              <div style={{ fontFamily: FM, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
                color: C.mocha, textAlign: 'center', margin: '6px 0 24px' }}>
                Billed {chosenFreq.sub.toLowerCase()}
              </div>

              {/* Ministry impact */}
              {chosenMin && (
                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: '16px',
                  marginBottom: 24, border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontFamily: FM, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.crema, marginBottom: 6 }}>
                    Your impact
                  </div>
                  <div style={{ fontFamily: FS, fontSize: 13, color: C.dust, lineHeight: 1.6 }}>
                    Every delivery funds{' '}
                    <span style={{ color: C.ivory, fontWeight: 500 }}>{chosenMin.name}</span>.
                  </div>
                </div>
              )}

              <button
                style={{ width: '100%', padding: '16px', background: C.crema, color: C.bark,
                  border: 'none', borderRadius: 9999, fontFamily: FS, fontSize: 15, fontWeight: 600,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  transition: 'opacity 200ms' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                Start subscription <IconArrow />
              </button>

              <p style={{ fontFamily: FS, fontSize: 12, color: C.mocha, textAlign: 'center', marginTop: 14, lineHeight: 1.6 }}>
                Cancel or pause any time. No lock-in.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
