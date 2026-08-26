import React, { useState, useEffect, useRef } from "react";
import {
  Wrench, Package, Users, ShoppingCart, LayoutGrid, Receipt,
  BarChart3, Car, Phone, Search, Plus, Trash2, X, Check,
  ScanLine, Banknote, Smartphone, Printer, ChevronRight,
  AlertTriangle, Clock, Fuel, Gauge, Power, Bell,
  ArrowLeft, TrendingUp, DollarSign, Boxes, UserCog, Settings,
  Sun, Moon, CalendarClock, History as HistoryIcon
} from "lucide-react";

/* ============================================================
   THEME — static brand accents (unchanged across themes) +
   dynamic surface/text tokens delivered via CSS custom
   properties so a Settings toggle can switch light/dark.
   ============================================================ */
const C = { primary: "#FF5500", secondary: "#1EA755", danger: "#E5484D", warning: "#F5A623" };

const darkVars = {
  bg: "#0B0D10", surface: "#14171C", surfaceAlt: "#1B1F26", raised: "#20252D",
  border: "#2A3038", borderStrong: "#363D47", text: "#EDEFF2",
  textMuted: "#8C97A3", textFaint: "#5C6570", primaryDim: "#7A3216", secondaryDim: "#134F2C",
};
const lightVars = {
  bg: "#F3F4F6", surface: "#FFFFFF", surfaceAlt: "#F6F7F9", raised: "#FFFFFF",
  border: "#E1E4E9", borderStrong: "#C9CFD8", text: "#1A1D21",
  textMuted: "#5B6470", textFaint: "#94A0AC", primaryDim: "#FFE4D2", secondaryDim: "#D8F3E2",
};
function cssVars(theme) {
  const v = theme === "light" ? lightVars : darkVars;
  return {
    "--bg": v.bg, "--surface": v.surface, "--surfaceAlt": v.surfaceAlt, "--raised": v.raised,
    "--border": v.border, "--borderStrong": v.borderStrong, "--text": v.text,
    "--textMuted": v.textMuted, "--textFaint": v.textFaint,
    "--primaryDim": v.primaryDim, "--secondaryDim": v.secondaryDim,
  };
}

const fontImport = `
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap');
`;

const currency = (n) => "KSh " + Math.round(n).toLocaleString("en-KE");

/* ============================================================
   MOCK DATA
   ============================================================ */
const SYSTEM_ROLES = ["System Administrator", "Storekeeper", "Service Advisor", "Lead Mechanic", "Terminal Cashier"];

const initialEmployees = [
  { id: "EMP-001", name: "Brian Otieno", role: "System Administrator", phone: "0722 445 981", pin: "4471", status: "Active", lastLogin: "Today, 07:42" },
  { id: "EMP-002", name: "Faith Wanjiru", role: "Storekeeper", phone: "0711 223 004", pin: "2210", status: "Active", lastLogin: "Today, 07:15" },
  { id: "EMP-003", name: "Dennis Mwangi", role: "Service Advisor", phone: "0700 998 231", pin: "8842", status: "Active", lastLogin: "Yesterday, 17:03" },
  { id: "EMP-004", name: "Peter Kamau", role: "Lead Mechanic", phone: "0733 120 774", pin: "1190", status: "Active", lastLogin: "Today, 08:02" },
  { id: "EMP-005", name: "Grace Achieng", role: "Lead Mechanic", phone: "0745 662 310", pin: "5502", status: "Suspended", lastLogin: "3 days ago" },
  { id: "EMP-006", name: "Samuel Njoroge", role: "Terminal Cashier", phone: "0710 887 442", pin: "3390", status: "Active", lastLogin: "Today, 08:20" },
];

const initialInventory = [
  { sku: "BRK-2201", name: "Brake Pads - Front Set", fits: "Toyota NZE, Toyota Fielder", cost: 1800, price: 2800, qty: 24, low: 5, added: "20 Aug" },
  { sku: "OIL-5540", name: "Engine Oil 20W-50 (4L)", fits: "Universal", cost: 1450, price: 2100, qty: 41, low: 10, added: "18 Aug" },
  { sku: "FLT-1002", name: "Oil Filter - Standard", fits: "Toyota, Isuzu", cost: 250, price: 450, qty: 63, low: 15, added: "18 Aug" },
  { sku: "SUS-7734", name: "Suspension Bushing Kit", fits: "Isuzu NPR", cost: 2200, price: 3500, qty: 8, low: 4, added: "12 Aug" },
  { sku: "BAT-9010", name: "Car Battery 12V 65Ah", fits: "Universal", cost: 6200, price: 8900, qty: 6, low: 3, added: "10 Aug" },
  { sku: "WPR-3321", name: "Wiper Blades (Pair)", fits: "Universal", cost: 600, price: 1100, qty: 30, low: 8, added: "22 Aug" },
  { sku: "FLT-2210", name: "Air Filter - Standard", fits: "Toyota NZE, Probox", cost: 380, price: 700, qty: 3, low: 6, added: "14 Aug" },
  { sku: "ELE-6650", name: "Headlight Bulb H4", fits: "Universal", cost: 320, price: 600, qty: 22, low: 8, added: "21 Aug" },
];

const laborCatalog = [
  { code: "LBR-01", name: "Suspension Bushing Replacement", price: 3500 },
  { code: "LBR-02", name: "Brake Pad Replacement (Front)", price: 1800 },
  { code: "LBR-03", name: "Full Oil Service", price: 1200 },
  { code: "LBR-04", name: "Battery Replacement & Test", price: 800 },
  { code: "LBR-05", name: "Wheel Alignment", price: 2000 },
  { code: "LBR-06", name: "General Diagnostics", price: 1500 },
];

const initialJobCards = [
  { id: "JC-1042", reg: "KDK 420X", customer: "James Mutiso", phone: "0722 100 220", mechanic: "Peter Kamau", stage: "diagnostics", startedAt: Date.now() - 12 * 60000, faults: "Knocking sound on front left, pulls to the right when braking.", lines: [] },
  { id: "JC-1043", reg: "KCB 118Q", customer: "Angela Njeri", phone: "0733 400 991", mechanic: "Peter Kamau", stage: "active", startedAt: Date.now() - 54 * 60000, faults: "Overheating after 20 min drive.", lines: [{ type: "labor", name: "General Diagnostics", price: 1500 }] },
  { id: "JC-1044", reg: "KDA 902L", customer: "Moses Kiptoo", phone: "0700 552 810", mechanic: "Grace Achieng", stage: "parts", startedAt: Date.now() - 130 * 60000, faults: "Battery not holding charge overnight.", lines: [{ type: "labor", name: "Battery Replacement & Test", price: 800 }] },
  { id: "JC-1041", reg: "KBZ 220H", customer: "Lucy Wambui", phone: "0711 900 442", mechanic: "Peter Kamau", stage: "done", startedAt: Date.now() - 240 * 60000, faults: "Routine service.", lines: [{ type: "labor", name: "Full Oil Service", price: 1200 }] },
];

const initialCustomers = [
  { reg: "KDK 420X", customer: "James Mutiso", phone: "0722 100 220", model: "Toyota NZE", mileage: 84200, lastService: "12 Jun 2026", nextServiceKm: 90000, nextServiceDate: "12 Sep 2026" },
  { reg: "KCB 118Q", customer: "Angela Njeri", phone: "0733 400 991", model: "Toyota Fielder", mileage: 112400, lastService: "02 Jul 2026", nextServiceKm: 117000, nextServiceDate: "02 Oct 2026" },
  { reg: "KDA 902L", customer: "Moses Kiptoo", phone: "0700 552 810", model: "Isuzu NPR", mileage: 58900, lastService: "30 Jun 2026", nextServiceKm: 63000, nextServiceDate: "30 Aug 2026" },
  { reg: "KBZ 220H", customer: "Lucy Wambui", phone: "0711 900 442", model: "Probox", mileage: 143200, lastService: "18 May 2026", nextServiceKm: 148000, nextServiceDate: "18 Aug 2026" },
];

