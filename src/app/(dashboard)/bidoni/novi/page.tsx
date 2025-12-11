"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { createContainer } from "@/actions";
import { FuelBidon } from "@/components/fuel-bidon";

export default function NoviBidonPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    capacityLiters: "",
    currentLevel: "",
    fuelType: "dizel",
    location: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await createContainer({
        name: formData.name,
        capacityLiters: parseFloat(formData.capacityLiters),
        currentLevel: parseFloat(formData.currentLevel) || 0,
        fuelType: formData.fuelType,
        location: formData.location || undefined,
      });

      if (result.success) {
        toast.success("Bidon kreiran", {
          description: `${formData.name} je uspešno kreiran`,
        });
        router.push("/bidoni");
      } else {
        toast.error("Greška", { description: result.error });
      }
    } catch {
      toast.error("Greška", { description: "Došlo je do greške pri kreiranju bidona" });
    } finally {
      setIsLoading(false);
    }
  };

  const previewCapacity = parseFloat(formData.capacityLiters) || 1000;
  const previewLevel = parseFloat(formData.currentLevel) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/bidoni">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Novi bidon</h1>
          <p className="text-muted-foreground">Kreirajte novi rezervoar za gorivo</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Podaci o bidonu</CardTitle>
            <CardDescription>Unesite osnovne informacije o rezervoaru</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Naziv bidona *</Label>
                <Input
                  id="name"
                  placeholder="npr. Glavni dizel rezervoar"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="capacityLiters">Kapacitet (litara) *</Label>
                  <Input
                    id="capacityLiters"
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="1000"
                    value={formData.capacityLiters}
                    onChange={(e) => setFormData({ ...formData, capacityLiters: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentLevel">Početna količina (litara)</Label>
                  <Input
                    id="currentLevel"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0"
                    value={formData.currentLevel}
                    onChange={(e) => setFormData({ ...formData, currentLevel: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fuelType">Tip goriva</Label>
                <Select
                  value={formData.fuelType}
                  onValueChange={(value) => setFormData({ ...formData, fuelType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dizel">Dizel</SelectItem>
                    <SelectItem value="benzin">Benzin</SelectItem>
                    <SelectItem value="gas">Gas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Lokacija</Label>
                <Input
                  id="location"
                  placeholder="npr. Ekonomsko dvorište"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Kreiranje...
                    </>
                  ) : (
                    "Kreiraj bidon"
                  )}
                </Button>
                <Link href="/bidoni">
                  <Button type="button" variant="outline">
                    Otkaži
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Pregled</CardTitle>
            <CardDescription>Kako će izgledati vaš bidon</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <FuelBidon
              currentLevel={previewLevel}
              capacity={previewCapacity}
              fuelType={formData.fuelType as "dizel" | "benzin" | "gas"}
              name={formData.name || "Novi bidon"}
              size="lg"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
