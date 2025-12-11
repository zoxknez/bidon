"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Fuel, Loader2, TrendingDown, Calendar, Car, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  getContainers,
  getVehicles,
  getSectors,
  dispenseFuel,
  getTransactions,
  deleteTransaction,
} from "@/actions";
import type { FuelContainer, Sector } from "@/lib/db/schema";
import { FuelBidon } from "@/components/fuel-bidon";
import { formatDistanceToNow } from "date-fns";
import { sr } from "date-fns/locale";

type VehicleWithDetails = {
  id: number;
  name: string;
  registration: string | null;
  vehicleTypeId: number | null;
  sectorId: number | null;
  fuelType: string | null;
  notes: string | null;
  isActive: boolean | null;
  createdAt: Date | null;
  typeName: string | null;
  sectorName: string | null;
};

type TransactionWithDetails = {
  id: number;
  containerId: number;
  vehicleId: number;
  sectorId: number | null;
  quantityLiters: string | null;
  pricePerLiter: string | null;
  totalPrice: string | null;
  odometerReading: number | null;
  operatorName: string | null;
  notes: string | null;
  transactionAt: Date | null;
  containerName: string | null;
  vehicleName: string | null;
  sectorName: string | null;
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("sr-RS", {
    style: "currency",
    currency: "RSD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function TocenjePage() {
  const [containers, setContainers] = useState<FuelContainer[]>([]);
  const [vehicles, setVehicles] = useState<VehicleWithDetails[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDispensing, setIsDispensing] = useState(false);

  const [formData, setFormData] = useState({
    containerId: "",
    vehicleId: "",
    sectorId: "",
    quantityLiters: "",
    odometerReading: "",
    operatorName: "",
    notes: "",
  });

  const loadData = async () => {
    setIsLoading(true);
    const [containersData, vehiclesData, sectorsData, transactionsData] = await Promise.all([
      getContainers(),
      getVehicles(),
      getSectors(),
      getTransactions(20),
    ]);
    setContainers(containersData);
    setVehicles(vehiclesData);
    setSectors(sectorsData);
    setTransactions(transactionsData);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedContainer = containers.find(
    (c) => c.id === parseInt(formData.containerId)
  );
  const selectedVehicle = vehicles.find(
    (v) => v.id === parseInt(formData.vehicleId)
  );

  // Auto-select sector from vehicle
  useEffect(() => {
    if (selectedVehicle?.sectorId && !formData.sectorId) {
      setFormData((prev) => ({
        ...prev,
        sectorId: String(selectedVehicle.sectorId),
      }));
    }
  }, [selectedVehicle, formData.sectorId]);

  const handleDispense = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.containerId || !formData.vehicleId || !formData.quantityLiters) {
      toast.error("Greška", { description: "Popunite sva obavezna polja" });
      return;
    }

    const quantity = parseFloat(formData.quantityLiters);
    if (quantity <= 0) {
      toast.error("Greška", { description: "Količina mora biti veća od 0" });
      return;
    }

    if (selectedContainer) {
      const currentLevel = parseFloat(selectedContainer.currentLevel || "0");
      if (quantity > currentLevel) {
        toast.error("Greška", {
          description: `Nema dovoljno goriva. Dostupno: ${currentLevel.toFixed(1)} L`,
        });
        return;
      }
    }

    setIsDispensing(true);

    try {
      const result = await dispenseFuel({
        containerId: parseInt(formData.containerId),
        vehicleId: parseInt(formData.vehicleId),
        sectorId: formData.sectorId ? parseInt(formData.sectorId) : undefined,
        quantityLiters: quantity,
        odometerReading: formData.odometerReading
          ? parseInt(formData.odometerReading)
          : undefined,
        operatorName: formData.operatorName || undefined,
        notes: formData.notes || undefined,
      });

      if (result.success) {
        toast.success("Gorivo natočeno", {
          description: `${quantity.toFixed(1)} L natočeno u ${selectedVehicle?.name}`,
        });
        setFormData({
          containerId: formData.containerId,
          vehicleId: "",
          sectorId: "",
          quantityLiters: "",
          odometerReading: "",
          operatorName: "",
          notes: "",
        });
        loadData();
      } else {
        toast.error("Greška", { description: result.error });
      }
    } catch {
      toast.error("Greška", { description: "Došlo je do greške pri točenju" });
    } finally {
      setIsDispensing(false);
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    try {
      const result = await deleteTransaction(id);
      if (result.success) {
        toast.success("Transakcija obrisana", {
          description: "Gorivo je vraćeno u bidon",
        });
        loadData();
      } else {
        toast.error("Greška", { description: result.error });
      }
    } catch {
      toast.error("Greška", { description: "Došlo je do greške" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Točenje goriva</h1>
        <p className="text-muted-foreground">Evidentirajte izdavanje goriva iz bidona</p>
      </div>

      <Tabs defaultValue="tocenje" className="space-y-6">
        <TabsList>
          <TabsTrigger value="tocenje">Novo točenje</TabsTrigger>
          <TabsTrigger value="istorija">Istorija ({transactions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="tocenje" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Form */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fuel className="h-5 w-5 text-orange-500" />
                  Podaci o točenju
                </CardTitle>
                <CardDescription>
                  Izaberite bidon, vozilo i unesite količinu
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleDispense} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="containerId">Bidon *</Label>
                    <Select
                      value={formData.containerId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, containerId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Izaberite bidon" />
                      </SelectTrigger>
                      <SelectContent>
                        {containers.map((container) => (
                          <SelectItem key={container.id} value={String(container.id)}>
                            {container.name} ({parseFloat(container.currentLevel || "0").toFixed(1)} L)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vehicleId">Vozilo *</Label>
                    <Select
                      value={formData.vehicleId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, vehicleId: value, sectorId: "" })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Izaberite vozilo" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={String(vehicle.id)}>
                            {vehicle.name} {vehicle.registration && `(${vehicle.registration})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="quantityLiters">Količina (litara) *</Label>
                      <Input
                        id="quantityLiters"
                        type="number"
                        step="0.1"
                        min="0.1"
                        placeholder="0.0"
                        value={formData.quantityLiters}
                        onChange={(e) =>
                          setFormData({ ...formData, quantityLiters: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sectorId">Sektor</Label>
                      <Select
                        value={formData.sectorId}
                        onValueChange={(value) =>
                          setFormData({ ...formData, sectorId: value })
                        }
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

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="odometerReading">Stanje km/h</Label>
                      <Input
                        id="odometerReading"
                        type="number"
                        min="0"
                        placeholder="Opciono"
                        value={formData.odometerReading}
                        onChange={(e) =>
                          setFormData({ ...formData, odometerReading: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="operatorName">Operater</Label>
                      <Input
                        id="operatorName"
                        placeholder="Ko je točio gorivo"
                        value={formData.operatorName}
                        onChange={(e) =>
                          setFormData({ ...formData, operatorName: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Napomena</Label>
                    <Textarea
                      id="notes"
                      placeholder="Dodatne informacije..."
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      rows={2}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600"
                    disabled={
                      isDispensing ||
                      !formData.containerId ||
                      !formData.vehicleId ||
                      !formData.quantityLiters
                    }
                  >
                    {isDispensing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Točenje...
                      </>
                    ) : (
                      <>
                        <Fuel className="mr-2 h-4 w-4" />
                        Toči gorivo
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Preview */}
            <div className="space-y-4">
              {selectedContainer && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Izabrani bidon</CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <FuelBidon
                      currentLevel={parseFloat(selectedContainer.currentLevel || "0")}
                      capacity={parseFloat(selectedContainer.capacityLiters || "0")}
                      fuelType={selectedContainer.fuelType as "dizel" | "benzin" | "gas"}
                      name={selectedContainer.name}
                      size="sm"
                    />
                  </CardContent>
                </Card>
              )}

              {selectedVehicle && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Izabrano vozilo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                        <Car className="h-5 w-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="font-medium">{selectedVehicle.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedVehicle.registration || "Bez registracije"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      {selectedVehicle.typeName && (
                        <Badge variant="secondary">{selectedVehicle.typeName}</Badge>
                      )}
                      {selectedVehicle.fuelType && (
                        <Badge variant="outline">{selectedVehicle.fuelType}</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="istorija">
          <Card>
            <CardHeader>
              <CardTitle>Istorija točenja</CardTitle>
              <CardDescription>Poslednje transakcije točenja goriva</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <Fuel className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-2 text-muted-foreground">Nema transakcija</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                          <TrendingDown className="h-5 w-5 text-red-500" />
                        </div>
                        <div>
                          <p className="font-medium">{tx.vehicleName || "Nepoznato"}</p>
                          <p className="text-sm text-muted-foreground">
                            {tx.containerName} → {tx.sectorName || "Bez sektora"}
                          </p>
                          {tx.operatorName && (
                            <p className="text-xs text-muted-foreground">
                              Operater: {tx.operatorName}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold text-red-500">
                            -{parseFloat(tx.quantityLiters || "0").toFixed(1)} L
                          </p>
                          {tx.totalPrice && (
                            <p className="text-sm text-muted-foreground">
                              {formatCurrency(parseFloat(tx.totalPrice))}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                            <Calendar className="h-3 w-3" />
                            {tx.transactionAt
                              ? formatDistanceToNow(new Date(tx.transactionAt), {
                                  addSuffix: true,
                                  locale: sr,
                                })
                              : "—"}
                          </p>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Obrisati transakciju?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Gorivo će biti vraćeno u bidon. Da li ste sigurni?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Otkaži</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteTransaction(tx.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Obriši
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
