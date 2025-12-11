"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart3,
  Car,
  Container,
  MapPin,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Loader2,
  Fuel,
} from "lucide-react";
import {
  getReportByVehicle,
  getReportBySector,
  getReportByContainer,
  getTimeReport,
  getTotalCosts,
} from "@/actions";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#f97316", "#22c55e", "#3b82f6", "#eab308", "#ef4444", "#8b5cf6", "#ec4899"];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("sr-RS", {
    style: "currency",
    currency: "RSD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

type VehicleReport = {
  vehicleId: number;
  vehicleName: string | null;
  vehicleRegistration: string | null;
  totalLiters: string;
  totalPrice: string;
  transactionCount: number;
};

type SectorReport = {
  sectorId: number | null;
  sectorName: string | null;
  totalLiters: string;
  totalPrice: string;
  transactionCount: number;
};

type ContainerReport = {
  containerId: number;
  containerName: string;
  currentLevel: number;
  capacity: number;
  dispensedLiters: number;
  dispensedPrice: number;
  addedLiters: number;
  addedPrice: number;
};

type TimeReportData = {
  transactions: { period: string; liters: number; price: number; count: number }[];
  additions: { period: string; liters: number; price: number }[];
  averagePricePerLiter: number;
};

type TotalCostsData = {
  totalLiters: number;
  totalPrice: number;
  avgPricePerLiter: number;
};

