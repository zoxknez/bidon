import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FuelBidon } from "@/components/fuel-bidon";
import { getContainer, getContainerAdditions } from "@/actions";
import { ArrowLeft, Plus, TrendingUp, MapPin, Calendar } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
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

interface BidonDetailPageProps {
  params: Promise<{ id: string }>;
}

async function BidonDetailContent({ id }: { id: number }) {
  const [container, additions] = await Promise.all([
    getContainer(id),
    getContainerAdditions(id),
  ]);

  if (!container) {
    notFound();
  }

  const currentLevel = parseFloat(container.currentLevel || "0");
  const capacity = parseFloat(container.capacityLiters || "0");

  // Izračunaj prosečnu cenu po litru
  const totalLiters = additions.reduce(
    (sum, a) => sum + parseFloat(a.quantityLiters || "0"),
    0
  );
  const totalPrice = additions.reduce(
    (sum, a) => sum + parseFloat(a.totalPrice || "0"),
    0
  );
  const avgPricePerLiter = totalLiters > 0 ? totalPrice / totalLiters : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/bidoni">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{container.name}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              {container.location && (
                <>
                  <MapPin className="h-4 w-4" />
                  <span>{container.location}</span>
                </>
              )}
              <Badge variant="secondary" className="ml-2">
                {container.fuelType}
              </Badge>
            </div>
          </div>
        </div>
        <Link href={`/bidoni/${id}/dopuna`}>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" />
            Dopuni gorivo
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Bidon Visual */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Stanje rezervoara</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center py-4">
            <FuelBidon
              currentLevel={currentLevel}
              capacity={capacity}
              fuelType={container.fuelType as "dizel" | "benzin" | "gas"}
              name=""
              size="lg"
            />
          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Statistike</CardTitle>
            <CardDescription>Pregled dopuna i potrošnje</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Trenutno stanje</p>
                <p className="text-2xl font-bold">
                  {currentLevel.toFixed(1)} L
                </p>
                <p className="text-sm text-muted-foreground">
                  od {capacity.toFixed(0)} L kapaciteta
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Prosečna cena</p>
                <p className="text-2xl font-bold">
                  {avgPricePerLiter.toFixed(2)} RSD/L
                </p>
                <p className="text-sm text-muted-foreground">
                  ukupno dopunjeno {totalLiters.toFixed(0)} L
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Ukupno utrošeno</p>
                <p className="text-2xl font-bold">{formatCurrency(totalPrice)}</p>
                <p className="text-sm text-muted-foreground">
                  za {additions.length} dopuna
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Poslednja dopuna</p>
                <p className="text-2xl font-bold">
                  {additions[0]
                    ? parseFloat(additions[0].quantityLiters || "0").toFixed(1) + " L"
                    : "—"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {additions[0]?.addedAt
                    ? format(new Date(additions[0].addedAt), "dd.MM.yyyy", { locale: sr })
                    : "Nema dopuna"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additions History */}
      <Card>
        <CardHeader>
          <CardTitle>Istorija dopuna</CardTitle>
          <CardDescription>Sve dopune goriva za ovaj bidon</CardDescription>
        </CardHeader>
        <CardContent>
          {additions.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-muted-foreground">Nema evidentiranih dopuna</p>
              <Link href={`/bidoni/${id}/dopuna`}>
                <Button variant="outline" className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Evidentiraj prvu dopunu
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {additions.map((addition) => (
                <div
                  key={addition.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium">
                        +{parseFloat(addition.quantityLiters || "0").toFixed(1)} L
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {addition.supplier || "Nepoznat dobavljač"}
                        {addition.receiptNumber && ` • Račun: ${addition.receiptNumber}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(parseFloat(addition.totalPrice || "0"))}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 justify-end">
                      <Calendar className="h-3 w-3" />
                      {addition.addedAt
                        ? format(new Date(addition.addedAt), "dd.MM.yyyy HH:mm", {
                            locale: sr,
                          })
                        : "—"}
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

function BidonDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div>
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-32 mt-2" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="flex justify-center py-4">
            <Skeleton className="h-60 w-40" />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default async function BidonDetailPage({ params }: BidonDetailPageProps) {
  const { id } = await params;
  const bidonId = parseInt(id);

  if (isNaN(bidonId)) {
    notFound();
  }

  return (
    <Suspense fallback={<BidonDetailSkeleton />}>
      <BidonDetailContent id={bidonId} />
    </Suspense>
  );
}