const productCategories = ["Fast Moving Parts", "Engine Oils", "Filters", "Brake Pads", "Electrical Components"];
const productsByCategory = {
  "Fast Moving Parts": ["WPR-3321", "FLT-1002", "ELE-6650"],
  "Engine Oils": ["OIL-5540"],
  "Filters": ["FLT-1002", "FLT-2210"],
  "Brake Pads": ["BRK-2201"],
  "Electrical Components": ["BAT-9010", "ELE-6650"],
};

/* ============================================================
   SMALL SHARED UI
   ============================================================ */
function Shell({ theme, children }) {
  return (
    <div style={{
      ...cssVars(theme),
      fontFamily: "'Inter', sans-serif", background: "var(--bg)", color: "var(--text)",
      minHeight: 700, width: "100%", borderRadius: 10, overflow: "hidden",
      border: "1px solid var(--border)", position: "relative"
    }}>
      <style>{fontImport}</style>
      {children}
    </div>
  );
}

function TopBar({ title, user, onLogout, right, notifications = [] }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 22px", borderBottom: "1px solid var(--border)", background: "var(--surface)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 6, background: C.primary,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <Wrench size={16} color="#0B0D10" />
        </div>
        <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 18, letterSpacing: 0.5, fontWeight: 600 }}>
          {title}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {right}
        <div style={{ position: "relative" }}>
          <button onClick={() => setOpen(!open)} style={{
            background: "none", border: "1px solid var(--border)", borderRadius: 7, color: "var(--textMuted)",
            padding: "6px 8px", cursor: "pointer", position: "relative", display: "flex"
          }}>
            <Bell size={14} />
            {notifications.length > 0 && (
              <span style={{
                position: "absolute", top: -4, right: -4, background: C.danger, color: "#fff",
                borderRadius: 8, fontSize: 9, minWidth: 14, height: 14, display: "flex",
                alignItems: "center", justifyContent: "center", fontWeight: 700
              }}>{notifications.length}</span>
            )}
          </button>
          {open && (
            <div style={{
              position: "absolute", right: 0, top: 34, width: 280, background: "var(--raised)",
              border: "1px solid var(--border)", borderRadius: 8, zIndex: 20, padding: 6,
              boxShadow: "0 8px 20px rgba(0,0,0,0.35)"
            }}>
              <div style={{ fontSize: 11, color: "var(--textMuted)", padding: "6px 8px", textTransform: "uppercase", letterSpacing: 0.4 }}>Alerts</div>
              {notifications.length === 0 && <div style={{ padding: 12, fontSize: 12, color: "var(--textFaint)" }}>All clear — nothing needs attention.</div>}
              {notifications.map((n, i) => (
                <div key={i} style={{ padding: "8px 8px", borderTop: i ? "1px solid var(--border)" : "none", fontSize: 12, display: "flex", gap: 8 }}>
                  <span style={{ color: n.level === "danger" ? C.danger : C.warning, marginTop: 1 }}><AlertTriangle size={12} /></span>
                  <span>{n.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 26, height: 26, borderRadius: "50%", background: "var(--raised)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 600, color: "var(--textMuted)", border: "1px solid var(--border)"
            }}>
              {user.name.split(" ").map(w => w[0]).join("")}
            </div>
            <div style={{ lineHeight: 1.1 }}>
              <div style={{ fontSize: 12.5, fontWeight: 500 }}>{user.name}</div>
              <div style={{ fontSize: 10.5, color: "var(--textMuted)" }}>{user.role}</div>
            </div>
            <button onClick={onLogout} style={{
              marginLeft: 8, background: "none", border: "1px solid var(--border)", borderRadius: 6,
              color: "var(--textMuted)", padding: "5px 8px", cursor: "pointer", display: "flex", alignItems: "center"
            }} title="Log out"><Power size={13} /></button>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "block", marginBottom: 14 }}>
      <div style={{ fontSize: 11.5, color: "var(--textMuted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</div>
      {children}
    </label>
  );
}

const inputStyle = {
  width: "100%", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6,
  padding: "9px 11px", color: "var(--text)", fontSize: 13.5, outline: "none", boxSizing: "border-box",
  fontFamily: "'Inter', sans-serif"
};

function Btn({ children, onClick, variant = "default", style, disabled, type = "button" }) {
  const base = {
    default: { background: "var(--raised)", border: "1px solid var(--border)", color: "var(--text)" },
    primary: { background: C.primary, border: `1px solid ${C.primary}`, color: "#1A0A00" },
    secondary: { background: C.secondary, border: `1px solid ${C.secondary}`, color: "#04170B" },
    ghost: { background: "transparent", border: "1px solid var(--border)", color: "var(--textMuted)" },
    danger: { background: "transparent", border: `1px solid ${C.danger}`, color: C.danger },
  }[variant];
  return (
    <button type={type} disabled={disabled} onClick={onClick} style={{
      ...base, borderRadius: 7, padding: "9px 16px", fontSize: 13, fontWeight: 600,
      cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.45 : 1,
      display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "'Inter', sans-serif",
      ...style
    }}>{children}</button>
  );
}

function Badge({ children, color }) {
  return (
    <span style={{
      fontSize: 10.5, fontWeight: 600, padding: "3px 8px", borderRadius: 5,
      background: color + "22", color, letterSpacing: 0.3
    }}>{children}</span>
  );
}

function SectionTitle({ icon, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 600, marginBottom: 16, color: "var(--text)" }}>
      <span style={{ color: C.primary }}>{icon}</span>{children}
    </div>
  );
}

function NavPill({ children, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 5, background: "transparent",
      border: "1px solid var(--border)", color: "var(--textMuted)", borderRadius: 20,
      padding: "6px 12px", fontSize: 12, cursor: "pointer"
    }}>{children}</button>
  );
}

function Table({ head, rows }) {
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
        <thead>
          <tr style={{ background: "var(--surfaceAlt)" }}>
            {head.map((h, i) => (
              <th key={i} style={{ textAlign: "left", padding: "9px 12px", color: "var(--textMuted)", fontWeight: 600, fontSize: 10.5, textTransform: "uppercase", letterSpacing: 0.4, borderBottom: "1px solid var(--border)" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ borderTop: i ? "1px solid var(--border)" : "none" }}>
              {r.map((c, j) => <td key={j} style={{ padding: "10px 12px" }}>{c}</td>)}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={head.length} style={{ padding: 20, textAlign: "center", color: "var(--textFaint)" }}>No records yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Row({ label, value, big }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: big ? "8px 0 0" : "4px 0", borderTop: big ? "1px solid var(--border)" : "none", marginTop: big ? 6 : 0 }}>
      <span style={{ fontSize: big ? 13 : 12, color: big ? "var(--text)" : "var(--textMuted)", fontWeight: big ? 600 : 400 }}>{label}</span>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: big ? 18 : 12.5, fontWeight: big ? 700 : 500, color: big ? C.primary : "var(--text)" }}>{value}</span>
    </div>
  );
}

