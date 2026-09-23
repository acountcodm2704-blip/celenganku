import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { PiggyBank, House, Wallet, ChartColumn, Menu, X } from "lucide-react";

const MENU_ITEMS = [
  { path: "/", label: "Home", icon: House },
  { path: "/rekening", label: "Rekening", icon: Wallet },
  { path: "/ringkasan", label: "Ringkasan", icon: ChartColumn },
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const [expanded, setExpanded] = useState(() => {
    return localStorage.getItem("sidebarExpanded") === "true";
  });

  const toggleExpanded = () => {
    setExpanded((prev) => {
      const next = !prev;
      localStorage.setItem("sidebarExpanded", next.toString());
      return next;
    });
  };

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const renderMenu = (onItemClick, showLabel) => (
    <nav className="p-3 flex flex-col gap-2">
      {MENU_ITEMS.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={onItemClick}
            title={item.label}
            className="nb-btn px-3 py-3 flex items-center gap-3 overflow-hidden"
            style={{ background: isActive ? "var(--yellow)" : "var(--white)" }}
          >
            <Icon size={20} strokeWidth={2.5} className="flex-shrink-0" />
            <span
              className="font-bold whitespace-nowrap transition-opacity duration-200"
              style={{ opacity: showLabel ? 1 : 0 }}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* ===== MOBILE: drawer overlay ===== */}
      <div className="lg:hidden">
        {isOpen && (
          <div
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.5)" }}
          />
        )}
        <div
          className="fixed top-0 left-0 h-full z-50 transition-transform duration-300"
          style={{
            width: 260,
            background: "var(--white)",
            borderRight: "4px solid black",
            transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          }}
        >
          <div
            className="flex items-center justify-between p-4"
            style={{ borderBottom: "3px solid black", background: "var(--yellow)" }}
          >
            <p className="font-bold text-lg flex items-center gap-2">
              <PiggyBank size={22} strokeWidth={2.5} /> Celenganku
            </p>
            <button onClick={onClose} className="nb-btn px-2 py-1 text-sm" style={{ background: "var(--white)" }}>
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>
          {renderMenu(onClose, true)}
        </div>
      </div>

      {/* ===== DESKTOP: rail ikon permanen, bisa expand ===== */}
      <div
        className="hidden lg:block fixed top-0 left-0 h-full z-30 transition-all duration-300 overflow-hidden"
        style={{
          width: expanded ? 220 : 76,
          background: "var(--white)",
          borderRight: "4px solid black",
        }}
      >
        <div
          className="flex items-center justify-start p-3"
          style={{ borderBottom: "3px solid black", background: "var(--yellow)" }}
        >
          <button
            onClick={toggleExpanded}
            className="nb-btn px-2 py-2"
            style={{ background: "var(--white)" }}
            title={expanded ? "Ciutkan" : "Perluas"}
          >
            <Menu size={18} strokeWidth={2.5} />
          </button>
        </div>
        {renderMenu(undefined, expanded)}
      </div>
    </>
  );
}