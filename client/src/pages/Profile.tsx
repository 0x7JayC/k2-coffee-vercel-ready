import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation, Link } from "wouter";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { C, FD, FS, FM, fmt } from "@/lib/tokens";
import { K2Logo } from "@/components/Layout";

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  completed: { bg: 'rgba(74,51,36,0.08)', color: C.cocoa },
  shipped:   { bg: 'rgba(196,151,100,0.15)', color: C.mocha },
  paid:      { bg: 'rgba(43,29,20,0.08)', color: C.bark },
  pending:   { bg: 'rgba(168,143,115,0.15)', color: C.dust },
  cancelled: { bg: 'rgba(200,50,50,0.08)', color: '#8b2020' },
};

export default function Profile() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<'orders' | 'account'>('orders');

  const ordersQuery = trpc.orders.listMine.useQuery(undefined as any, { enabled: isAuthenticated });

  useEffect(() => {
    if (!isAuthenticated) setLocation('/auth');
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out');
      setLocation('/');
    } catch {
      toast.error('Failed to logout');
    }
  };

  return (
    <div style={{ background: C.linen, minHeight: '100vh', padding: '64px 40px 96px' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 48, alignItems: 'flex-start' }}>

          {/* Sidebar */}
          <div>
            <div style={{ background: C.paper, borderRadius: 20, padding: '32px 24px', marginBottom: 12 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: C.bark,
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <K2Logo size={28} color={C.crema} />
              </div>
              <div style={{ fontFamily: FD, fontSize: 22, fontWeight: 400, color: C.bark, marginBottom: 4 }}>
                {user?.name || 'Member'}
              </div>
              <div style={{ fontFamily: FM, fontSize: 11, color: C.mocha, letterSpacing: '0.1em' }}>
                {user?.email}
              </div>
              <div style={{ marginTop: 16, padding: '10px 14px', borderRadius: 10, background: C.linen,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontFamily: FM, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.dust }}>
                    Member since
                  </div>
                  <div style={{ fontFamily: FS, fontSize: 13, color: C.bark, marginTop: 2 }}>
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : '—'}
                  </div>
                </div>
                <div style={{ width: 1, height: 28, background: C.hairline }}/>
                <div>
                  <div style={{ fontFamily: FM, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.dust }}>
                    Orders
                  </div>
                  <div style={{ fontFamily: FS, fontSize: 13, color: C.bark, marginTop: 2 }}>
                    {ordersQuery.data?.length ?? '—'}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[['orders', 'Order History'], ['account', 'Account Details']] .map(([id, label]) => (
                <button key={id} onClick={() => setTab(id as 'orders' | 'account')}
                  style={{ textAlign: 'left', padding: '12px 16px', borderRadius: 12,
                    background: tab === id ? C.paper : 'transparent',
                    border: 'none', cursor: 'pointer', fontFamily: FS, fontSize: 14,
                    color: tab === id ? C.bark : C.mocha, fontWeight: tab === id ? 500 : 400,
                    transition: 'all 200ms' }}>
                  {label}
                </button>
              ))}
              <button onClick={handleLogout}
                style={{ textAlign: 'left', padding: '12px 16px', borderRadius: 12, background: 'transparent',
                  border: 'none', cursor: 'pointer', fontFamily: FS, fontSize: 14, color: C.dust, marginTop: 8 }}>
                Sign Out
              </button>
            </div>
          </div>

          {/* Content */}
          <div>
            {tab === 'orders' ? (
              <div>
                <h2 style={{ fontFamily: FD, fontSize: 32, fontWeight: 400, color: C.bark, margin: '0 0 32px' }}>
                  Order History
                </h2>
                {ordersQuery.isLoading ? (
                  <div style={{ fontFamily: FM, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.dust, padding: '40px 0' }}>
                    Loading…
                  </div>
                ) : ordersQuery.data && ordersQuery.data.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {ordersQuery.data.map(order => {
                      const st = STATUS_STYLES[order.status] || STATUS_STYLES.pending;
                      const items = (() => {
                        try { return typeof order.items === 'string' ? JSON.parse(order.items) : order.items; }
                        catch { return []; }
                      })();
                      return (
                        <div key={order.id} style={{ background: C.paper, borderRadius: 20, padding: '28px 32px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20 }}>
                            {[['Order', `#${order.id}`], ['Date', new Date(order.createdAt).toLocaleDateString('en-GB')], ['Total', fmt(order.totalAmount)]].map(([k, v]) => (
                              <div key={k}>
                                <div style={{ fontFamily: FM, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.dust, marginBottom: 4 }}>{k}</div>
                                <div style={{ fontFamily: FS, fontSize: 15, fontWeight: 600, color: C.bark }}>{v}</div>
                              </div>
                            ))}
                            <div>
                              <div style={{ fontFamily: FM, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.dust, marginBottom: 4 }}>Status</div>
                              <span style={{ fontFamily: FM, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
                                padding: '4px 10px', borderRadius: 9999, background: st.bg, color: st.color }}>
                                {order.status}
                              </span>
                            </div>
                          </div>
                          <div style={{ borderTop: `1px solid ${C.hairline}`, paddingTop: 16 }}>
                            <div style={{ fontFamily: FM, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.dust, marginBottom: 6 }}>Items</div>
                            <div style={{ fontFamily: FS, fontSize: 14, color: C.bark }}>
                              {(items as any[]).map((i: any) => `${i.name} ×${i.quantity ?? i.qty ?? 1}`).join(', ') || '—'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ background: C.paper, borderRadius: 20, padding: '48px 32px', textAlign: 'center' }}>
                    <p style={{ fontFamily: FS, fontSize: 15, color: C.mocha, marginBottom: 20 }}>
                      No orders yet. Time to start.
                    </p>
                    <Link href="/shop"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px',
                        background: C.bark, color: C.ivory, textDecoration: 'none', borderRadius: 9999,
                        fontFamily: FS, fontSize: 14, fontWeight: 500 }}>
                      Shop the harvest
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h2 style={{ fontFamily: FD, fontSize: 32, fontWeight: 400, color: C.bark, margin: '0 0 32px' }}>
                  Account Details
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  {[
                    ['Full name', user?.name || '—'],
                    ['Email', user?.email || '—'],
                    ['Role', user?.role || 'customer'],
                    ['Member since', user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : '—'],
                  ].map(([k, v]) => (
                    <div key={k} style={{ background: C.paper, borderRadius: 16, padding: '24px' }}>
                      <div style={{ fontFamily: FM, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.dust, marginBottom: 8 }}>{k}</div>
                      <div style={{ fontFamily: FS, fontSize: 16, fontWeight: 500, color: C.bark }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
