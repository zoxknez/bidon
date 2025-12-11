import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FuelBidon } from "@/components/fuel-bidon";
import { getContainers, getDashboardStats, getTransactions } from "@/actions";
import { Fuel, TrendingDown, TrendingUp, Activity, Plus, Container } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { sr } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("sr-RS", {
    style: "currency",
    currency: "RSD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

async function DashboardContent() {
  const [containers, stats, recentTransactions] = await Promise.all([
    getContainers(),
    getDashboardStats(),
    getTransactions(5),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Kontrolna tabla</h1>
          <p className="text-muted-foreground">Pregled stanja goriva i aktivnosti</p>
        </div>
        <div className="flex gap-2">
          <Link href="/tocenje">
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Fuel className="mr-2 h-4 w-4" />
              Toči gorivo
            </Button>
          </Link>
          <Link href="/bidoni/novi">
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Novi bidon
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ukupno goriva</CardTitle>
            <Container className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFuel.toFixed(1)} L</div>
            <p className="text-xs text-muted-foreground">
              od {stats.totalCapacity.toFixed(0)} L kapaciteta
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Točeno ovog meseca</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.monthlyDispensed.toFixed(1)} L</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats.monthlyDispensedPrice)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dopunjeno ovog meseca</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.monthlyAdded.toFixed(1)} L</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats.monthlyAddedPrice)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transakcija ovog meseca</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.monthlyTransactionsCount}</div>
            <p className="text-xs text-muted-foreground">točenja goriva</p>
          </CardContent>
        </Card>
      </div>

      {/* Bidoni */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Bidoni</CardTitle>
              <CardDescription>Pregled stanja svih rezervoara</CardDescription>
            </div>
            <Link href="/bidoni">
              <Button variant="ghost" size="sm">
                Prikaži sve →
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {containers.length === 0 ? (
            <div className="text-center py-8">
              <Container className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-muted-foreground">Nema kreiranih bidona</p>
              <Link href="/bidoni/novi">
                <Button variant="outline" className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Kreiraj prvi bidon
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-wrap gap-8 justify-center md:justify-start">
              {containers.map((container) => (
                <Link key={container.id} href={`/bidoni/${container.id}`}>
                  <FuelBidon
                    currentLevel={parseFloat(container.currentLevel || "0")}
                    capacity={parseFloat(container.capacityLiters || "0")}
                    fuelType={container.fuelType as "dizel" | "benzin" | "gas"}
                    name={container.name}
                    size="md"
                  />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Poslednje transakcije</CardTitle>
              <CardDescription>Nedavna točenja goriva</CardDescription>
            </div>
            <Link href="/tocenje">
              <Button variant="ghost" size="sm">
                Prikaži sve →
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <div className="text-center py-8">
              <Fuel className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-muted-foreground">Nema transakcija</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                      <TrendingDown className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <p className="font-medium">{tx.vehicleName || "Nepoznato vozilo"}</p>
                      <p className="text-sm text-muted-foreground">
                        {tx.containerName} → {tx.sectorName || "Bez sektora"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-500">
                      -{parseFloat(tx.quantityLiters || "0").toFixed(1)} L
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {tx.transactionAt
                        ? formatDistanceToNow(new Date(tx.transactionAt), {
                            addSuffix: true,
                            locale: sr,
                          })
                        : "Nepoznato"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-3 w-32 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-24" />
        </CardHeader>
        <CardContent>
          <div className="flex gap-8">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 w-32" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
