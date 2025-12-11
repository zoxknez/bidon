"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  User,
  Bell,
  Palette,
  Database,
  Info,
  Check,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export default function PodesavanjaPage() {
  const [isSaving, setIsSaving] = useState(false);
  
  // Podešavanja (u produkciji bi se čuvala u bazi)
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [lowFuelAlert, setLowFuelAlert] = useState(20);

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulacija čuvanja
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Podešavanja sačuvana", {
      description: "Vaša podešavanja su uspešno sačuvana.",
    });
    
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Podešavanja</h1>
        <p className="text-muted-foreground">Upravljajte podešavanjima aplikacije</p>
      </div>

      <div className="grid gap-6">
        {/* Nalog */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Nalog
            </CardTitle>
            <CardDescription>
              Informacije o vašem nalogu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium">Korisničko ime</p>
                <p className="text-sm text-muted-foreground">user</p>
              </div>
              <Badge>Administrator</Badge>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Trenutna lozinka</Label>
                <Input
                  id="current-password"
                  type="password"
                  placeholder="••••••••"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nova lozinka</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Potvrdi lozinku</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <Button variant="outline" size="sm">
                Promeni lozinku
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Izgled */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Izgled
            </CardTitle>
            <CardDescription>
              Prilagodite izgled aplikacije
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode">Tamni režim</Label>
                <p className="text-sm text-muted-foreground">
                  Koristi tamnu temu za aplikaciju
                </p>
              </div>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>
          </CardContent>
        </Card>

        {/* Obaveštenja */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Obaveštenja
            </CardTitle>
            <CardDescription>
              Upravljajte obaveštenjima
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">Sistemska obaveštenja</Label>
                <p className="text-sm text-muted-foreground">
                  Primajte obaveštenja o aktivnostima
                </p>
              </div>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label htmlFor="low-fuel">Upozorenje za nizak nivo goriva (%)</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="low-fuel"
                  type="number"
                  min={5}
                  max={50}
                  value={lowFuelAlert}
                  onChange={(e) => setLowFuelAlert(parseInt(e.target.value) || 20)}
                  className="w-24"
                />
                <p className="text-sm text-muted-foreground">
                  Dobićete upozorenje kada nivo padne ispod {lowFuelAlert}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Baza podataka */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Podaci
            </CardTitle>
            <CardDescription>
              Upravljanje podacima
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium">Baza podataka</p>
                <p className="text-sm text-muted-foreground">Vercel Postgres</p>
              </div>
              <Badge variant="outline" className="text-green-600">
                <Check className="h-3 w-3 mr-1" />
                Povezano
              </Badge>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Izvezi podatke
              </Button>
              <Button variant="destructive" size="sm">
                Obriši sve podatke
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* O aplikaciji */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              O aplikaciji
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Verzija</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Framework</span>
                <span className="font-medium">Next.js 15</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Baza podataka</span>
                <span className="font-medium">Vercel Postgres + Drizzle</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">PWA</span>
                <Badge variant="secondary">Omogućeno</Badge>
              </div>
            </div>
            
            <Separator />
            
            <p className="text-sm text-muted-foreground text-center">
              Bidon - Aplikacija za praćenje goriva
              <br />
              © 2024 Sva prava zadržana
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Dugme za čuvanje */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Čuvanje...
            </>
          ) : (
            <>
              <Settings className="h-4 w-4 mr-2" />
              Sačuvaj podešavanja
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
