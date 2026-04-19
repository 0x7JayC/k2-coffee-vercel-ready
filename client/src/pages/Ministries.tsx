import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { C, FD, FS, FM } from "@/lib/tokens";

function IconArrow({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14"/><path d="m13 5 7 7-7 7"/>
    </svg>
  );
}

export default function Ministries() {
  const ministriesQuery = trpc.ministries.list.useQuery();
  const ministries = ministriesQuery.data ?? [];

  return (
    <div style={{ background: C.linen, minHeight: '100vh', padding: '64px 40px 96px' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ marginBottom: 64 }}>
          <p style={{ fontFamily: FM, fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: C.mocha, marginBottom: 14 }}>
            The work
          </p>
          <h1 style={{ fontFamily: FD, fontSize: 'clamp(2.5rem,5vw,4.5rem)', fontWeight: 400,
            letterSpacing: '-0.025em', color: C.bark, lineHeight: 0.95, maxWidth: '20ch', margin: 0 }}>
            Every bag carries{' '}
            <em style={{ fontStyle: 'italic', color: C.cocoa }}>a name, a place, a job.</em>
          </h1>
          <p style={{ fontFamily: FS, fontSize: 16, color: C.mocha, maxWidth: '52ch', lineHeight: 1.75, marginTop: 24 }}>
            You won't fund a vague cause. You'll pick a specific partner — and we'll publish what your order paid for.
          </p>
        </div>

        {ministriesQuery.isLoading ? (
          <div style={{ fontFamily: FM, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.dust, padding: '40px 0' }}>
            Loading…
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 80 }}>
            {ministries.map((m, i) => {
              const flipped = i % 2 === 1;
              return (
                <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: 64,
                  alignItems: 'center', direction: flipped ? 'rtl' : 'ltr' }}>
                  <div style={{ aspectRatio: '16/10', borderRadius: 20, overflow: 'hidden', background: C.paper, direction: 'ltr' }}>
                    {m.imageUrl ? (
                      <img src={m.imageUrl} alt={m.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.9) contrast(1.02)' }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: C.paper }}/>
                    )}
                  </div>
                  <div style={{ direction: 'ltr' }}>
                    <p style={{ fontFamily: FM, fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
                      color: C.crema, marginBottom: 16 }}>
                      Partner {String(i + 1).padStart(2, '0')}
                    </p>
                    <h2 style={{ fontFamily: FD, fontSize: 32, fontWeight: 400, color: C.bark,
                      margin: '0 0 16px', lineHeight: 1.1 }}>
                      {m.name}
                    </h2>
                    {m.description && (
                      <p style={{ fontFamily: FS, fontSize: 15, color: C.mocha, lineHeight: 1.75, maxWidth: '48ch', marginBottom: 24 }}>
                        {m.description}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      <Link href="/shop"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none',
                          fontFamily: FS, fontSize: 14, color: C.cocoa,
                          borderBottom: `1px solid ${C.cocoa}`, paddingBottom: 2 }}>
                        Fund this ministry <IconArrow />
                      </Link>
                      {m.websiteUrl && (
                        <a href={m.websiteUrl} target="_blank" rel="noopener noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none',
                            fontFamily: FS, fontSize: 14, color: C.dust,
                            borderBottom: `1px solid ${C.hairline}`, paddingBottom: 2 }}>
                          Learn more <IconArrow />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {ministries.length === 0 && (
              <p style={{ fontFamily: FS, fontSize: 15, color: C.mocha }}>No ministry partners listed yet.</p>
            )}
          </div>
        )}

        <div style={{ marginTop: 96, padding: '48px 40px', background: C.bark, borderRadius: 24,
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
          <div>
            <p style={{ fontFamily: FM, fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: C.dust, marginBottom: 16 }}>
              The model
            </p>
            <h2 style={{ fontFamily: FD, fontSize: 'clamp(1.8rem,3vw,2.8rem)', fontWeight: 400,
              color: C.ivory, lineHeight: 1.05, margin: 0 }}>
              100% of profit goes to the partner you choose.
            </h2>
          </div>
          <div>
            <p style={{ fontFamily: FS, fontSize: 15, color: C.dust, lineHeight: 1.75, marginBottom: 28 }}>
              We cover roasting, packaging, and shipping from revenue. Every pound left over goes to the ministry you named at checkout. No exceptions, no discretionary fund.
            </p>
            <Link href="/shop"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '12px 24px',
                background: C.ivory, color: C.bark, textDecoration: 'none', borderRadius: 9999,
                fontFamily: FS, fontSize: 14, fontWeight: 500 }}>
              Shop the harvest <IconArrow />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