function Metric({ icon, label, value, color }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 16 }}>
      <div style={{ color, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 10.5, color: "var(--textMuted)", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

/* ============================================================
   SCREEN 1 — LOGIN / PIN ENTRY
   ============================================================ */
function ScreenLogin({ employees, onLogin, theme }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const press = (d) => { if (pin.length >= 4) return; setError(""); setPin(pin + d); };
  const clear = () => { setPin(""); setError(""); };
  const back = () => setPin(pin.slice(0, -1));

  useEffect(() => {
    if (pin.length === 4) {
      const emp = employees.find(e => e.pin === pin);
      if (!emp) { setError("Incorrect PIN. Try again."); setTimeout(() => setPin(""), 500); return; }
      if (emp.status !== "Active") { setError("This profile is suspended."); setTimeout(() => setPin(""), 700); return; }
      setTimeout(() => onLogin(emp), 250);
    }
  }, [pin]);

  return (
    <Shell theme={theme}>
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        minHeight: 700, background: `radial-gradient(circle at 50% 0%, var(--surfaceAlt), var(--bg) 70%)`
      }}>
        <div style={{
          width: 54, height: 54, borderRadius: 12, background: C.primary,
          display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18
        }}>
          <Wrench size={28} color="#1A0A00" />
        </div>
        <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 24, fontWeight: 600, letterSpacing: 0.5 }}>
          Staff Authentication Terminal
        </div>
        <div style={{ fontSize: 12.5, color: "var(--textMuted)", marginTop: 4, marginBottom: 26 }}>
          Enter your 4-digit access code
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 22 }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{
              width: 16, height: 16, borderRadius: "50%",
              border: `2px solid ${error ? C.danger : C.primary}`,
              background: pin.length > i ? (error ? C.danger : C.primary) : "transparent",
              transition: "all .15s"
            }} />
          ))}
        </div>
        <div style={{ height: 16, fontSize: 12, color: C.danger, marginBottom: 6 }}>{error}</div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 62px)", gap: 12, marginBottom: 10 }}>
          {["1","2","3","4","5","6","7","8","9"].map(d => (
            <button key={d} onClick={() => press(d)} style={{
              width: 62, height: 62, borderRadius: 10, background: "var(--raised)", border: "1px solid var(--border)",
              color: "var(--text)", fontSize: 19, fontWeight: 500, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace"
            }}>{d}</button>
          ))}
          <button onClick={clear} style={{
            width: 62, height: 62, borderRadius: 10, background: "transparent", border: "1px solid var(--border)",
            color: "var(--textMuted)", fontSize: 11.5, cursor: "pointer"
          }}>Clear</button>
          <button onClick={() => press("0")} style={{
            width: 62, height: 62, borderRadius: 10, background: "var(--raised)", border: "1px solid var(--border)",
            color: "var(--text)", fontSize: 19, fontWeight: 500, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace"
          }}>0</button>
          <button onClick={back} style={{
            width: 62, height: 62, borderRadius: 10, background: "transparent", border: "1px solid var(--border)",
            color: "var(--textMuted)", fontSize: 13, cursor: "pointer"
          }}>⌫</button>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <span style={{ fontSize: 10.5, color: "var(--textFaint)", display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.secondary }} /> ETR printer online
          </span>
          <span style={{ fontSize: 10.5, color: "var(--textFaint)", display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.secondary }} /> Barcode gun ready
          </span>
        </div>

        <div style={{ marginTop: 30, fontSize: 10.5, color: "var(--textFaint)", textAlign: "center", maxWidth: 360 }}>
          Demo PINs — Admin 4471 · Storekeeper 2210 · Service Advisor 8842 · Cashier 3390
        </div>
      </div>
    </Shell>
  );
}

/* ============================================================
   SCREEN 2 — USER MANAGEMENT
   ============================================================ */
function ScreenUserManagement({ employees, setEmployees, user, onLogout, goto, theme, notifications }) {
  const [form, setForm] = useState({ name: "", phone: "", role: "Storekeeper", pin: "", rate: "" });
  const [query, setQuery] = useState("");

  const save = () => {
    if (!form.name || form.pin.length !== 4) return;
    const id = "EMP-" + String(employees.length + 1).padStart(3, "0");
    setEmployees([...employees, { id, name: form.name, role: form.role, phone: form.phone, pin: form.pin, status: "Active", lastLogin: "Never" }]);
    setForm({ name: "", phone: "", role: "Storekeeper", pin: "", rate: "" });
  };
  const toggleStatus = (id) => setEmployees(employees.map(e => e.id === id ? { ...e, status: e.status === "Active" ? "Suspended" : "Active" } : e));
  const filtered = employees.filter(e => e.name.toLowerCase().includes(query.toLowerCase()) || e.id.toLowerCase().includes(query.toLowerCase()));

  return (
    <Shell theme={theme}>
      <TopBar title="Staff Profiles & Permission Matrix" user={user} onLogout={onLogout} notifications={notifications}
        right={<NavPill onClick={() => goto("bay")}>Go to workshop <ChevronRight size={13} /></NavPill>} />
      <div style={{ display: "flex", minHeight: 640 }}>
        <div style={{ width: "35%", padding: 22, borderRight: "1px solid var(--border)" }}>
          <SectionTitle icon={<UserCog size={15} />}>New staff profile</SectionTitle>
          <Field label="Full employee name"><input style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. John Kariuki" /></Field>
          <Field label="Phone number"><input style={inputStyle} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="07xx xxx xxx" /></Field>
          <Field label="Role">
            <select style={inputStyle} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              {SYSTEM_ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </Field>
          <Field label="4-digit secure PIN"><input style={inputStyle} maxLength={4} value={form.pin} onChange={e => setForm({ ...form, pin: e.target.value.replace(/\D/g, "") })} placeholder="••••" /></Field>
          <Field label="Base salary / commission rate (KSh)"><input style={inputStyle} value={form.rate} onChange={e => setForm({ ...form, rate: e.target.value })} placeholder="e.g. 28,000" /></Field>
          <Btn variant="primary" onClick={save} style={{ width: "100%", justifyContent: "center", marginTop: 4 }}><Plus size={14} /> Save employee</Btn>
        </div>
        <div style={{ width: "65%", padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <SectionTitle icon={<Users size={15} />}>Active employee data sheet</SectionTitle>
            <div style={{ marginLeft: "auto", position: "relative" }}>
              <Search size={13} style={{ position: "absolute", left: 9, top: 10, color: "var(--textMuted)" }} />
              <input style={{ ...inputStyle, paddingLeft: 28, width: 200 }} placeholder="Search staff" value={query} onChange={e => setQuery(e.target.value)} />
            </div>
          </div>
          <Table head={["ID", "Name", "Role", "Status", "Last login", ""]}
            rows={filtered.map(e => [
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: "var(--textMuted)" }}>{e.id}</span>,
              e.name, e.role,
              <Badge color={e.status === "Active" ? C.secondary : C.danger}>{e.status}</Badge>,
              <span style={{ color: "var(--textMuted)", fontSize: 12 }}>{e.lastLogin}</span>,
              <Btn variant="ghost" style={{ padding: "5px 10px", fontSize: 11.5 }} onClick={() => toggleStatus(e.id)}>{e.status === "Active" ? "Deactivate" : "Reactivate"}</Btn>
            ])}
          />
        </div>
      </div>
    </Shell>
  );
}

/* ============================================================
   SCREEN 3 — STOCK INGESTION
   ============================================================ */
function ScreenStock({ inventory, setInventory, user, onLogout, goto, theme, notifications }) {
  const [form, setForm] = useState({ sku: "", name: "", fits: "", qty: "", supplier: "AutoParts Kenya Ltd", cost: "", price: "", low: "" });
  const [scan, setScan] = useState("");

  const addStock = (e) => {
    e && e.preventDefault();
    if (!form.sku || !form.qty) return;
    const existing = inventory.find(i => i.sku.toLowerCase() === form.sku.toLowerCase());
    if (existing) setInventory(inventory.map(i => i.sku === existing.sku ? { ...i, qty: i.qty + Number(form.qty) } : i));
    else setInventory([{ sku: form.sku.toUpperCase(), name: form.name || "Unnamed part", fits: form.fits || "Universal", cost: Number(form.cost) || 0, price: Number(form.price) || 0, qty: Number(form.qty), low: Number(form.low) || 5, added: "Today" }, ...inventory]);
    setForm({ sku: "", name: "", fits: "", qty: "", supplier: form.supplier, cost: "", price: "", low: "" });
  };
  const handleScan = (e) => {
    if (e.key !== "Enter" || !scan) return;
    const existing = inventory.find(i => i.sku.toLowerCase() === scan.toLowerCase());
    if (existing) setInventory(inventory.map(i => i.sku === existing.sku ? { ...i, qty: i.qty + 1 } : i));
    else setForm({ ...form, sku: scan });
    setScan("");
  };

  return (
    <Shell theme={theme}>
      <TopBar title="Master Warehouse Stock Ingestion" user={user} onLogout={onLogout} notifications={notifications}
        right={<NavPill onClick={() => goto("pos")}>Go to POS counter <ChevronRight size={13} /></NavPill>} />
      <div style={{ padding: 22 }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <ScanLine size={15} style={{ position: "absolute", left: 11, top: 11, color: C.primary }} />
            <input style={{ ...inputStyle, paddingLeft: 34, background: "var(--surfaceAlt)" }} placeholder="Scan barcode, then press Enter…" value={scan} onChange={e => setScan(e.target.value)} onKeyDown={handleScan} />
          </div>
        </div>
        <form onSubmit={addStock} style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 22, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 18 }}>
          <Field label="SKU / part number"><input style={inputStyle} value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="e.g. BRK-2201" /></Field>
          <Field label="Part title"><input style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Brake Pads - Front" /></Field>
          <Field label="Fits (compatibility)"><input style={inputStyle} value={form.fits} onChange={e => setForm({ ...form, fits: e.target.value })} placeholder="Fits Toyota NZE" /></Field>
          <Field label="Bulk supplier">
            <select style={inputStyle} value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })}>
              <option>AutoParts Kenya Ltd</option><option>Nairobi Motor Spares</option><option>Mombasa Auto Imports</option>
            </select>
          </Field>
          <Field label="Quantity added"><input style={inputStyle} value={form.qty} onChange={e => setForm({ ...form, qty: e.target.value.replace(/\D/g, "") })} placeholder="0" /></Field>
          <Field label="Wholesale buying price (KSh)"><input style={inputStyle} value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value.replace(/\D/g, "") })} placeholder="0" /></Field>
          <Field label="Target selling price (KSh)"><input style={inputStyle} value={form.price} onChange={e => setForm({ ...form, price: e.target.value.replace(/\D/g, "") })} placeholder="0" /></Field>
          <Field label="Low-stock alert threshold"><input style={inputStyle} value={form.low} onChange={e => setForm({ ...form, low: e.target.value.replace(/\D/g, "") })} placeholder="5" /></Field>
          <Btn type="submit" variant="primary" style={{ gridColumn: "span 1", alignSelf: "end", justifyContent: "center" }}><Plus size={14} /> Add to inventory</Btn>
        </form>
        <SectionTitle icon={<Boxes size={15} />}>Recently ingested — active stock position</SectionTitle>
        <Table head={["SKU", "Description", "Cost", "Price", "On hand", "Status"]}
          rows={inventory.map(i => [
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5 }}>{i.sku}</span>,
            <div><div>{i.name}</div><div style={{ fontSize: 10.5, color: "var(--textFaint)" }}>{i.fits}</div></div>,
            currency(i.cost), currency(i.price), i.qty,
            i.qty <= i.low ? <Badge color={C.warning}><AlertTriangle size={9} style={{ marginRight: 3, verticalAlign: -1 }} />Low stock</Badge> : <Badge color={C.secondary}>In stock</Badge>
          ])}
        />
      </div>
    </Shell>
  );
}

