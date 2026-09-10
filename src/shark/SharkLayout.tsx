import { useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Radio, LayoutDashboard, Briefcase, Wallet, Scale, Wifi, WifiOff, Handshake, ShieldCheck } from "lucide-react";
import { useShark } from "./store";

const NodeLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 26 26" fill="none" className={className} aria-hidden="true">
    <circle cx="13" cy="5" r="3.4" fill="#3B4EFA" />
    <circle cx="5.5" cy="19" r="3.4" fill="#3B4EFA" />
    <circle cx="20.5" cy="19" r="3.4" fill="#0EA5E9" />
    <path d="M13 8.5L6 16M13 8.5l7 7.5M8.5 19h9" stroke="#3B4EFA" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

const links = [
  { to: "/shark", label: "Lobby", icon: Radio, end: true },
  { to: "/shark/deals", label: "Deal Flow", icon: Handshake },
  { to: "/shark/startup", label: "Pitch Control", icon: LayoutDashboard },
  { to: "/shark/investor", label: "Portfolio", icon: Briefcase },
  { to: "/shark/deposit", label: "Deposit & KYC", icon: Wallet },
  { to: "/shark/legal", label: "Legal", icon: Scale },
  { to: "/shark/admin", label: "Admin", icon: ShieldCheck },
];

export default function SharkLayout() {
  const tick = useShark((s) => s.tick);
  const connected = useShark((s) => s.connected);
  const recover = useShark((s) => s.recover);
  const setConnected = useShark((s) => s.setConnected);

  // mock WebSocket: 1s heartbeat; simulated drop/reconnect with state recovery
  useEffect(() => {
    const t = setInterval(tick, 1000);
    const drop = setInterval(() => {
      setConnected(false);
      setTimeout(() => { setConnected(true); recover(); }, 2500);
    }, 120000);
    return () => { clearInterval(t); clearInterval(drop); };
  }, [tick, recover, setConnected]);

  return (
    <div className="min-h-screen bg-[#111] text-white font-sans">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#111]/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-6 px-4">
          <NavLink to="/shark" className="flex items-center gap-2 font-extrabold tracking-tight">
            <NodeLogo /> Tynio<span className="text-[#3B4EFA]">Tank</span>
          </NavLink>
          <nav className="hidden items-center gap-1 md:flex">
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end}
                className={({ isActive }) => `flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm transition-colors ${isActive ? "bg-[#3B4EFA] text-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
                <Icon className="h-3.5 w-3.5" /> {label}
              </NavLink>
            ))}
          </nav>
          <span className={`ml-auto flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${connected ? "bg-[#00C853]/15 text-[#00C853]" : "bg-[#D50000]/15 text-[#D50000]"}`}>
            {connected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3 animate-pulse" />}
            {connected ? "LIVE FEED" : "RECONNECTING…"}
          </span>
        </div>
        {/* mobile nav */}
        <nav className="flex gap-1 overflow-x-auto border-t border-white/10 px-3 py-2 md:hidden">
          {links.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `whitespace-nowrap rounded-full px-3 py-1 text-xs ${isActive ? "bg-[#3B4EFA]" : "bg-white/5 text-white/70"}`}>{label}</NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-[1400px] px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
