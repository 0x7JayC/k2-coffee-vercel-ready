import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { C, FD, FS, FM, fmt } from "@/lib/tokens";
import { K2Logo } from "@/components/Layout";

// ─── Reveal hook ──────────────────────────────────────────────────────────────
function useReveal(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { rootMargin: '-60px 0px', threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  const style: React.CSSProperties = {
    opacity: vis ? 1 : 0,
    transform: vis ? 'none' : 'translateY(20px)',
    transition: `opacity 700ms ${delay}ms cubic-bezier(0.16,1,0.3,1), transform 700ms ${delay}ms cubic-bezier(0.16,1,0.3,1)`,
  };
  return [ref, style] as const;
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function IconArrow({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14"/><path d="m13 5 7 7-7 7"/>
    </svg>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  const fade = (delay: number): React.CSSProperties => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'none' : 'translateY(18px)',
    transition: `opacity 800ms ${delay}ms cubic-bezier(0.16,1,0.3,1), transform 800ms ${delay}ms cubic-bezier(0.16,1,0.3,1)`,
  });

  return (
    <section style={{ position: 'relative', minHeight: '100dvh', background: C.linen, overflow: 'hidden' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr',
        minHeight: '100dvh', padding: '0 40px' }}>

        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '96px 56px 96px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, ...fade(0) }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.crema, display: 'inline-block',
              animation: 'k2PulseDot 2.4s ease-in-out infinite' }}/>
            <span style={{ fontFamily: FM, fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: C.mocha }}>
              Yunnan · 1,847m
            </span>
          </div>

          <h1 style={{ fontFamily: FD, fontSize: 'clamp(3rem,5.5vw,5.5rem)', lineHeight: 0.95, fontWeight: 400,
            letterSpacing: '-0.025em', color: C.bark, margin: '28px 0 0', ...fade(80) }}>
            A cup that<br/>
            <em style={{ fontStyle: 'italic', color: C.cocoa }}>remembers</em><br/>
            its altitude.
          </h1>

          <p style={{ fontFamily: FS, fontSize: 17, lineHeight: 1.72, color: C.mocha, maxWidth: '46ch',
            margin: '28px 0 0', ...fade(160) }}>
            K2 sources single-origin Arabica from Yunnan's volcanic highlands. Every bag is tagged to a named
            ministry partner — you pick the roast, you pick the work it does.
          </p>

          <div style={{ display: 'flex', gap: 12, marginTop: 36, ...fade(240) }}>
            <Link href="/shop"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '12px 24px',
                background: C.bark, color: C.ivory, textDecoration: 'none', borderRadius: 9999,
                fontFamily: FS, fontSize: 14, fontWeight: 500 }}>
              Shop the harvest <IconArrow size={16} />
            </Link>
            <Link href="/ministries"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '12px 24px',
                background: 'transparent', color: C.cocoa, textDecoration: 'none',
                border: `1px solid ${C.hairline}`, borderRadius: 9999, fontFamily: FS, fontSize: 14, fontWeight: 500 }}>
              Meet the partners
            </Link>
          </div>

          <div style={{ borderTop: `1px solid ${C.hairline}`, paddingTop: 24, marginTop: 48, display: 'grid',
            gridTemplateColumns: 'repeat(2,1fr)', gap: 0, maxWidth: 240, ...fade(320) }}>
            {[['Origin','Yunnan, China'],['Altitude','1,847m']].map(([label,val],i) => (
              <div key={String(label)} style={{
                borderRight: i === 0 ? `1px solid ${C.hairline}` : 'none',
                padding: i === 0 ? '0 16px 0 0' : '0 0 0 16px',
              }}>
                <div style={{ fontFamily: FM, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.dust }}>
                  {label}
                </div>
                <div style={{ fontFamily: FM, fontSize: 17, color: C.cocoa, marginTop: 4 }}>
                  {val}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative', marginRight: -40 }}>
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: '0 0 0 32px' }}>
            <img src="/hero-image.jpg" alt="Coffee cherries on the branch, Yunnan"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center',
                filter: 'saturate(0.9) contrast(1.05)' }} />
          </div>
          <div style={{ position: 'absolute', left: 32, bottom: 48, display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 18px', borderRadius: 9999, background: 'rgba(250,245,234,0.88)',
            backdropFilter: 'blur(8px)', border: `1px solid ${C.hairline}`,
            opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(10px)',
            transition: 'opacity 700ms 500ms ease, transform 700ms 500ms cubic-bezier(0.16,1,0.3,1)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.crema} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 20 9 9l4 6 3-4 5 9H3Z"/>
            </svg>
            <span style={{ fontFamily: FM, fontSize: 12, color: C.cocoa }}>Harvest · Yunnan</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Marquee ──────────────────────────────────────────────────────────────────
function OriginMarquee() {
  const items = ['Volcanic soil','Single estate · Arabica','Hand-picked harvest',
    'Washed · honey · natural','Small-batch roasted in the UK','Every bag tagged to a ministry'];
  const loop = [...items, ...items];
  return (
    <div style={{ borderTop: `1px solid ${C.hairline}`, borderBottom: `1px solid ${C.hairline}`,
      background: C.linen, overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: 48, padding: '18px 0', whiteSpace: 'nowrap',
        animation: 'k2MarqueeScroll 42s linear infinite', width: 'max-content' }}>
        {loop.map((t, i) => (
          <span key={i} style={{ fontFamily: FM, fontSize: 12, letterSpacing: '0.22em',
            textTransform: 'uppercase', color: C.mocha, display: 'flex', alignItems: 'center', gap: 48 }}>
            {t}
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: C.dust, display: 'inline-block' }}/>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Story Section ────────────────────────────────────────────────────────────
const CHAPTERS = [
  {
    num: '01', eyebrow: 'The Mountain',
    quote: 'The mountain does not need to be the tallest to matter most.',
    body: 'There is a mountain on the border of Pakistan and China. It is not the tallest — it is the second tallest. Every climber who has stood at its base says the same thing: K2 is harder. More demanding. More unforgiving. It does not boast. It simply stands, completely, fully what it was made to be — and by standing, it asks something of you.',
    side: 'left',
  },
  {
    num: '02', eyebrow: 'The Morning',
    quote: 'What is this day actually for?',
    body: "The kettle. The bloom. The wait. Four or five minutes where the world hasn't asked anything of you yet. That moment was worth something. K2 Coffee was built inside that question — not to be the most famous coffee brand, but to be the most faithful one.",
    side: 'right',
  },
  {
    num: '03', eyebrow: 'The Mission',
    quote: 'Ordinary purchasing decisions — made consistently, by enough people — can fund extraordinary things.',
    body: 'In 1904, Father Alfred Liétard planted the first Arabica trees in Yunnan — not for commerce, but as part of a life given to a place and its people. Over a century later, those highlands are still growing. When you buy a K2 coffee, you choose where your purchase goes beyond your cup. Not a vague cause. A specific name. A specific place. A specific job.',
    side: 'left',
  },
];

function StoryChapter({ ch, idx }: { ch: typeof CHAPTERS[0]; idx: number }) {
  const [rNum, sNum] = useReveal(0);
  const [rEye, sEye] = useReveal(80);
  const [rQ, sQ]     = useReveal(160);
  const [rB, sB]     = useReveal(240);
  const flipped = ch.side === 'right';
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center',
      padding: '80px 0', borderTop: idx > 0 ? `1px solid ${C.hairline}` : 'none' }}>
      <div style={{ order: flipped ? 2 : 1 }}>
        <div ref={rNum} style={{ ...sNum, fontFamily: FD, fontSize: 'clamp(6rem,10vw,10rem)', fontWeight: 400,
          color: C.hairline, lineHeight: 1, userSelect: 'none', marginBottom: -16 }}>
          {ch.num}
        </div>
        <div ref={rEye} style={{ ...sEye, fontFamily: FM, fontSize: 11, letterSpacing: '0.22em',
          textTransform: 'uppercase', color: C.crema, marginBottom: 16 }}>
          {ch.eyebrow}
        </div>
        <blockquote ref={rQ} style={{ ...sQ, fontFamily: FD, fontSize: 'clamp(1.4rem,2.4vw,2rem)',
          fontWeight: 400, color: C.bark, lineHeight: 1.2, letterSpacing: '-0.02em',
          margin: 0, borderLeft: `2px solid ${C.crema}`, paddingLeft: 20 }}>
          "{ch.quote}"
        </blockquote>
        <p ref={rB} style={{ ...sB, fontFamily: FS, fontSize: 15, color: C.mocha, lineHeight: 1.78, marginTop: 20, maxWidth: '52ch' }}>
          {ch.body}
        </p>
      </div>
      <div style={{ order: flipped ? 1 : 2 }}>
        {/* Replace with a real brand/origin image for each chapter */}
        <div style={{ aspectRatio: '4/3', borderRadius: 20, background: C.paper }}/>
      </div>
    </div>
  );
}

function StorySection() {
  const [ref, style] = useReveal();
  return (
    <section style={{ background: C.linen, padding: '80px 0' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 40px' }}>
        <div ref={ref} style={{ ...style, marginBottom: 16 }}>
          <p style={{ fontFamily: FM, fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: C.mocha, marginBottom: 12 }}>
            The origin
          </p>
          <h2 style={{ fontFamily: FD, fontSize: 'clamp(2rem,4vw,3.5rem)', fontWeight: 400,
            letterSpacing: '-0.025em', color: C.bark, maxWidth: '18ch', lineHeight: 1.0, margin: 0 }}>
            Three ideas behind every cup.
          </h2>
        </div>
        {CHAPTERS.map((ch, i) => <StoryChapter key={i} ch={ch} idx={i} />)}
      </div>
    </section>
  );
}

// ─── Product Rail ─────────────────────────────────────────────────────────────
function ProductCard({ p, i }: { p: any; i: number }) {
  const [hov, setHov] = useState(false);
  const [ref, style] = useReveal(i * 60);

  const addToCart = () => {
    try {
      const saved = localStorage.getItem('k2_cart');
      const cart = saved ? JSON.parse(saved) : [];
      const ex = cart.find((x: any) => x.id === p.id);
      let updated;
      if (ex) {
        updated = cart.map((x: any) => x.id === p.id ? { ...x, quantity: x.quantity + 1 } : x);
      } else {
        updated = [...cart, { id: p.id, name: p.name, price: p.price, quantity: 1, imageUrl: p.imageUrl }];
      }
      localStorage.setItem('k2_cart', JSON.stringify(updated));
      window.dispatchEvent(new Event('k2-cart-update'));
      window.dispatchEvent(new CustomEvent('k2-show-ministry-drawer', { detail: { id: p.id, name: p.name } }));
    } catch {}
  };

  const notes = p.tastingNotes ? p.tastingNotes.split(',').map((n: string) => n.trim()).filter(Boolean) : [];
  const noteColors = ['#6b3820','#7c2d44','#b88957','#e7a84d','#dcd08a'];

  return (
    <article ref={ref} style={{ ...style, flexShrink: 0, width: 340, scrollSnapAlign: 'start' }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <Link href={`/product/${p.id}`} style={{ textDecoration: 'none', display: 'block' }}>
        <div style={{ position: 'relative', aspectRatio: '4/5', borderRadius: 20, overflow: 'hidden', background: C.paper,
          transform: hov ? 'translateY(-4px)' : 'none', transition: 'transform 500ms cubic-bezier(0.16,1,0.3,1)' }}>
          {p.imageUrl ? (
            <img src={p.imageUrl} alt={p.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.92) contrast(1.02)',
                transform: hov ? 'scale(1.04)' : 'scale(1)', transition: 'transform 900ms cubic-bezier(0.16,1,0.3,1)' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', background: C.paper, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <K2Logo size={48} color={C.dust} />
            </div>
          )}
          {p.weight && (
            <div style={{ position: 'absolute', top: 12, left: 12 }}>
              <span style={{ fontFamily: FM, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase',
                padding: '3px 9px', borderRadius: 9999, border: `1px solid ${C.hairline}`,
                color: C.cocoa, background: 'rgba(250,245,234,0.82)', backdropFilter: 'blur(4px)' }}>
                {p.weight}
              </span>
            </div>
          )}
        </div>
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 style={{ fontFamily: FD, fontSize: 22, fontWeight: 400, color: C.bark, marginTop: 2 }}>{p.name}</h3>
            <span style={{ fontFamily: FM, fontSize: 15, color: C.bark }}>{fmt(p.price)}</span>
          </div>
          {notes.length > 0 && (
            <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
              {notes.slice(0, 3).map((n: string, j: number) => (
                <span key={n} style={{ fontFamily: FS, fontSize: 12, color: C.mocha, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: noteColors[j % noteColors.length], display: 'inline-block' }}/>
                  {n}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
      <button onClick={addToCart}
        style={{ marginTop: 12, width: '100%', padding: '10px', background: hov ? C.bark : 'transparent',
          color: hov ? C.ivory : C.mocha, border: `1px solid ${hov ? C.bark : C.hairline}`, borderRadius: 9999,
          fontFamily: FS, fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 250ms' }}>
        {hov ? 'Add to cart' : '+ Add'}
      </button>
    </article>
  );
}

function HomeProductRail() {
  const productsQuery = trpc.products.list.useQuery();
  const [rHead, sHead] = useReveal();
  const products = productsQuery.data ?? [];

  return (
    <section style={{ background: C.paper, padding: '96px 0' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 56 }}>
          <div ref={rHead} style={sHead}>
            <p style={{ fontFamily: FM, fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: C.mocha, marginBottom: 12 }}>
              01 · The harvest
            </p>
            <h2 style={{ fontFamily: FD, fontSize: 'clamp(2rem,3.5vw,3.25rem)', fontWeight: 400,
              letterSpacing: '-0.025em', color: C.bark, maxWidth: '18ch', lineHeight: 1.0, margin: 0 }}>
              Each roast. <em style={{ fontStyle: 'italic', color: C.cocoa }}>Each from one estate.</em>
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
            <Link href="/shop"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none',
                fontFamily: FS, fontSize: 14, color: C.cocoa,
                borderBottom: `1px solid ${C.cocoa}`, paddingBottom: 2 }}>
              See the full harvest <IconArrow size={14} />
            </Link>
          </div>
        </div>
        <div className="k2-hide-scroll" style={{ display: 'flex', gap: 20, overflowX: 'auto', paddingBottom: 16,
          marginLeft: -40, marginRight: -40, paddingLeft: 40, paddingRight: 40, scrollSnapType: 'x mandatory' }}>
          {products.map((p, i) => <ProductCard key={p.id} p={p} i={i} />)}
          {products.length === 0 && !productsQuery.isLoading && (
            <p style={{ fontFamily: FS, fontSize: 14, color: C.mocha }}>No products available yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Brew Guide ───────────────────────────────────────────────────────────────
const BREW_STEPS = [
  { num: '01', title: 'Open & hang', body: 'Tear open the bag along the notch. Unfold the two ear tabs and hook them over the rim of your cup.', time: null },
  { num: '02', title: 'Pre-wet', body: 'Pour ~20ml of 92°C water slowly over the grounds. This rinses the filter and wakes the coffee.', time: '0:00' },
  { num: '03', title: 'Bloom', body: "Wait 30 seconds. You'll see the grounds swell and release CO₂ — that's freshness you can see.", time: '0:30' },
  { num: '04', title: 'Pour in circles', body: 'Make 3 slow pours in a gentle spiral — centre outward. Total water: 200ml. Take your time between pours.', time: '1:00' },
  { num: '05', title: 'Drain & enjoy', body: 'Allow the coffee to fully drain through — around 3:00–3:30 total. Remove the bag, sit down, ask the question.', time: '3:30' },
];

function EarDripGuide() {
  const [rHead, sHead] = useReveal();
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section style={{ background: C.ivory, padding: '96px 0', borderTop: `1px solid ${C.hairline}` }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 40px' }}>
        <div ref={rHead} style={{ ...sHead, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginBottom: 64, alignItems: 'flex-end' }}>
          <div>
            <p style={{ fontFamily: FM, fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: C.mocha, marginBottom: 14 }}>
              02 · The brew
            </p>
            <h2 style={{ fontFamily: FD, fontSize: 'clamp(2rem,3.8vw,3.5rem)', fontWeight: 400,
              letterSpacing: '-0.025em', color: C.bark, lineHeight: 0.97, maxWidth: '16ch', margin: 0 }}>
              How to brew{' '}
              <em style={{ fontStyle: 'italic', color: C.cocoa }}>ear drip coffee.</em>
            </h2>
          </div>
          <p style={{ fontFamily: FS, fontSize: 15, color: C.mocha, lineHeight: 1.78, maxWidth: '44ch' }}>
            Ear drip (耳挂咖啡) is a single-serve pour-over bag — no equipment needed. Just a cup, hot water,
            and five minutes before the world arrives.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {BREW_STEPS.map((step, i) => {
              const active = activeStep === i;
              const done = i < activeStep;
              return (
                <button key={i} onClick={() => setActiveStep(i)}
                  style={{ textAlign: 'left', background: active ? C.paper : 'transparent',
                    border: `1px solid ${active ? C.hairline : 'transparent'}`,
                    borderRadius: 16, padding: '20px 24px', cursor: 'pointer',
                    transition: 'all 280ms cubic-bezier(0.16,1,0.3,1)', outline: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                      background: active ? C.bark : done ? C.crema : C.linen,
                      border: `1px solid ${active ? C.bark : done ? C.crema : C.hairline}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: active || done ? C.ivory : C.dust, transition: 'all 280ms ease' }}>
                      {done
                        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                        : <span style={{ fontFamily: FM, fontSize: 11, letterSpacing: '0.1em' }}>{step.num}</span>
                      }
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <h3 style={{ fontFamily: FS, fontSize: 15, fontWeight: 600, color: active ? C.bark : C.cocoa, margin: 0 }}>
                          {step.title}
                        </h3>
                        {step.time && (
                          <span style={{ fontFamily: FM, fontSize: 11, color: C.dust, letterSpacing: '0.1em' }}>{step.time}</span>
                        )}
                      </div>
                      <p style={{ fontFamily: FS, fontSize: 13, color: C.mocha, lineHeight: 1.68, marginTop: 4,
                        maxHeight: active ? 80 : 0, overflow: 'hidden',
                        opacity: active ? 1 : 0, transition: 'max-height 350ms ease, opacity 300ms ease' }}>
                        {step.body}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
            {activeStep < BREW_STEPS.length - 1 && (
              <button onClick={() => setActiveStep(s => s + 1)}
                style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 8,
                  alignSelf: 'flex-start', background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: FS, fontSize: 13, color: C.mocha, padding: '0 24px' }}>
                Next step <IconArrow size={14} />
              </button>
            )}
          </div>

          <div style={{ position: 'sticky', top: 80 }}>
            <div style={{ position: 'relative', aspectRatio: '4/5', borderRadius: 24, overflow: 'hidden', background: C.paper }}>
              {/* Replace with a real brew guide image per step */}
              <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20,
                background: 'rgba(250,245,234,0.90)', backdropFilter: 'blur(8px)',
                borderRadius: 14, padding: '16px 20px', border: `1px solid ${C.hairline}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div>
                    <div style={{ fontFamily: FM, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.crema, marginBottom: 3 }}>
                      Step {BREW_STEPS[activeStep].num}
                    </div>
                    <div style={{ fontFamily: FD, fontSize: 18, fontWeight: 400, color: C.bark }}>
                      {BREW_STEPS[activeStep].title}
                    </div>
                  </div>
                  {BREW_STEPS[activeStep].time && (
                    <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                      <div style={{ fontFamily: FM, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.dust }}>Time</div>
                      <div style={{ fontFamily: FM, fontSize: 20, color: C.bark }}>{BREW_STEPS[activeStep].time}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0, borderTop: `1px solid ${C.hairline}`, marginTop: 24 }}>
              {[['Coffee','10g'],['Water','200ml'],['Temp','92°C'],['Time','~3:30']].map(([k,v], i, arr) => (
                <div key={k} style={{ padding: '16px 0',
                  borderRight: i < arr.length - 1 ? `1px solid ${C.hairline}` : 'none',
                  paddingLeft: i > 0 ? 16 : 0, paddingRight: i < arr.length - 1 ? 16 : 0 }}>
                  <div style={{ fontFamily: FM, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.dust, marginBottom: 4 }}>{k}</div>
                  <div style={{ fontFamily: FM, fontSize: 16, color: C.bark }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Impact Strip ─────────────────────────────────────────────────────────────
function ImpactStrip() {
  const rows = [
    { k: 'Proceeds to partners', v: '100%', note: 'After roasting, packaging, and shipping. No one draws a salary from K2.' },
    { k: 'Origin altitude', v: '1,847m', note: 'Slow-grown on volcanic red soil in Baoshan County, Yunnan.' },
  ];
  return (
    <section style={{ background: C.linen, padding: '96px 0', borderTop: `1px solid ${C.hairline}` }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 40px' }}>
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontFamily: FM, fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: C.mocha, marginBottom: 12 }}>
            03 · The receipts
          </p>
          <h2 style={{ fontFamily: FD, fontSize: 'clamp(2rem,3.5vw,3.25rem)', fontWeight: 400,
            letterSpacing: '-0.025em', color: C.bark, maxWidth: '18ch', lineHeight: 1.0, margin: 0 }}>
            Trust is <em style={{ fontStyle: 'italic', color: C.cocoa }}>a line item.</em>
          </h2>
        </div>
        <dl style={{ borderTop: `1px solid ${C.hairline}` }}>
          {rows.map((r, i) => {
            const [ref, style] = useReveal(i * 60);
            return (
              <div key={r.k} ref={ref} style={{ ...style, display: 'grid', gridTemplateColumns: '3fr 3fr 5fr',
                gap: 24, padding: '32px 0', borderBottom: `1px solid ${C.hairline}`, alignItems: 'baseline' }}>
                <dt style={{ fontFamily: FM, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.dust }}>
                  {r.k}
                </dt>
                <dd style={{ fontFamily: FD, fontSize: 'clamp(2rem,3.5vw,3rem)', fontWeight: 400,
                  color: C.bark, letterSpacing: '-0.02em', margin: 0 }}>
                  {r.v}
                </dd>
                <dd style={{ fontFamily: FS, fontSize: 14, color: C.mocha, lineHeight: 1.7, margin: 0 }}>{r.note}</dd>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}

// ─── Closing CTA ──────────────────────────────────────────────────────────────
function ClosingCTA() {
  const [ref, style] = useReveal();
  return (
    <section style={{ background: C.bark, padding: '96px 40px', position: 'relative', overflow: 'hidden' }}>
      <div ref={ref} style={{ ...style, maxWidth: 1400, margin: '0 auto', display: 'grid',
        gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'flex-end', position: 'relative' }}>
        <div>
          <p style={{ fontFamily: FM, fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: C.dust, marginBottom: 20 }}>
            Next step
          </p>
          <h2 style={{ fontFamily: FD, fontSize: 'clamp(2.5rem,5vw,4.5rem)', fontWeight: 400,
            letterSpacing: '-0.025em', color: C.ivory, lineHeight: 0.98, maxWidth: '16ch', margin: 0 }}>
            Pick a roast.<br/>
            <em style={{ color: C.dust }}>Pick a partner.</em>
          </h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 16 }}>
          <p style={{ fontFamily: FS, fontSize: 15, color: C.dust, lineHeight: 1.75, maxWidth: '36ch', textAlign: 'right' }}>
            You'll see the ministry tag at checkout. One order, one chain of custody.
          </p>
          <Link href="/shop"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 28px',
              background: C.ivory, color: C.bark, textDecoration: 'none', borderRadius: 9999,
              fontFamily: FS, fontSize: 14, fontWeight: 500 }}>
            Start the order <IconArrow size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div>
      <Hero />
      <OriginMarquee />
      <StorySection />
      <HomeProductRail />
      <EarDripGuide />
      <ImpactStrip />
      <ClosingCTA />
    </div>
  );
}