export default function IzvestajiPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<"weekly" | "monthly" | "yearly">("monthly");
  
  const [vehicleReport, setVehicleReport] = useState<VehicleReport[]>([]);
  const [sectorReport, setSectorReport] = useState<SectorReport[]>([]);
  const [containerReport, setContainerReport] = useState<ContainerReport[]>([]);
  const [timeReport, setTimeReport] = useState<TimeReportData | null>(null);
  const [totalCosts, setTotalCosts] = useState<TotalCostsData | null>(null);

  const loadReports = useCallback(async () => {
    setIsLoading(true);
    
    // Izračunaj datume za period
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case "weekly":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "monthly":
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case "yearly":
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    const [vehicles, sectors, containers, time, costs] = await Promise.all([
      getReportByVehicle(startDate, endDate),
      getReportBySector(startDate, endDate),
      getReportByContainer(startDate, endDate),
      getTimeReport(period === "weekly" ? "daily" : period === "monthly" ? "daily" : "monthly", startDate, endDate),
      getTotalCosts(startDate, endDate),
    ]);

    setVehicleReport(vehicles);
    setSectorReport(sectors);
    setContainerReport(containers);
    setTimeReport(time);
    setTotalCosts(costs);
    setIsLoading(false);
  }, [period]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadReports();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadReports]);

  const vehicleChartData = vehicleReport.map((v) => ({
    name: v.vehicleName || "Nepoznato",
    liters: parseFloat(v.totalLiters),
    price: parseFloat(v.totalPrice),
  }));

  const sectorChartData = sectorReport.map((s) => ({
    name: s.sectorName || "Bez sektora",
    value: parseFloat(s.totalLiters),
  }));

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Izveštaji</h1>
          <p className="text-muted-foreground">Pregled potrošnje goriva i troškova</p>
        </div>
        <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Nedeljno</SelectItem>
            <SelectItem value="monthly">Mesečno</SelectItem>
            <SelectItem value="yearly">Godišnje</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ukupno kupljeno</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCosts?.totalLiters.toFixed(1)} L</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(totalCosts?.totalPrice || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ukupno potrošeno</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vehicleReport.reduce((sum, v) => sum + parseFloat(v.totalLiters), 0).toFixed(1)} L
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(vehicleReport.reduce((sum, v) => sum + parseFloat(v.totalPrice), 0))}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prosečna cena</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(totalCosts?.avgPricePerLiter || 0).toFixed(2)} RSD/L
            </div>
            <p className="text-xs text-muted-foreground">
              {period === "weekly" ? "nedeljni" : period === "monthly" ? "mesečni" : "godišnji"} prosek
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transakcija</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vehicleReport.reduce((sum, v) => sum + v.transactionCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              točenja goriva
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="vozila" className="space-y-6">
        <TabsList>
          <TabsTrigger value="vozila">
            <Car className="h-4 w-4 mr-2" />
            Po vozilu
          </TabsTrigger>
          <TabsTrigger value="sektori">
            <MapPin className="h-4 w-4 mr-2" />
            Po sektoru
          </TabsTrigger>
          <TabsTrigger value="bidoni">
            <Container className="h-4 w-4 mr-2" />
            Po bidonu
          </TabsTrigger>
          <TabsTrigger value="vreme">
            <Calendar className="h-4 w-4 mr-2" />
            Vremenski
          </TabsTrigger>
        </TabsList>

        {/* Po vozilu */}
        <TabsContent value="vozila" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Potrošnja po vozilu</CardTitle>
                <CardDescription>Top vozila po potrošnji goriva</CardDescription>
              </CardHeader>
              <CardContent>
                {vehicleChartData.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nema podataka za izabrani period
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={vehicleChartData.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip 
                        formatter={(value: number) => [`${value.toFixed(1)} L`, "Litara"]}
                      />
                      <Bar dataKey="liters" fill="#f97316" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detaljna tabela</CardTitle>
                <CardDescription>Sve vozila sa potrošnjom</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {vehicleReport.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Nema podataka
                    </div>
                  ) : (
                    vehicleReport.map((v, i) => (
                      <div
                        key={v.vehicleId}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                            {i + 1}
                          </Badge>
                          <div>
                            <p className="font-medium">{v.vehicleName || "Nepoznato"}</p>
                            <p className="text-sm text-muted-foreground">
                              {v.transactionCount} točenja
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{parseFloat(v.totalLiters).toFixed(1)} L</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(parseFloat(v.totalPrice))}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Po sektoru */}
        <TabsContent value="sektori" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Potrošnja po sektoru</CardTitle>
                <CardDescription>Raspodela potrošnje goriva</CardDescription>
              </CardHeader>
              <CardContent>
                {sectorChartData.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nema podataka za izabrani period
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={sectorChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {sectorChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`${value.toFixed(1)} L`, "Litara"]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detaljna tabela</CardTitle>
                <CardDescription>Svi sektori sa potrošnjom</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {sectorReport.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Nema podataka
                    </div>
                  ) : (
                    sectorReport.map((s, i) => (
                      <div
                        key={s.sectorId || "none"}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: COLORS[i % COLORS.length] }}
                          />
                          <div>
                            <p className="font-medium">{s.sectorName || "Bez sektora"}</p>
                            <p className="text-sm text-muted-foreground">
                              {s.transactionCount} točenja
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{parseFloat(s.totalLiters).toFixed(1)} L</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(parseFloat(s.totalPrice))}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Po bidonu */}
        <TabsContent value="bidoni" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {containerReport.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="py-8 text-center text-muted-foreground">
                  Nema podataka o bidonima
                </CardContent>
              </Card>
            ) : (
              containerReport.map((c) => (
                <Card key={c.containerId}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Fuel className="h-5 w-5 text-orange-500" />
                      {c.containerName}
                    </CardTitle>
                    <CardDescription>
                      Trenutno: {c.currentLevel.toFixed(1)} / {c.capacity.toFixed(0)} L
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center p-2 rounded bg-green-500/10">
                      <span className="text-sm flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        Dopunjeno
                      </span>
                      <div className="text-right">
                        <span className="font-semibold text-green-600">
                          +{c.addedLiters.toFixed(1)} L
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(c.addedPrice)}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded bg-red-500/10">
                      <span className="text-sm flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-red-500" />
                        Potrošeno
                      </span>
                      <div className="text-right">
                        <span className="font-semibold text-red-600">
                          -{c.dispensedLiters.toFixed(1)} L
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(c.dispensedPrice)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Vremenski */}
        <TabsContent value="vreme" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Potrošnja kroz vreme</CardTitle>
              <CardDescription>
                Pregled dnevne/mesečne potrošnje goriva
              </CardDescription>
            </CardHeader>
            <CardContent>
              {timeReport?.transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nema podataka za izabrani period
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={timeReport?.transactions.map((t) => ({
                      period: t.period,
                      potrošeno: t.liters,
                      cena: t.price,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" fontSize={12} />
                    <YAxis yAxisId="left" fontSize={12} />
                    <YAxis yAxisId="right" orientation="right" fontSize={12} />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        name === "potrošeno" ? `${value.toFixed(1)} L` : formatCurrency(value),
                        name === "potrošeno" ? "Litara" : "Cena",
                      ]}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="potrošeno" fill="#f97316" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {timeReport && (
            <Card>
              <CardHeader>
                <CardTitle>Prosečna cena goriva</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <p className="text-4xl font-bold text-orange-500">
                    {timeReport.averagePricePerLiter.toFixed(2)} RSD/L
                  </p>
                  <p className="text-muted-foreground mt-2">
                    Prosečna cena za izabrani period
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
