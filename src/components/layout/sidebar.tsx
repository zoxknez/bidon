"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Container,
  Car,
  MapPin,
  BarChart3,
  Settings,
  Fuel,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navItems = [
  {
    title: "Kontrolna tabla",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Bidoni",
    href: "/bidoni",
    icon: Container,
  },
  {
    title: "Točenje goriva",
    href: "/tocenje",
    icon: Fuel,
  },
  {
    title: "Vozila",
    href: "/vozila",
    icon: Car,
  },
  {
    title: "Sektori",
    href: "/sektori",
    icon: MapPin,
  },
  {
    title: "Izveštaji",
    href: "/izvestaji",
    icon: BarChart3,
  },
  {
    title: "Podešavanja",
    href: "/podesavanja",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-card border-r border-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-border">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Fuel className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              Bidon
            </span>
          </Link>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mx-auto">
            <Fuel className="w-5 h-5 text-white" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/" && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                "hover:bg-accent hover:text-accent-foreground",
                isActive
                  ? "bg-orange-500/10 text-orange-600 font-medium"
                  : "text-muted-foreground"
              )}
              title={collapsed ? item.title : undefined}
            >
              <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-orange-500")} />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse button */}
      <div className="absolute bottom-4 left-0 right-0 px-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-center"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 mr-2" />
              <span>Skupi</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
