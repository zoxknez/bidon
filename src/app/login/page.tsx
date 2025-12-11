"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Fuel, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Greška pri prijavi", {
          description: "Pogrešno korisničko ime ili lozinka",
        });
      } else {
        toast.success("Uspešna prijava!");
        router.push("/");
        router.refresh();
      }
    } catch {
      toast.error("Greška", {
        description: "Došlo je do greške pri prijavi",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-orange-500/10 via-background to-background" />
      
      <Card className="w-full max-w-md relative z-10 border-border/50 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          {/* Logo */}
          <div className="mx-auto w-16 h-16 bg-linear-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/25">
            <Fuel className="w-9 h-9 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">
              <span className="bg-linear-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                Bidon
              </span>
            </CardTitle>
            <CardDescription className="mt-2">
              Evidencija goriva - Mini benzinska pumpa
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Korisničko ime</Label>
              <Input
                id="username"
                type="text"
                placeholder="Unesite korisničko ime"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                required
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Lozinka</Label>
              <Input
                id="password"
                type="password"
                placeholder="Unesite lozinku"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                autoComplete="current-password"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Prijavljivanje...
                </>
              ) : (
                "Prijavi se"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
