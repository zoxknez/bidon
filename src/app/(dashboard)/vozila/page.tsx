import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getVehicles } from "@/actions";
import { Plus, Car, Fuel } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

async function VozilaContent() {
  const vehicles = await getVehicles();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Vozila</h1>
          <p className="text-muted-foreground">Upravljanje vozilima i mašinama</p>
        </div>
        <div className="flex gap-2">
          <Link href="/vozila/tipovi">
            <Button variant="outline">
              Tipovi vozila
            </Button>
          </Link>
          <Link href="/vozila/novo">
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="mr-2 h-4 w-4" />
              Novo vozilo
            </Button>
          </Link>
        </div>
      </div>

      {/* Vehicles Grid */}
      {vehicles.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <Car className="mx-auto h-16 w-16 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">Nema vozila</h3>
              <p className="mt-2 text-muted-foreground">
                Dodajte prvo vozilo za evidenciju točenja
              </p>
              <Link href="/vozila/novo">
                <Button className="mt-4 bg-orange-500 hover:bg-orange-600">
                  <Plus className="mr-2 h-4 w-4" />
                  Dodaj vozilo
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((vehicle) => (
            <Link key={vehicle.id} href={`/vozila/${vehicle.id}`}>
              <Card className="hover:border-orange-500/50 transition-colors cursor-pointer h-full">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{vehicle.name}</CardTitle>
                      <CardDescription>
                        {vehicle.registration || "Bez registracije"}
                      </CardDescription>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                      <Car className="h-5 w-5 text-orange-500" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {vehicle.typeName && (
                      <Badge variant="secondary">{vehicle.typeName}</Badge>
                    )}
                    {vehicle.fuelType && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Fuel className="h-3 w-3" />
                        {vehicle.fuelType}
                      </Badge>
                    )}
                    {vehicle.sectorName && (
                      <Badge variant="outline">{vehicle.sectorName}</Badge>
                    )}
                  </div>
                  {vehicle.notes && (
                    <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                      {vehicle.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function VozilaSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function VozilaPage() {
  return (
    <Suspense fallback={<VozilaSkeleton />}>
      <VozilaContent />
    </Suspense>
  );
}
