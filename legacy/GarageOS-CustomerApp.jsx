import React, { useState } from "react";
import {
  Wrench, Car, Bell, Clock, Gauge, Calendar, ChevronRight, ChevronLeft,
  CheckCircle2, AlertTriangle, MessageCircle, Phone, Home, FileText,
  User, MapPin, Plus, X, Check, ShieldCheck, Fuel, Droplet, Battery,
  Disc, Zap, Star, CreditCard, Download, ArrowRight, Sparkles, Info
} from "lucide-react";

/* ============================================================
   BRAND TOKENS — shared with GarageOS staff terminal so the
   customer app reads as the same product, not a bolt-on.
   ============================================================ */
const C = { primary: "#FF5500", secondary: "#1EA755", danger: "#E5484D", warning: "#F5A623", info: "#3B82F6" };
const T = {
  bg: "#F5F3EF", surface: "#FFFFFF", surfaceAlt: "#FBF9F5", raised: "#FFFFFF",
  border: "#E7E2D8", text: "#1B1A17", textMuted: "#6B6459", textFaint: "#A39C8E",
  primaryDim: "#FFE9DC", secondaryDim: "#DEF3E5", dangerDim: "#FBE2E3", warningDim: "#FDEFD9",
};

const fontImport = `@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');`;
const currency = (n) => "KSh " + Math.round(n).toLocaleString("en-KE");

/* ============================================================
   MOCK DATA — mirrors the same fleet seen in the staff terminal
   ============================================================ */
const business = { name: "Kamau & Sons Auto Garage", phone: "0722 900 100", location: "Enterprise Rd, Industrial Area, Nairobi" };

const vehicles = [
  {
    reg: "KDK 420X", model: "Toyota NZE", year: 2013, color: "Silver", mileage: 84200, health: 64,
    fuel: 3, lastService: "12 Jun 2026", nextServiceDate: "12 Sep 2026", nextServiceKm: 90000,
    activeJob: {
      id: "JC-1042", stage: "diagnostics", mechanic: "Peter Kamau",
      faults: "Knocking sound on front left, pulls to the right when braking.",
      startedAt: Date.now() - 42 * 60000,
      estimate: [
        { name: "Front suspension bushing replacement", price: 3500, approved: null },
        { name: "Brake pad replacement (front)", price: 1800, approved: null },
      ],
      awaitingApproval: true,
    },
    diagnostics: [
      { label: "Suspension — front left", severity: "warning", note: "Worn bushing detected, causing knocking on rough surfaces." },
      { label: "Brakes", severity: "warning", note: "Uneven pad wear, front left thinner than front right." },
      { label: "Battery", severity: "ok", note: "Holding charge normally, tested 12.6V." },
      { label: "Engine oil", severity: "ok", note: "Changed 2,600 km ago, within service interval." },
    ],
    history: [
      { date: "12 Jun 2026", desc: "Full oil service + filter change", cost: 3200, invoice: "INV-3391" },
      { date: "02 Mar 2026", desc: "Wiper blades + headlight bulb", cost: 1700, invoice: "INV-3204" },
      { date: "18 Dec 2025", desc: "Wheel alignment", cost: 2000, invoice: "INV-3012" },
    ],
  },
  {
    reg: "KCB 118Q", model: "Toyota Fielder", year: 2016, color: "White", mileage: 112400, health: 91,
    fuel: 4, lastService: "02 Jul 2026", nextServiceDate: "02 Oct 2026", nextServiceKm: 117000,
    activeJob: null,
    diagnostics: [
      { label: "Engine", severity: "ok", note: "No fault codes on last diagnostic pass." },
      { label: "Tyres", severity: "ok", note: "Tread depth even across all four, 6mm remaining." },
    ],
    history: [
      { date: "02 Jul 2026", desc: "Full oil service", cost: 1200, invoice: "INV-3450" },
      { date: "14 Apr 2026", desc: "Battery replacement & test", cost: 8900, invoice: "INV-3298" },
    ],
  },
];

