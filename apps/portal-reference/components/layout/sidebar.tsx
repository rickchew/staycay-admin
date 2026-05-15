"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  Building2,
  BedDouble,
  Sparkles,
  CreditCard,
  Users,
  Settings,
  ChevronRight,
  Hotel,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Bookings", href: "/bookings", icon: CalendarCheck },
  { label: "Properties", href: "/properties", icon: Building2 },
  { label: "Listings", href: "/listings", icon: BedDouble },
  { label: "Cleaning", href: "/cleaning", icon: Sparkles },
  { label: "Payments", href: "/payments", icon: CreditCard },
  { label: "Users", href: "/users", icon: Users },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-sidebar-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Hotel className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-none">Staycay</p>
          <p className="text-xs text-sidebar-foreground/60 mt-0.5">Admin Portal</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
              {active && <ChevronRight className="ml-auto h-3 w-3" />}
            </Link>
          );
        })}
      </nav>

      {/* Merchant tag */}
      <div className="border-t border-sidebar-border p-4">
        <div className="rounded-md bg-sidebar-accent/40 px-3 py-2">
          <p className="text-xs font-medium text-sidebar-foreground/60">Merchant</p>
          <p className="text-sm font-semibold truncate">Hillview Suites KL</p>
          <p className="text-xs text-sidebar-foreground/50 truncate">MERCHANT_OWNER</p>
        </div>
      </div>
    </aside>
  );
}