/* ============================================================
   SCREEN 4 — VEHICLE INTAKE
   ============================================================ */
function ScreenIntake({ jobCards, setJobCards, user, onLogout, goto, theme, notifications }) {
  const [form, setForm] = useState({ reg: "", mileage: "", fuel: 2, phone: "", customer: "", faults: "", mechanic: "Peter Kamau" });
  const fuelLabels = ["E", "1/4", "1/2", "3/4", "F"];
  const create = () => {
    if (!form.reg || !form.customer) return;
    const id = "JC-" + (1040 + jobCards.length + 1);
    setJobCards([{ id, reg: form.reg.toUpperCase(), customer: form.customer, phone: form.phone, mechanic: form.mechanic, stage: "diagnostics", startedAt: Date.now(), faults: form.faults, lines: [] }, ...jobCards]);
    setForm({ reg: "", mileage: "", fuel: 2, phone: "", customer: "", faults: "", mechanic: "Peter Kamau" });
    goto("bay");
  };

  return (
    <Shell theme={theme}>
      <TopBar title="Vehicle Reception & Intake" user={user} onLogout={onLogout} notifications={notifications}
        right={<NavPill onClick={() => goto("bay")}>View bay board <ChevronRight size={13} /></NavPill>} />
      <div style={{ padding: 26, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30, maxWidth: 900, margin: "0 auto" }}>
        <div>
          <SectionTitle icon={<Car size={15} />}>Vehicle details</SectionTitle>
          <Field label="Registration plate"><input style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: 16, letterSpacing: 1 }} value={form.reg} onChange={e => setForm({ ...form, reg: e.target.value })} placeholder="KDK 420X" /></Field>
          <Field label="Mileage (km)">
            <div style={{ position: "relative" }}>
              <Gauge size={14} style={{ position: "absolute", left: 10, top: 11, color: "var(--textMuted)" }} />
              <input style={{ ...inputStyle, paddingLeft: 30 }} value={form.mileage} onChange={e => setForm({ ...form, mileage: e.target.value.replace(/\D/g, "") })} placeholder="e.g. 84,200" />
            </div>
          </Field>
          <Field label={<span><Fuel size={11} style={{ verticalAlign: -1, marginRight: 4 }} />Fuel status</span>}>
            <input type="range" min={0} max={4} value={form.fuel} onChange={e => setForm({ ...form, fuel: Number(e.target.value) })} style={{ width: "100%", accentColor: C.primary }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "var(--textMuted)", marginTop: 2 }}>
              {fuelLabels.map((f, i) => <span key={i} style={{ color: form.fuel === i ? C.primary : "var(--textMuted)", fontWeight: form.fuel === i ? 700 : 400 }}>{f}</span>)}
            </div>
          </Field>
        </div>
        <div>
          <SectionTitle icon={<Phone size={15} />}>Customer & fault report</SectionTitle>
          <Field label="Customer name"><input style={inputStyle} value={form.customer} onChange={e => setForm({ ...form, customer: e.target.value })} placeholder="e.g. James Mutiso" /></Field>
          <Field label="Phone number"><input style={inputStyle} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="07xx xxx xxx" /></Field>
          <Field label="Reported mechanical faults"><textarea style={{ ...inputStyle, minHeight: 84, resize: "vertical", fontFamily: "'Inter', sans-serif" }} value={form.faults} onChange={e => setForm({ ...form, faults: e.target.value })} placeholder="Describe what the driver reported…" /></Field>
          <Btn variant="primary" onClick={create} style={{ width: "100%", justifyContent: "center" }}><Plus size={14} /> Create job card</Btn>
        </div>
      </div>
    </Shell>
  );
}

/* ============================================================
   SCREEN 5 — BAY CONTROL (KANBAN)
   ============================================================ */
