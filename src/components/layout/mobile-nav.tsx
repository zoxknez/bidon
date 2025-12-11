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
} from "lucide-react";
import { SheetClose } from "@/components/ui/sheet";

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

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex h-16 items-center px-4 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-linear-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
            <Fuel className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl bg-linear-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
            Bidon
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/" && pathname.startsWith(item.href));
          
          return (
            <SheetClose asChild key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                  "hover:bg-accent hover:text-accent-foreground",
                  isActive
                    ? "bg-orange-500/10 text-orange-600 font-medium"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5 shrink-0", isActive && "text-orange-500")} />
                <span>{item.title}</span>
              </Link>
            </SheetClose>
          );
        })}
      </nav>
    </div>
  );
}
