"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { ArrowLeft, Plus, Trash2, Loader2, Car, Tractor, Truck } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { getVehicleTypes, createVehicleType, deleteVehicleType } from "@/actions";
import type { VehicleType } from "@/lib/db/schema";

// Alert Dialog Components
function AlertDialogComponent({
  children,
  ...props
}: React.ComponentProps<typeof AlertDialog>) {
  return <AlertDialog {...props}>{children}</AlertDialog>;
}

export default function TipoviVozilaPage() {
  const [types, setTypes] = useState<VehicleType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadTypes = async () => {
    setIsLoading(true);
    const data = await getVehicleTypes();
    setTypes(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadTypes();
  }, []);

  const handleAddType = async () => {
    if (!newTypeName.trim()) return;
    setIsAdding(true);

    try {
      const result = await createVehicleType({ name: newTypeName.trim() });
      if (result.success) {
        toast.success("Tip vozila dodat", {
          description: `${newTypeName} je uspešno dodat`,
        });
        setNewTypeName("");
        setDialogOpen(false);
        loadTypes();
      } else {
        toast.error("Greška", { description: result.error });
      }
    } catch {
      toast.error("Greška", { description: "Došlo je do greške" });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteType = async (id: number, name: string) => {
    try {
      const result = await deleteVehicleType(id);
      if (result.success) {
        toast.success("Tip vozila obrisan", {
          description: `${name} je uspešno obrisan`,
        });
        loadTypes();
      } else {
        toast.error("Greška", { description: result.error });
      }
    } catch {
      toast.error("Greška", { description: "Došlo je do greške" });
    }
  };

  const getTypeIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("traktor") || lowerName.includes("kultivator")) {
      return <Tractor className="h-5 w-5" />;
    }
    if (lowerName.includes("kamion") || lowerName.includes("kombajn")) {
      return <Truck className="h-5 w-5" />;
    }
    return <Car className="h-5 w-5" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/vozila">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Tipovi vozila</h1>
            <p className="text-muted-foreground">Upravljanje tipovima vozila i mašina</p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="mr-2 h-4 w-4" />
              Dodaj tip vozila
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novi tip vozila</DialogTitle>
              <DialogDescription>
                Dodajte novi tip vozila ili mašine
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="typeName">Naziv tipa</Label>
                <Input
                  id="typeName"
                  placeholder="npr. Kombajn, Motorna pila..."
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddType();
                    }
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Otkaži
              </Button>
              <Button
                onClick={handleAddType}
                disabled={isAdding || !newTypeName.trim()}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {isAdding ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Dodavanje...
                  </>
                ) : (
                  "Dodaj"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Types List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista tipova</CardTitle>
          <CardDescription>
            Sistemski tipovi se ne mogu obrisati
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : types.length === 0 ? (
            <div className="text-center py-8">
              <Car className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-muted-foreground">Nema tipova vozila</p>
            </div>
          ) : (
            <div className="space-y-2">
              {types.map((type) => (
                <div
                  key={type.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                      {getTypeIcon(type.name)}
                    </div>
                    <div>
                      <p className="font-medium">{type.name}</p>
                      {type.isSystem && (
                        <Badge variant="secondary" className="mt-1">
                          Sistemski
                        </Badge>
                      )}
                    </div>
                  </div>
                  {!type.isSystem && (
                    <AlertDialogComponent>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-500/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Obrisati tip vozila?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Da li ste sigurni da želite obrisati tip &quot;{type.name}&quot;? Ova akcija se ne može poništiti.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Otkaži</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteType(type.id, type.name)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Obriši
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialogComponent>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