const initialNotifications = [
  { id: 1, type: "job", read: false, time: "9 min ago", title: "Diagnostics in progress", body: "Peter has started diagnostics on your NZE (KDK 420X). We'll send an estimate for approval shortly." },
  { id: 2, type: "reminder", read: false, time: "Today, 07:00", title: "Service due in 19 days", body: "KDA... wait — your Fielder (KCB 118Q) is due for service by 02 Oct 2026 or 117,000 km." },
  { id: 3, type: "promo", read: true, time: "Yesterday", title: "20% off wiper blades this week", body: "Walk in or mention this offer when you book your next visit." },
  { id: 4, type: "invoice", read: true, time: "2 Jul 2026", title: "Invoice ready — INV-3450", body: "Your full oil service is complete. Receipt is ready to download." },
];

const stages = [
  { key: "diagnostics", label: "Diagnostics", icon: Gauge },
  { key: "active", label: "Repair in progress", icon: Wrench },
  { key: "parts", label: "Awaiting parts", icon: Clock },
  { key: "done", label: "Ready for pickup", icon: CheckCircle2 },
];

const severityColor = { ok: C.secondary, warning: C.warning, danger: C.danger };
const severityIcon = { ok: ShieldCheck, warning: AlertTriangle, danger: AlertTriangle };

/* ============================================================
   SHARED UI
   ============================================================ */
function Frame({ children }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", background: "#0B0D10", padding: "20px 0", minHeight: 780 }}>
      <style>{fontImport}</style>
      <div style={{
        width: 390, minHeight: 740, background: T.bg, color: T.text, borderRadius: 34,
        overflow: "hidden", boxShadow: "0 30px 70px rgba(0,0,0,0.5)", position: "relative",
        fontFamily: "'Inter', sans-serif", border: "8px solid #14161A", display: "flex", flexDirection: "column"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 22px 4px", fontSize: 12, fontWeight: 600, color: T.text }}>
          <span>9:41</span>
          <span style={{ display: "flex", gap: 5, alignItems: "center" }}>
            <span style={{ width: 16, height: 10, border: `1.4px solid ${T.text}`, borderRadius: 2, position: "relative" }}>
              <span style={{ position: "absolute", inset: 1.5, right: 4, background: T.text, borderRadius: 1 }} />
            </span>
          </span>
        </div>
        <div style={{ flex: 1, overflowY: "auto", paddingBottom: 78 }}>{children}</div>
      </div>
    </div>
  );
}

function TopHeader({ title, subtitle, onBack }) {
  return (
    <div style={{ padding: "6px 20px 14px", display: "flex", alignItems: "center", gap: 10 }}>
      {onBack && (
        <button onClick={onBack} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <ChevronLeft size={16} />
        </button>
      )}
      <div>
        <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 19, fontWeight: 600, letterSpacing: 0.2 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: T.textMuted, marginTop: 1 }}>{subtitle}</div>}
      </div>
    </div>
  );
}

function Card({ children, style }) {
  return <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 16, ...style }}>{children}</div>;
}

function Pill({ children, color = C.primary, dim }) {
  return <span style={{ fontSize: 10.5, fontWeight: 700, padding: "4px 9px", borderRadius: 20, background: dim || (color + "20"), color, letterSpacing: 0.2 }}>{children}</span>;
}

function BottomNav({ tab, setTab, alertCount }) {
  const items = [
    { key: "home", label: "Home", icon: Home },
    { key: "diagnostics", label: "Vehicle", icon: Gauge },
    { key: "book", label: "Book", icon: Calendar },
    { key: "alerts", label: "Alerts", icon: Bell },
    { key: "profile", label: "Profile", icon: User },
  ];
  return (
    <div style={{
      position: "absolute", left: 0, right: 0, bottom: 0, background: T.surface,
      borderTop: `1px solid ${T.border}`, display: "flex", padding: "9px 6px 14px", zIndex: 10
    }}>
      {items.map(({ key, label, icon: Icon }) => (
        <button key={key} onClick={() => setTab(key)} style={{
          flex: 1, background: "none", border: "none", cursor: "pointer", display: "flex",
          flexDirection: "column", alignItems: "center", gap: 3, color: tab === key ? C.primary : T.textFaint,
          position: "relative"
        }}>
          <Icon size={19} strokeWidth={tab === key ? 2.4 : 2} />
          <span style={{ fontSize: 9.5, fontWeight: tab === key ? 700 : 500 }}>{label}</span>
          {key === "alerts" && alertCount > 0 && (
            <span style={{ position: "absolute", top: -3, right: "28%", width: 7, height: 7, borderRadius: "50%", background: C.danger }} />
          )}
        </button>
      ))}
    </div>
  );
}