function useTicker() {
  const [, force] = useState(0);
  useEffect(() => { const t = setInterval(() => force(x => x + 1), 1000); return () => clearInterval(t); }, []);
}
function elapsed(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}:${String(sec).padStart(2, "0")}`;
}

function ScreenBay({ jobCards, setJobCards, user, onLogout, goto, openCard, theme, notifications }) {
  useTicker();
  const stages = [
    { key: "diagnostics", label: "Awaiting diagnostics" },
    { key: "active", label: "Active repairs" },
    { key: "parts", label: "Pending parts" },
    { key: "done", label: "Cleared / completed" },
  ];
  const dragCard = useRef(null);
  const onDrop = (stageKey) => {
    if (!dragCard.current) return;
    setJobCards(jobCards.map(j => j.id === dragCard.current ? { ...j, stage: stageKey } : j));
    dragCard.current = null;
  };

  return (
    <Shell theme={theme}>
      <TopBar title="Live Workshop Operations" user={user} onLogout={onLogout} notifications={notifications}
        right={<NavPill onClick={() => goto("intake")}>New intake <Plus size={13} /></NavPill>} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, padding: 20 }}>
        {stages.map(st => (
          <div key={st.key} onDragOver={e => e.preventDefault()} onDrop={() => onDrop(st.key)}
            style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 12, minHeight: 480 }}>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--textMuted)", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 10, display: "flex", justifyContent: "space-between" }}>
              {st.label}<span style={{ color: "var(--textFaint)" }}>{jobCards.filter(j => j.stage === st.key).length}</span>
            </div>
            {jobCards.filter(j => j.stage === st.key).map(j => (
              <div key={j.id} draggable onDragStart={() => dragCard.current = j.id} onClick={() => openCard(j.id)}
                style={{ background: "var(--raised)", border: "1px solid var(--border)", borderRadius: 8, padding: 12, marginBottom: 10, cursor: "grab" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, color: C.primary }}>{j.reg}</span>
                  <span style={{ fontSize: 10, color: "var(--textFaint)" }}>{j.id}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text)", margin: "6px 0 3px" }}>{j.customer}</div>
                <div style={{ fontSize: 11, color: "var(--textMuted)", marginBottom: 8 }}>{j.mechanic}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: st.key === "active" ? C.secondary : "var(--textFaint)" }}>
                  <Clock size={11} /> {elapsed(j.startedAt)}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Shell>
  );
}

/* ============================================================
   SCREEN 6 — JOB CARD WORKSHEET
   ============================================================ */
function ScreenJobCard({ jobCards, setJobCards, jobId, inventory, employees, user, onLogout, goto, theme, notifications }) {
  const job = jobCards.find(j => j.id === jobId) || jobCards[0];
  const mechanics = employees.filter(e => e.role === "Lead Mechanic" && e.status === "Active");
  const [laborPick, setLaborPick] = useState(laborCatalog[0].code);
  const [partPick, setPartPick] = useState(inventory[0]?.sku || "");
  const update = (patch) => setJobCards(jobCards.map(j => j.id === job.id ? { ...j, ...patch } : j));
  const addLabor = () => { const l = laborCatalog.find(x => x.code === laborPick); update({ lines: [...job.lines, { type: "labor", name: l.name, price: l.price }] }); };
  const addPart = () => { const p = inventory.find(x => x.sku === partPick); update({ lines: [...job.lines, { type: "part", name: p.name, price: p.price, sku: p.sku }] }); };
  const removeLine = (i) => update({ lines: job.lines.filter((_, idx) => idx !== i) });
  const total = job.lines.reduce((s, l) => s + l.price, 0);

  return (
    <Shell theme={theme}>
      <TopBar title={`Job card — ${job.reg}`} user={user} onLogout={onLogout} notifications={notifications}
        right={<NavPill onClick={() => goto("bay")}><ArrowLeft size={13} /> Back to bay board</NavPill>} />
      <div style={{ padding: 22 }}>
        <div style={{ display: "flex", gap: 20, marginBottom: 18, alignItems: "center" }}>
          <Field label="Assign lead mechanic">
            <select style={{ ...inputStyle, width: 220 }} value={job.mechanic} onChange={e => update({ mechanic: e.target.value })}>
              {mechanics.map(m => <option key={m.id}>{m.name}</option>)}
            </select>
          </Field>
          <div style={{ fontSize: 12.5, color: "var(--textMuted)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "9px 14px", flex: 1 }}>{job.faults}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 16 }}>
            <SectionTitle icon={<Wrench size={14} />}>Labor charge selector</SectionTitle>
            <div style={{ display: "flex", gap: 8 }}>
              <select style={inputStyle} value={laborPick} onChange={e => setLaborPick(e.target.value)}>
                {laborCatalog.map(l => <option key={l.code} value={l.code}>{l.name} — {currency(l.price)}</option>)}
              </select>
              <Btn variant="secondary" onClick={addLabor}><Plus size={13} /></Btn>
            </div>
          </div>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 16 }}>
            <SectionTitle icon={<Package size={14} />}>Parts pull selector</SectionTitle>
            <div style={{ display: "flex", gap: 8 }}>
              <select style={inputStyle} value={partPick} onChange={e => setPartPick(e.target.value)}>
                {inventory.map(p => <option key={p.sku} value={p.sku}>{p.name} — {currency(p.price)} ({p.qty} in stock)</option>)}
              </select>
              <Btn variant="secondary" onClick={addPart}><Plus size={13} /></Btn>
            </div>
          </div>
        </div>
        <SectionTitle icon={<Receipt size={14} />}>Job line items</SectionTitle>
        <Table head={["Type", "Description", "Amount", ""]}
          rows={job.lines.map((l, i) => [
            <Badge color={l.type === "labor" ? C.primary : C.secondary}>{l.type}</Badge>, l.name, currency(l.price),
            <button onClick={() => removeLine(i)} style={{ background: "none", border: "none", color: "var(--textFaint)", cursor: "pointer" }}><Trash2 size={13} /></button>
          ])}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14, gap: 20, alignItems: "center" }}>
          <div style={{ fontSize: 13, color: "var(--textMuted)" }}>Job total</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 700, color: C.primary }}>{currency(total)}</div>
        </div>
      </div>
    </Shell>
  );
}

/* ============================================================
   SCREEN 7 — RETAIL POS COUNTER
   ============================================================ */
function ScreenPOS({ inventory, setInventory, user, onLogout, goto, setPendingSale, theme, notifications }) {
  const [cart, setCart] = useState([]);
  const [cat, setCat] = useState(productCategories[0]);
  const [scan, setScan] = useState("");
  const [loyaltyPhone, setLoyaltyPhone] = useState("");

  const addToCart = (sku) => {
    const item = inventory.find(i => i.sku === sku);
    if (!item || item.qty <= 0) return;
    setInventory(inventory.map(i => i.sku === sku ? { ...i, qty: i.qty - 1 } : i));
    setCart(prev => {
      const found = prev.find(c => c.sku === sku);
      if (found) return prev.map(c => c.sku === sku ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { sku: item.sku, name: item.name, price: item.price, qty: 1 }];
    });
  };
  const removeFromCart = (sku) => {
    const line = cart.find(c => c.sku === sku);
    if (!line) return;
    setInventory(inventory.map(i => i.sku === sku ? { ...i, qty: i.qty + line.qty } : i));
    setCart(cart.filter(c => c.sku !== sku));
  };
  const handleScan = (e) => {
    if (e.key !== "Enter" || !scan) return;
    const item = inventory.find(i => i.sku.toLowerCase() === scan.toLowerCase());
    if (item) addToCart(item.sku);
    setScan("");
  };
  const cancelSale = () => {
    cart.forEach(c => setInventory(prev => prev.map(i => i.sku === c.sku ? { ...i, qty: i.qty + c.qty } : i)));
    setCart([]);
  };

  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const vat = subtotal * 0.16;
  const total = subtotal + vat;

  return (
    <Shell theme={theme}>
      <TopBar title="Retail Spare Parts Counter" user={user} onLogout={onLogout} notifications={notifications} />
      <div style={{ padding: "14px 20px" }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <ScanLine size={15} style={{ position: "absolute", left: 11, top: 11, color: C.primary }} />
            <input style={{ ...inputStyle, paddingLeft: 34 }} placeholder="Scan barcode or type SKU, then Enter…" value={scan} onChange={e => setScan(e.target.value)} onKeyDown={handleScan} />
          </div>
          <div style={{ position: "relative", width: 220 }}>
            <Phone size={13} style={{ position: "absolute", left: 11, top: 11, color: "var(--textMuted)" }} />
            <input style={{ ...inputStyle, paddingLeft: 30 }} placeholder="Loyalty phone (optional)" value={loyaltyPhone} onChange={e => setLoyaltyPhone(e.target.value)} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "45% 55%", gap: 16 }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, display: "flex", flexDirection: "column", minHeight: 460 }}>
            <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)", fontSize: 12.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
              <ShoppingCart size={14} color={C.primary} /> Active checkout cart
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "6px 0" }}>
              {cart.length === 0 && <div style={{ padding: 30, textAlign: "center", color: "var(--textFaint)", fontSize: 12.5 }}>Scan or tap a product to begin a sale</div>}
              {cart.map(c => (
                <div key={c.sku} style={{ display: "flex", alignItems: "center", padding: "9px 14px", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5 }}>{c.name}</div>
                    <div style={{ fontSize: 10.5, color: "var(--textFaint)", fontFamily: "'JetBrains Mono', monospace" }}>{c.sku} · {currency(c.price)} × {c.qty}</div>
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, marginRight: 10 }}>{currency(c.price * c.qty)}</div>
                  <button onClick={() => removeFromCart(c.sku)} style={{ background: "none", border: "none", color: "var(--textFaint)", cursor: "pointer" }}><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1px solid var(--border)", padding: 14 }}>
              <Row label="Gross subtotal" value={currency(subtotal)} />
              <Row label="VAT (16%)" value={currency(vat)} />
              <Row label="Net cash total" value={currency(total)} big />
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <Btn variant="ghost" onClick={cancelSale} style={{ flex: 1, justifyContent: "center" }}><X size={13} /> Cancel sale</Btn>
                <Btn variant="primary" disabled={cart.length === 0} onClick={() => { setPendingSale({ items: cart, subtotal, vat, total }); goto("checkout"); }} style={{ flex: 2, justifyContent: "center" }}>Pay bill counter</Btn>
              </div>
            </div>
          </div>
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              {productCategories.map(c => (
                <button key={c} onClick={() => setCat(c)} style={{
                  padding: "7px 12px", borderRadius: 20, fontSize: 11.5, cursor: "pointer",
                  border: `1px solid ${cat === c ? C.primary : "var(--border)"}`,
                  background: cat === c ? "var(--primaryDim)" : "transparent",
                  color: cat === c ? C.primary : "var(--textMuted)"
                }}>{c}</button>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {(productsByCategory[cat] || []).map(sku => {
                const p = inventory.find(i => i.sku === sku);
                if (!p) return null;
                return (
                  <button key={sku} onClick={() => addToCart(sku)} disabled={p.qty <= 0} style={{
                    textAlign: "left", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8,
                    padding: 12, cursor: p.qty > 0 ? "pointer" : "not-allowed", opacity: p.qty > 0 ? 1 : 0.4
                  }}>
                    <Package size={16} color={C.secondary} />
                    <div style={{ fontSize: 12, margin: "8px 0 2px", lineHeight: 1.3 }}>{p.name}</div>
                    <div style={{ fontSize: 10, color: "var(--textFaint)", fontFamily: "'JetBrains Mono', monospace" }}>{p.sku}</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13.5, marginTop: 6, color: C.primary }}>{currency(p.price)}</div>
                    <div style={{ fontSize: 10, color: "var(--textFaint)" }}>{p.qty} in stock</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

/* ============================================================
   SCREEN 8 — BILL SETTLEMENT
   ============================================================ */
function ScreenCheckout({ pendingSale, user, onLogout, goto, setLastReceipt, theme }) {
  const [method, setMethod] = useState("mpesa");
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [mpesaCode, setMpesaCode] = useState("");
  const [tendered, setTendered] = useState(0);
  if (!pendingSale) return null;
  const { total, subtotal, vat, items } = pendingSale;
  const change = Math.max(0, tendered - total);
  const canConfirm = method === "mpesa" ? mpesaCode.length >= 8 : tendered >= total;
  const confirm = () => { setLastReceipt({ items, subtotal, vat, total, method, mpesaCode, change, id: "INV-" + Math.floor(4000 + Math.random() * 900) }); goto("receipt"); };

  return (
    <Shell theme={theme}>
      <TopBar title="Unified Bill Settlement Register" user={user} onLogout={onLogout}
        right={<NavPill onClick={() => goto("pos")}><ArrowLeft size={13} /> Back to counter</NavPill>} />
      <div style={{ padding: 26, maxWidth: 640, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <div style={{ fontSize: 12.5, color: "var(--textMuted)" }}>Total due</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 38, fontWeight: 700, color: C.primary }}>{currency(total)}</div>
          <div style={{ fontSize: 11.5, color: "var(--textFaint)" }}>Subtotal {currency(subtotal)} · VAT {currency(vat)}</div>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          <button onClick={() => setMethod("mpesa")} style={{
            flex: 1, padding: 12, borderRadius: 8, cursor: "pointer",
            border: `1px solid ${method === "mpesa" ? C.secondary : "var(--border)"}`,
            background: method === "mpesa" ? "var(--secondaryDim)" : "var(--surface)", color: "var(--text)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontSize: 13
          }}><Smartphone size={15} color={C.secondary} /> M-Pesa</button>
          <button onClick={() => setMethod("cash")} style={{
            flex: 1, padding: 12, borderRadius: 8, cursor: "pointer",
            border: `1px solid ${method === "cash" ? C.primary : "var(--border)"}`,
            background: method === "cash" ? "var(--primaryDim)" : "var(--surface)", color: "var(--text)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontSize: 13
          }}><Banknote size={15} color={C.primary} /> Cash</button>
        </div>
        {method === "mpesa" ? (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 18 }}>
            <Field label="Customer Safaricom number"><input style={inputStyle} value={mpesaPhone} onChange={e => setMpesaPhone(e.target.value)} placeholder="07xx xxx xxx" /></Field>
            <Field label="M-Pesa transaction code"><input style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1 }} maxLength={10} value={mpesaCode} onChange={e => setMpesaCode(e.target.value.toUpperCase())} placeholder="e.g. QGH7K2LMP1" /></Field>
          </div>
        ) : (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 18 }}>
            <div style={{ fontSize: 11.5, color: "var(--textMuted)", marginBottom: 10 }}>Tap notes tendered by customer</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
              {[100, 200, 500, 1000].map(n => (
                <button key={n} onClick={() => setTendered(tendered + n)} style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--raised)", color: "var(--text)", cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>KSh {n}</button>
              ))}
              <button onClick={() => setTendered(0)} style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--textMuted)", cursor: "pointer", fontSize: 12 }}>Reset</button>
            </div>
            <Row label="Tendered" value={currency(tendered)} />
            <Row label="Change due" value={currency(change)} big />
          </div>
        )}
        <Btn variant="primary" disabled={!canConfirm} onClick={confirm} style={{ width: "100%", justifyContent: "center", marginTop: 20, padding: "13px 16px", fontSize: 14 }}><Check size={15} /> Confirm payment & print</Btn>
      </div>
    </Shell>
  );
}

/* ============================================================
   SCREEN 9 — RECEIPT & GATE PASS
   ============================================================ */
function ScreenReceipt({ lastReceipt, user, onLogout, goto, theme }) {
  if (!lastReceipt) return null;
  const { items, subtotal, vat, total, method, mpesaCode, id } = lastReceipt;
  return (
    <Shell theme={theme}>
      <TopBar title="Invoicing & Clearance Slip" user={user} onLogout={onLogout} right={<NavPill onClick={() => goto("pos")}>New sale <Plus size={13} /></NavPill>} />
      <div style={{ padding: 26, display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
        <div style={{ textAlign: "center", width: "100%", marginBottom: -6 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--secondaryDim)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
            <Check size={22} color={C.secondary} />
          </div>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 18, fontWeight: 600 }}>Payment received</div>
        </div>
        <div style={{ background: "#fff", color: "#1a1a1a", borderRadius: 8, padding: 20, width: 300, fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5 }}>
          <div style={{ textAlign: "center", fontWeight: 700, marginBottom: 2 }}>GARAGE OS ETR INVOICE</div>
          <div style={{ textAlign: "center", color: "#555", marginBottom: 10 }}>{id} · VAT reg. P051234567X</div>
          <div style={{ borderTop: "1px dashed #999", margin: "8px 0" }} />
          {items.map(it => (
            <div key={it.sku} style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <span>{it.name.slice(0, 20)} x{it.qty}</span><span>{Math.round(it.price * it.qty)}</span>
            </div>
          ))}
          <div style={{ borderTop: "1px dashed #999", margin: "8px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between" }}><span>Subtotal</span><span>{Math.round(subtotal)}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span>VAT 16%</span><span>{Math.round(vat)}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}><span>TOTAL KSh</span><span>{Math.round(total)}</span></div>
          <div style={{ borderTop: "1px dashed #999", margin: "8px 0" }} />
          <div style={{ textAlign: "center", color: "#555" }}>{method === "mpesa" ? `M-Pesa · ${mpesaCode}` : "Cash payment"}</div>
        </div>
        <div style={{ background: "#fff", color: "#1a1a1a", borderRadius: 8, padding: 20, width: 300 }}>
          <div style={{ textAlign: "center", fontWeight: 700, fontSize: 12, marginBottom: 12 }}>SECURITY GATE PASS</div>
          <div style={{ fontSize: 10.5, color: "#555" }}>Vehicle registration</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, marginBottom: 12 }}>N/A — Retail sale</div>
          <div style={{ background: C.secondary, color: "#04170B", textAlign: "center", padding: "8px 6px", borderRadius: 6, fontSize: 11, fontWeight: 700, marginBottom: 12 }}>COMPLETELY PAID / CLEARED FOR ROADWAY EXIT</div>
          <div style={{ height: 30, background: "repeating-linear-gradient(90deg,#1a1a1a 0 2px,transparent 2px 5px)" }} />
          <div style={{ textAlign: "center", fontSize: 9.5, color: "#777", marginTop: 4 }}>{id}</div>
        </div>
        <div style={{ width: "100%", display: "flex", justifyContent: "center", gap: 10, marginTop: 6 }}>
          <Btn variant="ghost"><Printer size={13} /> Print documents</Btn>
        </div>
      </div>
    </Shell>
  );
}

/* ============================================================
   SCREEN 10 — ANALYTICS DASHBOARD
   ============================================================ */
function ScreenAnalytics({ inventory, jobCards, user, onLogout, theme, notifications }) {
  const stockValue = inventory.reduce((s, i) => s + i.cost * i.qty, 0);
  const lowStock = inventory.filter(i => i.qty <= i.low).length;
  const revenueToday = jobCards.reduce((s, j) => s + j.lines.reduce((a, l) => a + l.price, 0), 0);
  const activeJobs = jobCards.filter(j => j.stage !== "done").length;
  const topParts = [...inventory].sort((a, b) => (b.price * (30 - b.qty)) - (a.price * (30 - a.qty))).slice(0, 5);
  const maxVal = Math.max(...topParts.map(p => p.qty), 1);

  return (
    <Shell theme={theme}>
      <TopBar title="Executive Financial Analytics" user={user} onLogout={onLogout} notifications={notifications} />
      <div style={{ padding: 22 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
          <Metric icon={<DollarSign size={16} />} label="Job card revenue (open)" value={currency(revenueToday)} color={C.primary} />
          <Metric icon={<Boxes size={16} />} label="Inventory value at cost" value={currency(stockValue)} color={C.secondary} />
          <Metric icon={<AlertTriangle size={16} />} label="Low-stock SKUs" value={lowStock} color={C.warning} />
          <Metric icon={<Wrench size={16} />} label="Active job cards" value={activeJobs} color={"var(--text)"} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 18 }}>
            <SectionTitle icon={<TrendingUp size={14} />}>Inventory pressure — units held</SectionTitle>
            {topParts.map(p => (
              <div key={p.sku} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 4 }}>
                  <span>{p.name}</span><span style={{ color: "var(--textMuted)" }}>{p.qty} units</span>
                </div>
                <div style={{ height: 6, background: "var(--raised)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: `${(p.qty / maxVal) * 100}%`, height: "100%", background: p.qty <= p.low ? C.warning : C.secondary }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 18 }}>
            <SectionTitle icon={<LayoutGrid size={14} />}>Workshop bay distribution</SectionTitle>
            {["diagnostics", "active", "parts", "done"].map(stage => {
              const count = jobCards.filter(j => j.stage === stage).length;
              return (
                <div key={stage} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ width: 110, fontSize: 11.5, color: "var(--textMuted)", textTransform: "capitalize" }}>{stage}</span>
                  <div style={{ flex: 1, height: 6, background: "var(--raised)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: `${(count / Math.max(jobCards.length, 1)) * 100}%`, height: "100%", background: C.primary }} />
                  </div>
                  <span style={{ fontSize: 11.5, width: 16, textAlign: "right" }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Shell>
  );
}

/* ============================================================
   SCREEN 11 (NEW) — CUSTOMERS & VEHICLE SERVICE HISTORY
   ============================================================ */
function ScreenCustomers({ customers, user, onLogout, goto, theme, notifications }) {
  const [query, setQuery] = useState("");
  const dueSoon = (c) => {
    const daysLeft = Math.ceil((new Date(c.nextServiceDate.replace(/(\d+) (\w+) (\d+)/, "$2 $1, $3")) - new Date("2026-08-24")) / 86400000);
    return daysLeft <= 21;
  };
  const filtered = customers.filter(c => c.reg.toLowerCase().includes(query.toLowerCase()) || c.customer.toLowerCase().includes(query.toLowerCase()));

  return (
    <Shell theme={theme}>
      <TopBar title="Customers & Vehicle History" user={user} onLogout={onLogout} notifications={notifications}
        right={<NavPill onClick={() => goto("intake")}>New intake <Plus size={13} /></NavPill>} />
      <div style={{ padding: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <SectionTitle icon={<CalendarClock size={15} />}>Vehicle roster & service due dates</SectionTitle>
          <div style={{ marginLeft: "auto", position: "relative" }}>
            <Search size={13} style={{ position: "absolute", left: 9, top: 10, color: "var(--textMuted)" }} />
            <input style={{ ...inputStyle, paddingLeft: 28, width: 220 }} placeholder="Search plate or customer" value={query} onChange={e => setQuery(e.target.value)} />
          </div>
        </div>
        <Table head={["Reg plate", "Customer", "Vehicle", "Mileage", "Last service", "Next service", ""]}
          rows={filtered.map(c => [
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: C.primary }}>{c.reg}</span>,
            <div><div>{c.customer}</div><div style={{ fontSize: 10.5, color: "var(--textFaint)" }}>{c.phone}</div></div>,
            c.model,
            <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{c.mileage.toLocaleString()} km</span>,
            c.lastService,
            <div>
              <div>{c.nextServiceDate}</div>
              <div style={{ fontSize: 10.5, color: "var(--textFaint)" }}>at {c.nextServiceKm.toLocaleString()} km</div>
            </div>,
            dueSoon(c) ? <Badge color={C.warning}><CalendarClock size={9} style={{ marginRight: 3, verticalAlign: -1 }} />Due soon</Badge> : <Badge color={C.secondary}>On track</Badge>
          ])}
        />
      </div>
    </Shell>
  );
}

/* ============================================================
   SCREEN 12 (NEW) — SETTINGS
   ============================================================ */
function ScreenSettings({ user, onLogout, theme, setTheme, business, setBusiness, notifications }) {
  return (
    <Shell theme={theme}>
      <TopBar title="Settings" user={user} onLogout={onLogout} notifications={notifications} />
      <div style={{ padding: 26, maxWidth: 560, margin: "0 auto" }}>
        <SectionTitle icon={<Settings size={15} />}>Appearance</SectionTitle>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 18, marginBottom: 24 }}>
          <div style={{ fontSize: 12.5, color: "var(--textMuted)", marginBottom: 12 }}>Choose how the terminal looks on this device.</div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setTheme("dark")} style={{
              flex: 1, padding: 14, borderRadius: 8, cursor: "pointer", display: "flex", flexDirection: "column",
              alignItems: "center", gap: 8, border: `1px solid ${theme === "dark" ? C.primary : "var(--border)"}`,
              background: theme === "dark" ? "var(--primaryDim)" : "var(--raised)", color: "var(--text)"
            }}>
              <Moon size={18} color={theme === "dark" ? C.primary : "var(--textMuted)"} />
              <span style={{ fontSize: 12.5, fontWeight: 600 }}>Dark mode</span>
              <span style={{ fontSize: 10.5, color: "var(--textFaint)" }}>Best for the workshop floor</span>
            </button>
            <button onClick={() => setTheme("light")} style={{
              flex: 1, padding: 14, borderRadius: 8, cursor: "pointer", display: "flex", flexDirection: "column",
              alignItems: "center", gap: 8, border: `1px solid ${theme === "light" ? C.primary : "var(--border)"}`,
              background: theme === "light" ? "var(--primaryDim)" : "var(--raised)", color: "var(--text)"
            }}>
              <Sun size={18} color={theme === "light" ? C.primary : "var(--textMuted)"} />
              <span style={{ fontSize: 12.5, fontWeight: 600 }}>Light mode</span>
              <span style={{ fontSize: 10.5, color: "var(--textFaint)" }}>Best for the front counter</span>
            </button>
          </div>
        </div>

        <SectionTitle icon={<Receipt size={15} />}>Business & invoicing</SectionTitle>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 18, marginBottom: 24 }}>
          <Field label="Business name"><input style={inputStyle} value={business.name} onChange={e => setBusiness({ ...business, name: e.target.value })} /></Field>
          <Field label="KRA PIN"><input style={inputStyle} value={business.kra} onChange={e => setBusiness({ ...business, kra: e.target.value })} /></Field>
          <Field label="VAT rate (%)"><input style={inputStyle} value={business.vat} onChange={e => setBusiness({ ...business, vat: e.target.value.replace(/\D/g, "") })} /></Field>
        </div>

        <SectionTitle icon={<Bell size={15} />}>Notifications</SectionTitle>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 18 }}>
          <div style={{ fontSize: 12.5, color: "var(--textMuted)" }}>Low-stock and service-due alerts show in the bell icon on every screen. Connecting SMS/WhatsApp delivery to customers is available as a follow-up integration.</div>
        </div>
      </div>
    </Shell>
  );
}

/* ============================================================
   SIDEBAR NAV
   ============================================================ */
const NAV_ITEMS = [
  { key: "bay", label: "Bay board", icon: LayoutGrid },
  { key: "intake", label: "Vehicle intake", icon: Car },
  { key: "customers", label: "Customers", icon: HistoryIcon },
  { key: "stock", label: "Stock ingestion", icon: Package },
  { key: "pos", label: "POS counter", icon: ShoppingCart },
  { key: "users", label: "Staff", icon: Users },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
  { key: "settings", label: "Settings", icon: Settings },
];

function SideNav({ current, goto }) {
  return (
    <div style={{ position: "absolute", left: 0, top: 61, bottom: 0, width: 56, borderRight: "1px solid var(--border)", background: "var(--surface)", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 10, gap: 4, zIndex: 5 }}>
      {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
        <button key={key} title={label} onClick={() => goto(key)} style={{
          width: 38, height: 38, borderRadius: 8, border: "none", cursor: "pointer",
          background: current === key ? "var(--primaryDim)" : "transparent",
          color: current === key ? C.primary : "var(--textMuted)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}><Icon size={17} /></button>
      ))}
    </div>
  );
}

/* ============================================================
   ROOT APP
   ============================================================ */
export default function GarageOS() {
  const [employees, setEmployees] = useState(initialEmployees);
  const [inventory, setInventory] = useState(initialInventory);
  const [jobCards, setJobCards] = useState(initialJobCards);
  const [customers] = useState(initialCustomers);
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState("login");
  const [activeJobId, setActiveJobId] = useState(null);
  const [pendingSale, setPendingSale] = useState(null);
  const [lastReceipt, setLastReceipt] = useState(null);
  const [theme, setTheme] = useState("dark");
  const [business, setBusiness] = useState({ name: "Kamau & Sons Auto Garage", kra: "P051234567X", vat: "16" });

  const goto = (s) => setScreen(s);
  const openCard = (id) => { setActiveJobId(id); setScreen("jobcard"); };
  const onLogin = (emp) => {
    setUser(emp);
    const routes = { "System Administrator": "users", "Storekeeper": "stock", "Service Advisor": "intake", "Lead Mechanic": "bay", "Terminal Cashier": "pos" };
    setScreen(routes[emp.role] || "bay");
  };
  const onLogout = () => { setUser(null); setScreen("login"); };

  const notifications = [
    ...inventory.filter(i => i.qty <= i.low).map(i => ({ level: "warning", text: `${i.name} is low on stock (${i.qty} left).` })),
    ...customers.filter(c => {
      const daysLeft = Math.ceil((new Date(c.nextServiceDate.replace(/(\d+) (\w+) (\d+)/, "$2 $1, $3")) - new Date("2026-08-24")) / 86400000);
      return daysLeft <= 21;
    }).map(c => ({ level: "danger", text: `${c.reg} (${c.customer}) is due for service by ${c.nextServiceDate}.` })),
  ];

  if (screen === "login" || !user) return <ScreenLogin employees={employees} onLogin={onLogin} theme={theme} />;

  const withNav = (node) => (
    <div style={{ position: "relative" }}>
      <SideNav current={screen} goto={goto} />
      <div style={{ marginLeft: 56 }}>{node}</div>
    </div>
  );

  let body;
  const common = { user, onLogout, goto, theme, notifications };
  if (screen === "users") body = <ScreenUserManagement employees={employees} setEmployees={setEmployees} {...common} />;
  else if (screen === "stock") body = <ScreenStock inventory={inventory} setInventory={setInventory} {...common} />;
  else if (screen === "intake") body = <ScreenIntake jobCards={jobCards} setJobCards={setJobCards} {...common} />;
  else if (screen === "bay") body = <ScreenBay jobCards={jobCards} setJobCards={setJobCards} openCard={openCard} {...common} />;
  else if (screen === "jobcard") body = <ScreenJobCard jobCards={jobCards} setJobCards={setJobCards} jobId={activeJobId} inventory={inventory} employees={employees} {...common} />;
  else if (screen === "pos") body = <ScreenPOS inventory={inventory} setInventory={setInventory} setPendingSale={setPendingSale} {...common} />;
  else if (screen === "checkout") body = <ScreenCheckout pendingSale={pendingSale} setLastReceipt={setLastReceipt} user={user} onLogout={onLogout} goto={goto} theme={theme} />;
  else if (screen === "receipt") body = <ScreenReceipt lastReceipt={lastReceipt} user={user} onLogout={onLogout} goto={goto} theme={theme} />;
  else if (screen === "analytics") body = <ScreenAnalytics inventory={inventory} jobCards={jobCards} {...common} />;
  else if (screen === "customers") body = <ScreenCustomers customers={customers} {...common} />;
  else if (screen === "settings") body = <ScreenSettings business={business} setBusiness={setBusiness} setTheme={setTheme} {...common} />;
  else body = <ScreenBay jobCards={jobCards} setJobCards={setJobCards} openCard={openCard} {...common} />;

  if (screen === "checkout" || screen === "receipt") return body;
  return withNav(body);
}
