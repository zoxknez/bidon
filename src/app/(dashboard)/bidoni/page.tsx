import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FuelBidon } from "@/components/fuel-bidon";
import { getContainers } from "@/actions";
import { Plus, Container } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

async function BidoniContent() {
  const containers = await getContainers();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Bidoni</h1>
          <p className="text-muted-foreground">Upravljanje rezervoarima goriva</p>
        </div>
        <Link href="/bidoni/novi">
          <Button className="bg-orange-500 hover:bg-orange-600">
            <Plus className="mr-2 h-4 w-4" />
            Novi bidon
          </Button>
        </Link>
      </div>

      {/* Bidoni Grid */}
      {containers.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <Container className="mx-auto h-16 w-16 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">Nema bidona</h3>
              <p className="mt-2 text-muted-foreground">
                Kreirajte prvi bidon za praćenje goriva
              </p>
              <Link href="/bidoni/novi">
                <Button className="mt-4 bg-orange-500 hover:bg-orange-600">
                  <Plus className="mr-2 h-4 w-4" />
                  Kreiraj bidon
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {containers.map((container) => (
            <Link key={container.id} href={`/bidoni/${container.id}`}>
              <Card className="hover:border-orange-500/50 transition-colors cursor-pointer">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{container.name}</CardTitle>
                  <CardDescription>
                    {container.location || "Lokacija nije definisana"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center py-4">
                  <FuelBidon
                    currentLevel={parseFloat(container.currentLevel || "0")}
                    capacity={parseFloat(container.capacityLiters || "0")}
                    fuelType={container.fuelType as "dizel" | "benzin" | "gas"}
                    name=""
                    showDetails={true}
                    size="md"
                  />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function BidoniSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent className="flex justify-center py-4">
              <Skeleton className="h-48 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function BidoniPage() {
  return (
    <Suspense fallback={<BidoniSkeleton />}>
      <BidoniContent />
    </Suspense>
  );
}