function elapsed(ts) {
  const m = Math.floor((Date.now() - ts) / 60000);
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${m % 60}m`;
}

/* ============================================================
   HEALTH RING — signature element: one glance vehicle status
   ============================================================ */
function HealthRing({ value, size = 84 }) {
  const r = (size - 10) / 2, circ = 2 * Math.PI * r;
  const color = value >= 80 ? C.secondary : value >= 55 ? C.warning : C.danger;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.border} strokeWidth={8} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={circ} strokeDashoffset={circ - (value / 100) * circ} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700 }}>{value}%</div>
        <div style={{ fontSize: 8, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.3 }}>Health</div>
      </div>
    </div>
  );
}

/* ============================================================
   HOME
   ============================================================ */
function ScreenHome({ vehicle, vehicles, activeIdx, setActiveIdx, setTab, notifications }) {
  const unread = notifications.filter(n => !n.read).length;
  const daysLeft = 19; // demo-fixed to match mock "today"
  const job = vehicle.activeJob;

  return (
    <div>
      <div style={{ padding: "6px 20px 4px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 12, color: T.textMuted }}>Good afternoon,</div>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 21, fontWeight: 600 }}>James Mutiso</div>
        </div>
        <button onClick={() => setTab("alerts")} style={{ position: "relative", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <Bell size={16} />
          {unread > 0 && <span style={{ position: "absolute", top: -3, right: -3, background: C.danger, color: "#fff", fontSize: 9, fontWeight: 700, borderRadius: 8, minWidth: 15, height: 15, display: "flex", alignItems: "center", justifyContent: "center" }}>{unread}</span>}
        </button>
      </div>

      {/* Vehicle chips */}
      <div style={{ display: "flex", gap: 8, padding: "16px 20px 4px", overflowX: "auto" }}>
        {vehicles.map((v, i) => (
          <button key={v.reg} onClick={() => setActiveIdx(i)} style={{
            flexShrink: 0, display: "flex", alignItems: "center", gap: 6, padding: "8px 13px", borderRadius: 22,
            border: `1px solid ${i === activeIdx ? C.primary : T.border}`, background: i === activeIdx ? T.primaryDim : T.surface,
            color: i === activeIdx ? C.primary : T.text, fontSize: 12, fontWeight: 700, cursor: "pointer",
            fontFamily: "'JetBrains Mono', monospace"
          }}>
            <Car size={13} /> {v.reg}
          </button>
        ))}
        <button style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 5, padding: "8px 13px", borderRadius: 22, border: `1px dashed ${T.textFaint}`, background: "transparent", color: T.textMuted, fontSize: 11.5, cursor: "pointer" }}>
          <Plus size={12} /> Add vehicle
        </button>
      </div>

      <div style={{ padding: "14px 20px 0" }}>
        {/* Primary vehicle card */}
        <Card style={{ background: `linear-gradient(135deg, ${T.surface}, ${T.surfaceAlt})` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 17, fontWeight: 700, color: C.primary }}>{vehicle.reg}</div>
              <div style={{ fontSize: 12.5, color: T.textMuted, marginTop: 1 }}>{vehicle.model} · {vehicle.year} · {vehicle.color}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: T.textMuted, marginTop: 8 }}>
                <Gauge size={12} /> {vehicle.mileage.toLocaleString()} km
              </div>
            </div>
            <HealthRing value={vehicle.health} />
          </div>
        </Card>

        {/* Active job banner */}
        {job && (
          <Card style={{ marginTop: 12, borderColor: C.primary + "55" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <Wrench size={14} color={C.primary} />
                <span style={{ fontSize: 13, fontWeight: 700 }}>Your car is in the workshop</span>
              </div>
              <Pill>{elapsed(job.startedAt)}</Pill>
            </div>
            <StageTracker current={job.stage} />
            <div style={{ fontSize: 11.5, color: T.textMuted, marginTop: 10 }}>Assigned mechanic: <b style={{ color: T.text }}>{job.mechanic}</b></div>
            {job.awaitingApproval && (
              <div style={{ marginTop: 10, background: T.warningDim, borderRadius: 10, padding: "9px 11px", display: "flex", alignItems: "center", gap: 8 }}>
                <AlertTriangle size={14} color={C.warning} />
                <span style={{ fontSize: 11.5, flex: 1 }}>Estimate ready — needs your approval</span>
                <button onClick={() => setTab("diagnostics")} style={{ background: C.warning, border: "none", borderRadius: 7, padding: "5px 9px", fontSize: 11, fontWeight: 700, cursor: "pointer", color: "#1A0A00" }}>Review</button>
              </div>
            )}
          </Card>
        )}

        {/* Service due */}
        <Card style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: T.warningDim, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Calendar size={16} color={C.warning} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600 }}>Next service due {vehicle.nextServiceDate}</div>
            <div style={{ fontSize: 11, color: T.textMuted }}>or at {vehicle.nextServiceKm.toLocaleString()} km — whichever comes first</div>
          </div>
          <ChevronRight size={15} color={T.textFaint} />
        </Card>

        {/* Quick actions */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
          <QuickAction icon={Calendar} label="Book a service" onClick={() => setTab("book")} />
          <QuickAction icon={FileText} label="Invoices & history" onClick={() => setTab("diagnostics")} />
          <QuickAction icon={MessageCircle} label="Message garage" color={C.secondary} onClick={() => setTab("profile")} />
          <QuickAction icon={Phone} label="Call garage" color={C.secondary} onClick={() => setTab("profile")} />
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, label, onClick, color = C.primary }) {
  return (
    <button onClick={onClick} style={{
      background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: "13px 12px",
      display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start", cursor: "pointer", textAlign: "left"
    }}>
      <Icon size={16} color={color} />
      <span style={{ fontSize: 11.5, fontWeight: 600, color: T.text }}>{label}</span>
    </button>
  );
}

function StageTracker({ current }) {
  const idx = stages.findIndex(s => s.key === current);
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {stages.map((s, i) => {
        const Icon = s.icon;
        const done = i < idx, active = i === idx;
        const color = done ? C.secondary : active ? C.primary : T.textFaint;
        return (
          <React.Fragment key={s.key}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, width: 54 }}>
              <div style={{
                width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                background: done ? C.secondary + "20" : active ? C.primary + "20" : T.surfaceAlt,
                border: `1.5px solid ${color}`
              }}>
                {done ? <Check size={12} color={color} /> : <Icon size={12} color={color} />}
              </div>
              <span style={{ fontSize: 8.5, textAlign: "center", color, fontWeight: active ? 700 : 500, lineHeight: 1.15 }}>{s.label}</span>
            </div>
            {i < stages.length - 1 && <div style={{ flex: 1, height: 2, background: i < idx ? C.secondary : T.border, marginBottom: 14 }} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ============================================================
   DIAGNOSTICS / VEHICLE DETAIL
   ============================================================ */
function ScreenDiagnostics({ vehicle, setVehicles, activeIdx }) {
  const [tab, setTab] = useState("diagnostics");
  const job = vehicle.activeJob;

  const respond = (lineIdx, approved) => {
    setVehicles(prev => prev.map((v, i) => {
      if (i !== activeIdx || !v.activeJob) return v;
      const estimate = v.activeJob.estimate.map((l, li) => li === lineIdx ? { ...l, approved } : l);
      return { ...v, activeJob: { ...v.activeJob, estimate } };
    }));
  };

  return (
    <div>
      <TopHeader title={vehicle.model} subtitle={`${vehicle.reg} · ${vehicle.mileage.toLocaleString()} km`} />
      <div style={{ padding: "0 20px" }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 14, background: T.surfaceAlt, padding: 4, borderRadius: 12 }}>
          {["diagnostics", "estimate", "history"].map(t => (
            <button key={t} onClick={() => setTab(t)} disabled={t === "estimate" && !job}
              style={{
                flex: 1, padding: "8px 0", borderRadius: 9, border: "none", cursor: t === "estimate" && !job ? "not-allowed" : "pointer",
                background: tab === t ? T.surface : "transparent", color: tab === t ? T.text : T.textMuted,
                fontSize: 11.5, fontWeight: 700, textTransform: "capitalize", opacity: t === "estimate" && !job ? 0.4 : 1,
                boxShadow: tab === t ? "0 1px 3px rgba(0,0,0,0.08)" : "none"
              }}>{t}</button>
          ))}
        </div>

        {tab === "diagnostics" && (
          <div>
            {job && (
              <Card style={{ marginBottom: 12, background: T.primaryDim, border: "none" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.primary, marginBottom: 4 }}>REPORTED FAULT</div>
                <div style={{ fontSize: 12.5, color: T.text }}>{job.faults}</div>
              </Card>
            )}
            {vehicle.diagnostics.map((d, i) => {
              const Icon = severityIcon[d.severity];
              return (
                <Card key={i} style={{ marginBottom: 10, display: "flex", gap: 11, alignItems: "flex-start" }}>
                  <div style={{ width: 30, height: 30, borderRadius: 9, background: severityColor[d.severity] + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={14} color={severityColor[d.severity]} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 700 }}>{d.label}</div>
                    <div style={{ fontSize: 11.5, color: T.textMuted, marginTop: 2 }}>{d.note}</div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {tab === "estimate" && job && (
          <div>
            <div style={{ fontSize: 11.5, color: T.textMuted, marginBottom: 10 }}>Approve or decline each line before we proceed with the work. Declined items won't be charged or actioned.</div>
            {job.estimate.map((l, i) => (
              <Card key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600, maxWidth: 210 }}>{l.name}</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700 }}>{currency(l.price)}</span>
                </div>
                {l.approved === null ? (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => respond(i, true)} style={{ flex: 1, background: C.secondary, border: "none", borderRadius: 8, padding: "8px 0", fontSize: 12, fontWeight: 700, color: "#04170B", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}><Check size={13} /> Approve</button>
                    <button onClick={() => respond(i, false)} style={{ flex: 1, background: "transparent", border: `1px solid ${C.danger}`, borderRadius: 8, padding: "8px 0", fontSize: 12, fontWeight: 700, color: C.danger, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}><X size={13} /> Decline</button>
                  </div>
                ) : (
                  <Pill color={l.approved ? C.secondary : C.danger}>{l.approved ? "Approved" : "Declined"}</Pill>
                )}
              </Card>
            ))}
            <Row2 label="Estimate total" value={currency(job.estimate.filter(l => l.approved !== false).reduce((s, l) => s + l.price, 0))} />
          </div>
        )}

        {tab === "history" && (
          <div>
            {vehicle.history.map((h, i) => (
              <Card key={i} style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 600 }}>{h.desc}</div>
                  <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{h.date} · {h.invoice}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, fontWeight: 700 }}>{currency(h.cost)}</div>
                  <button style={{ background: "none", border: "none", color: C.primary, fontSize: 10.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 3, marginTop: 2 }}><Download size={10} /> Receipt</button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Row2({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 4px", borderTop: `1px solid ${T.border}`, marginTop: 6 }}>
      <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700, color: C.primary }}>{value}</span>
    </div>
  );
}

/* ============================================================
   BOOK APPOINTMENT
   ============================================================ */
function ScreenBook({ vehicles, defaultIdx }) {
  const [vehIdx, setVehIdx] = useState(defaultIdx);
  const [date, setDate] = useState("");
  const [issue, setIssue] = useState("");
  const [slot, setSlot] = useState("");
  const [sent, setSent] = useState(false);
  const slots = ["8:00 AM", "10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM"];

  if (sent) {
    return (
      <div style={{ padding: "60px 30px", textAlign: "center" }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: T.secondaryDim, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <CheckCircle2 size={28} color={C.secondary} />
        </div>
        <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Booking request sent</div>
        <div style={{ fontSize: 12.5, color: T.textMuted, lineHeight: 1.5 }}>{business.name} will confirm your {slot} slot on {date || "your chosen date"} shortly. You'll get a notification once confirmed.</div>
        <button onClick={() => setSent(false)} style={{ marginTop: 22, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 9, padding: "9px 18px", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>Book another</button>
      </div>
    );
  }

  return (
    <div>
      <TopHeader title="Book a service" subtitle="Request an appointment — we'll confirm by notification" />
      <div style={{ padding: "0 20px" }}>
        <FieldLabel>Vehicle</FieldLabel>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {vehicles.map((v, i) => (
            <button key={v.reg} onClick={() => setVehIdx(i)} style={{
              flex: 1, padding: "10px 8px", borderRadius: 10, border: `1px solid ${vehIdx === i ? C.primary : T.border}`,
              background: vehIdx === i ? T.primaryDim : T.surface, color: vehIdx === i ? C.primary : T.text,
              fontSize: 11.5, fontWeight: 700, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace"
            }}>{v.reg}</button>
          ))}
        </div>

        <FieldLabel>Preferred date</FieldLabel>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />

        <FieldLabel style={{ marginTop: 14 }}>Preferred time slot</FieldLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 4 }}>
          {slots.map(s => (
            <button key={s} onClick={() => setSlot(s)} style={{
              padding: "7px 12px", borderRadius: 20, border: `1px solid ${slot === s ? C.primary : T.border}`,
              background: slot === s ? T.primaryDim : T.surface, color: slot === s ? C.primary : T.textMuted,
              fontSize: 11.5, fontWeight: 600, cursor: "pointer"
            }}>{s}</button>
          ))}
        </div>

        <FieldLabel style={{ marginTop: 14 }}>What's the issue? (optional)</FieldLabel>
        <textarea value={issue} onChange={e => setIssue(e.target.value)} placeholder="e.g. Routine service, or describe a noise / warning light…"
          style={{ ...inputStyle, minHeight: 80, resize: "vertical", fontFamily: "'Inter', sans-serif" }} />

        <button onClick={() => setSent(true)} disabled={!date || !slot} style={{
          width: "100%", marginTop: 18, background: (!date || !slot) ? T.textFaint : C.primary, border: "none", borderRadius: 11,
          padding: "13px 0", fontSize: 13.5, fontWeight: 700, color: "#1A0A00", cursor: (!date || !slot) ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 7
        }}>Request appointment <ArrowRight size={14} /></button>
      </div>
    </div>
  );
}
function FieldLabel({ children, style }) {
  return <div style={{ fontSize: 10.5, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 7, ...style }}>{children}</div>;
}
const inputStyle = { width: "100%", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 9, padding: "10px 12px", color: T.text, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "'Inter', sans-serif" };

/* ============================================================
   ALERTS / NOTIFICATIONS
   ============================================================ */
const notifIcon = { job: Wrench, reminder: Calendar, promo: Sparkles, invoice: FileText };
const notifColor = { job: C.primary, reminder: C.warning, promo: C.secondary, invoice: C.info };

function ScreenAlerts({ notifications, setNotifications }) {
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  return (
    <div>
      <TopHeader title="Alerts" subtitle={`${notifications.filter(n => !n.read).length} unread`} />
      <div style={{ padding: "0 20px 6px", display: "flex", justifyContent: "flex-end" }}>
        <button onClick={markAllRead} style={{ background: "none", border: "none", color: C.primary, fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}>Mark all read</button>
      </div>
      <div style={{ padding: "0 20px" }}>
        {notifications.map(n => {
          const Icon = notifIcon[n.type];
          return (
            <Card key={n.id} style={{ marginBottom: 10, display: "flex", gap: 11, alignItems: "flex-start", opacity: n.read ? 0.65 : 1 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: notifColor[n.type] + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={15} color={notifColor[n.type]} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700 }}>{n.title}</span>
                  {!n.read && <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.danger, marginTop: 4, flexShrink: 0 }} />}
                </div>
                <div style={{ fontSize: 11.5, color: T.textMuted, marginTop: 2, lineHeight: 1.4 }}>{n.body}</div>
                <div style={{ fontSize: 10, color: T.textFaint, marginTop: 4 }}>{n.time}</div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   PROFILE
   ============================================================ */
function ScreenProfile({ vehicles }) {
  return (
    <div>
      <TopHeader title="Profile" />
      <div style={{ padding: "0 20px" }}>
        <Card style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div style={{ width: 46, height: 46, borderRadius: "50%", background: T.primaryDim, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: C.primary, fontSize: 15 }}>JM</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>James Mutiso</div>
            <div style={{ fontSize: 11.5, color: T.textMuted }}>0722 100 220</div>
          </div>
        </Card>

        <Card style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 12 }}>
          <Star size={18} color={C.warning} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700 }}>1,240 loyalty points</div>
            <div style={{ fontSize: 11, color: T.textMuted }}>260 points to your next free oil top-up</div>
          </div>
        </Card>

        <FieldLabel>My vehicles</FieldLabel>
        {vehicles.map(v => (
          <Card key={v.reg} style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, fontWeight: 700 }}>{v.reg}</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>{v.model}</div>
            </div>
            <ChevronRight size={14} color={T.textFaint} />
          </Card>
        ))}

        <FieldLabel style={{ marginTop: 16 }}>Garage</FieldLabel>
        <Card style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>{business.name}</div>
          <div style={{ fontSize: 11.5, color: T.textMuted, display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}><MapPin size={11} /> {business.location}</div>
          <div style={{ fontSize: 11.5, color: T.textMuted, display: "flex", alignItems: "center", gap: 5 }}><Phone size={11} /> {business.phone}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button style={{ flex: 1, background: C.primary, border: "none", borderRadius: 8, padding: "9px 0", fontSize: 12, fontWeight: 700, color: "#1A0A00", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}><Phone size={12} /> Call</button>
            <button style={{ flex: 1, background: T.secondaryDim, border: "none", borderRadius: 8, padding: "9px 0", fontSize: 12, fontWeight: 700, color: C.secondary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}><MessageCircle size={12} /> Message</button>
          </div>
        </Card>

        <FieldLabel style={{ marginTop: 16 }}>Payment methods</FieldLabel>
        <Card style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
          <CreditCard size={16} color={T.textMuted} />
          <div style={{ fontSize: 12, flex: 1 }}>M-Pesa · 0722 xxx 220</div>
          <Pill color={C.secondary}>Default</Pill>
        </Card>
      </div>
    </div>
  );
}

/* ============================================================
   ROOT
   ============================================================ */
export default function GarageCustomerApp() {
  const [tab, setTab] = useState("home");
  const [activeIdx, setActiveIdx] = useState(0);
  const [vehicleState, setVehicleState] = useState(vehicles);
  const [notifications, setNotifications] = useState(initialNotifications);

  const vehicle = vehicleState[activeIdx];
  const unread = notifications.filter(n => !n.read).length;

  let body;
  if (tab === "home") body = <ScreenHome vehicle={vehicle} vehicles={vehicleState} activeIdx={activeIdx} setActiveIdx={setActiveIdx} setTab={setTab} notifications={notifications} />;
  else if (tab === "diagnostics") body = <ScreenDiagnostics vehicle={vehicle} setVehicles={setVehicleState} activeIdx={activeIdx} />;
  else if (tab === "book") body = <ScreenBook vehicles={vehicleState} defaultIdx={activeIdx} />;
  else if (tab === "alerts") body = <ScreenAlerts notifications={notifications} setNotifications={setNotifications} />;
  else if (tab === "profile") body = <ScreenProfile vehicles={vehicleState} />;

  return (
    <Frame>
      {body}
      <BottomNav tab={tab} setTab={setTab} alertCount={unread} />
    </Frame>
  );
}
