"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Trash2, Loader2, MapPin, Edit } from "lucide-react";
import { toast } from "sonner";
import { getSectors, createSector, updateSector, deleteSector } from "@/actions";
import type { Sector } from "@/lib/db/schema";

export default function SektoriPage() {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newSector, setNewSector] = useState({ name: "", description: "" });
  const [editingSector, setEditingSector] = useState<Sector | null>(null);

  const loadSectors = async () => {
    setIsLoading(true);
    const data = await getSectors();
    setSectors(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadSectors();
  }, []);

  const handleAddSector = async () => {
    if (!newSector.name.trim()) return;
    setIsAdding(true);

    try {
      const result = await createSector({
        name: newSector.name.trim(),
        description: newSector.description.trim() || undefined,
      });
      if (result.success) {
        toast.success("Sektor dodat", {
          description: `${newSector.name} je uspešno dodat`,
        });
        setNewSector({ name: "", description: "" });
        setDialogOpen(false);
        loadSectors();
      } else {
        toast.error("Greška", { description: result.error });
      }
    } catch {
      toast.error("Greška", { description: "Došlo je do greške" });
    } finally {
      setIsAdding(false);
    }
  };

  const handleEditSector = async () => {
    if (!editingSector || !editingSector.name.trim()) return;
    setIsEditing(true);

    try {
      const result = await updateSector(editingSector.id, {
        name: editingSector.name.trim(),
        description: editingSector.description || undefined,
      });
      if (result.success) {
        toast.success("Sektor ažuriran", {
          description: `${editingSector.name} je uspešno ažuriran`,
        });
        setEditDialogOpen(false);
        setEditingSector(null);
        loadSectors();
      } else {
        toast.error("Greška", { description: result.error });
      }
    } catch {
      toast.error("Greška", { description: "Došlo je do greške" });
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteSector = async (id: number, name: string) => {
    try {
      const result = await deleteSector(id);
      if (result.success) {
        toast.success("Sektor obrisan", {
          description: `${name} je uspešno obrisan`,
        });
        loadSectors();
      } else {
        toast.error("Greška", { description: result.error });
      }
    } catch {
      toast.error("Greška", { description: "Došlo je do greške" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Sektori</h1>
          <p className="text-muted-foreground">Upravljanje sektorima i lokacijama</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="mr-2 h-4 w-4" />
              Novi sektor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novi sektor</DialogTitle>
              <DialogDescription>
                Dodajte novi sektor ili lokaciju
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="sectorName">Naziv sektora *</Label>
                <Input
                  id="sectorName"
                  placeholder="npr. Njiva 1, Voćnjak..."
                  value={newSector.name}
                  onChange={(e) => setNewSector({ ...newSector, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sectorDescription">Opis</Label>
                <Textarea
                  id="sectorDescription"
                  placeholder="Dodatne informacije o sektoru..."
                  value={newSector.description}
                  onChange={(e) => setNewSector({ ...newSector, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Otkaži
              </Button>
              <Button
                onClick={handleAddSector}
                disabled={isAdding || !newSector.name.trim()}
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

      {/* Sectors List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista sektora</CardTitle>
          <CardDescription>
            Sektori se koriste za grupisanje vozila i izveštaje
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : sectors.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-muted-foreground">Nema sektora</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Dodaj prvi sektor
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {sectors.map((sector) => (
                <div
                  key={sector.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{sector.name}</p>
                      {sector.description && (
                        <p className="text-sm text-muted-foreground">
                          {sector.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingSector(sector);
                        setEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
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
                          <AlertDialogTitle>Obrisati sektor?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Da li ste sigurni da želite obrisati sektor &quot;{sector.name}&quot;?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Otkaži</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteSector(sector.id, sector.name)}
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

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Izmeni sektor</DialogTitle>
            <DialogDescription>Izmenite podatke o sektoru</DialogDescription>
          </DialogHeader>
          {editingSector && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editSectorName">Naziv sektora *</Label>
                <Input
                  id="editSectorName"
                  value={editingSector.name}
                  onChange={(e) =>
                    setEditingSector({ ...editingSector, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editSectorDescription">Opis</Label>
                <Textarea
                  id="editSectorDescription"
                  value={editingSector.description || ""}
                  onChange={(e) =>
                    setEditingSector({
                      ...editingSector,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Otkaži
            </Button>
            <Button
              onClick={handleEditSector}
              disabled={isEditing || !editingSector?.name.trim()}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {isEditing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Čuvanje...
                </>
              ) : (
                "Sačuvaj"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
