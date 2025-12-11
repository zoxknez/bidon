"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Calculator } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { addFuelToContainer } from "@/actions";

interface DopunaPageProps {
  params: Promise<{ id: string }>;
}

export default function DopunaPage({ params }: DopunaPageProps) {
  const { id } = use(params);
  const bidonId = parseInt(id);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    quantityLiters: "",
    pricePerLiter: "",
    supplier: "",
    receiptNumber: "",
    notes: "",
  });

  const quantity = parseFloat(formData.quantityLiters) || 0;
  const pricePerLiter = parseFloat(formData.pricePerLiter) || 0;
  const totalPrice = quantity * pricePerLiter;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await addFuelToContainer({
        containerId: bidonId,
        quantityLiters: quantity,
        pricePerLiter: pricePerLiter,
        supplier: formData.supplier || undefined,
        receiptNumber: formData.receiptNumber || undefined,
        notes: formData.notes || undefined,
      });

      if (result.success) {
        toast.success("Dopuna evidentirana", {
          description: `Dodato ${quantity.toFixed(1)} L goriva`,
        });
        router.push(`/bidoni/${bidonId}`);
      } else {
        toast.error("Greška", { description: result.error });
      }
    } catch {
      toast.error("Greška", { description: "Došlo je do greške pri dopuni" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/bidoni/${bidonId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Dopuna goriva</h1>
          <p className="text-muted-foreground">Evidentirajte novu dopunu rezervoara</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Podaci o dopuni</CardTitle>
            <CardDescription>Unesite informacije o dopuni goriva</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="quantityLiters">Količina (litara) *</Label>
                  <Input
                    id="quantityLiters"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={formData.quantityLiters}
                    onChange={(e) =>
                      setFormData({ ...formData, quantityLiters: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pricePerLiter">Cena po litru (RSD) *</Label>
                  <Input
                    id="pricePerLiter"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={formData.pricePerLiter}
                    onChange={(e) =>
                      setFormData({ ...formData, pricePerLiter: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier">Dobavljač</Label>
                <Input
                  id="supplier"
                  placeholder="npr. NIS, MOL, Lukoil..."
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="receiptNumber">Broj računa</Label>
                <Input
                  id="receiptNumber"
                  placeholder="npr. 12345-2024"
                  value={formData.receiptNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, receiptNumber: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Napomena</Label>
                <Textarea
                  id="notes"
                  placeholder="Dodatne informacije..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700"
                  disabled={isLoading || !quantity || !pricePerLiter}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Evidentiranje...
                    </>
                  ) : (
                    "Evidentiraj dopunu"
                  )}
                </Button>
                <Link href={`/bidoni/${bidonId}`}>
                  <Button type="button" variant="outline">
                    Otkaži
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Kalkulacija
            </CardTitle>
            <CardDescription>Pregled troškova dopune</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-6 rounded-lg bg-muted/50 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Količina:</span>
                <span className="font-medium">{quantity.toFixed(2)} L</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Cena po litru:</span>
                <span className="font-medium">{pricePerLiter.toFixed(2)} RSD</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Ukupno za platiti:</span>
                  <span className="text-2xl font-bold text-green-600">
                    {new Intl.NumberFormat("sr-RS", {
                      style: "currency",
                      currency: "RSD",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(totalPrice)}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>
                Nakon potvrde, stanje bidona će biti uvećano za{" "}
                <strong>{quantity.toFixed(2)} litara</strong>.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
