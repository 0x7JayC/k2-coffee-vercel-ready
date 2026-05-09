import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { C, FD, FS, FM } from "@/lib/tokens";
import { useIsMobile } from "@/hooks/useMobile";
import { Link } from "wouter";

function IconArrow({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14"/><path d="m13 5 7 7-7 7"/>
    </svg>
  );
}

export default function Contact() {
  const isMobile = useIsMobile();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const sendMutation = trpc.contact.send.useMutation({
    onSuccess: () => setSent(true),
    onError: (err) => toast.error(err.message || "Something went wrong. Please try again."),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMutation.mutate({
      name,
      email,
      orderNumber: orderNumber || undefined,
      message,
    });
  };

  const pad = isMobile ? 20 : 40;

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 16px", borderRadius: 12,
    border: `1px solid ${C.hairline}`, background: C.linen,
    fontFamily: FS, fontSize: 14, color: C.bark, outline: "none",
    boxSizing: "border-box", transition: "border-color 200ms",
  };
  const labelStyle: React.CSSProperties = {
    fontFamily: FM, fontSize: 10, letterSpacing: "0.18em",
    textTransform: "uppercase", color: C.mocha, display: "block", marginBottom: 6,
  };

  if (sent) {
    return (
      <div style={{ background: C.linen, minHeight: "80vh", display: "flex",
        flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: `40px ${pad}px` }}>
        <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: C.paper,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 24px", fontSize: 24 }}>
            ✓
          </div>
          <h1 style={{ fontFamily: FD, fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 400,
            color: C.bark, margin: "0 0 12px", letterSpacing: "-0.02em" }}>
            Message sent.
          </h1>
          <p style={{ fontFamily: FS, fontSize: 15, color: C.mocha, lineHeight: 1.7, marginBottom: 32 }}>
            We'll get back to you as soon as we can.
          </p>
          <Link href="/shop"
            style={{ display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 24px", background: C.bark, color: C.ivory,
              textDecoration: "none", borderRadius: 9999, fontFamily: FS, fontSize: 14, fontWeight: 500 }}>
            Back to shop <IconArrow />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: C.linen, minHeight: "100vh",
      padding: `${isMobile ? 48 : 80}px ${pad}px ${isMobile ? 64 : 96}px` }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>

        <div style={{ marginBottom: isMobile ? 36 : 48 }}>
          <p style={{ fontFamily: FM, fontSize: 11, letterSpacing: "0.22em",
            textTransform: "uppercase", color: C.mocha, marginBottom: 12 }}>
            Get in touch
          </p>
          <h1 style={{ fontFamily: FD, fontSize: "clamp(2rem,5vw,3.5rem)", fontWeight: 400,
            letterSpacing: "-0.025em", color: C.bark, lineHeight: 0.98, margin: "0 0 16px" }}>
            We're here to help.
          </h1>
          <p style={{ fontFamily: FS, fontSize: 15, color: C.mocha, lineHeight: 1.7, maxWidth: "50ch" }}>
            Order issues, questions about your delivery, or anything else — send us a message and we'll respond as soon as we can.
          </p>
        </div>

        <form onSubmit={handleSubmit}
          style={{ background: C.ivory, borderRadius: 20,
            padding: isMobile ? "24px 20px" : "40px 40px",
            display: "flex", flexDirection: "column", gap: 20 }}>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
            <div>
              <label style={labelStyle}>Your name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Jane Smith"
                required
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = C.crema)}
                onBlur={e => (e.target.style.borderColor = C.hairline)}
              />
            </div>
            <div>
              <label style={labelStyle}>Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = C.crema)}
                onBlur={e => (e.target.style.borderColor = C.hairline)}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Order number <span style={{ color: C.dust, textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
            <input
              type="text"
              value={orderNumber}
              onChange={e => setOrderNumber(e.target.value)}
              placeholder="e.g. 1042"
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = C.crema)}
              onBlur={e => (e.target.style.borderColor = C.hairline)}
            />
          </div>

          <div>
            <label style={labelStyle}>Message</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Tell us what's going on…"
              required
              rows={5}
              style={{ ...inputStyle, resize: "vertical", minHeight: 120 }}
              onFocus={e => (e.target.style.borderColor = C.crema)}
              onBlur={e => (e.target.style.borderColor = C.hairline)}
            />
          </div>

          <button
            type="submit"
            disabled={sendMutation.isPending}
            style={{
              padding: "14px", background: C.bark, color: C.ivory, border: "none",
              borderRadius: 9999, fontFamily: FS, fontSize: 14, fontWeight: 500,
              cursor: sendMutation.isPending ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              opacity: sendMutation.isPending ? 0.7 : 1, transition: "opacity 200ms",
            }}>
            {sendMutation.isPending ? "Sending…" : "Send message"}
            {!sendMutation.isPending && <IconArrow />}
          </button>
        </form>
      </div>
    </div>
  );
}
