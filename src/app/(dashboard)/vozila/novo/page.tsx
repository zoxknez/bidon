"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { createVehicle, getVehicleTypes, getSectors } from "@/actions";
import type { VehicleType, Sector } from "@/lib/db/schema";

export default function NovoVoziloPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    registration: "",
    vehicleTypeId: "",
    sectorId: "",
    fuelType: "dizel",
    notes: "",
  });

  useEffect(() => {
    async function loadData() {
      const [types, sectorList] = await Promise.all([
        getVehicleTypes(),
        getSectors(),
      ]);
      setVehicleTypes(types);
      setSectors(sectorList);
    }
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await createVehicle({
        name: formData.name,
        registration: formData.registration || undefined,
        vehicleTypeId: formData.vehicleTypeId ? parseInt(formData.vehicleTypeId) : undefined,
        sectorId: formData.sectorId ? parseInt(formData.sectorId) : undefined,
        fuelType: formData.fuelType,
        notes: formData.notes || undefined,
      });

      if (result.success) {
        toast.success("Vozilo dodato", {
          description: `${formData.name} je uspešno dodato`,
        });
        router.push("/vozila");
      } else {
        toast.error("Greška", { description: result.error });
      }
    } catch {
      toast.error("Greška", { description: "Došlo je do greške pri dodavanju vozila" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/vozila">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Novo vozilo</h1>
          <p className="text-muted-foreground">Dodajte novo vozilo ili mašinu</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Podaci o vozilu</CardTitle>
          <CardDescription>Unesite osnovne informacije o vozilu</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Naziv vozila *</Label>
              <Input
                id="name"
                placeholder="npr. Traktor IMT 539"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="registration">Registracija</Label>
              <Input
                id="registration"
                placeholder="npr. BG-123-AB"
                value={formData.registration}
                onChange={(e) => setFormData({ ...formData, registration: e.target.value })}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="vehicleType">Tip vozila</Label>
                <Select
                  value={formData.vehicleTypeId}
                  onValueChange={(value) => setFormData({ ...formData, vehicleTypeId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Izaberite tip" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleTypes.map((type) => (
                      <SelectItem key={type.id} value={String(type.id)}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sector">Sektor</Label>
                <Select
                  value={formData.sectorId}
                  onValueChange={(value) => setFormData({ ...formData, sectorId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Izaberite sektor" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectors.map((sector) => (
                      <SelectItem key={sector.id} value={String(sector.id)}>
                        {sector.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <Label htmlFor="notes">Napomena</Label>
              <Textarea
                id="notes"
                placeholder="Dodatne informacije o vozilu..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
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
                    Dodavanje...
                  </>
                ) : (
                  "Dodaj vozilo"
                )}
              </Button>
              <Link href="/vozila">
                <Button type="button" variant="outline">
                  Otkaži
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
