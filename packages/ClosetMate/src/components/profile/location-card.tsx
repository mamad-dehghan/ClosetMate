"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import {
  clearLocationAction,
  saveLocationAction,
} from "@/lib/actions/profile";

export function LocationCard({
  label,
  latitude,
  longitude,
}: {
  label: string | null;
  latitude: number | null;
  longitude: number | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState(label ?? "Home");
  const [status, setStatus] = useState<{ kind: "idle" | "ok" | "error"; message?: string }>({
    kind: "idle",
  });

  const hasLocation = latitude !== null && longitude !== null;

  function locate() {
    if (!("geolocation" in navigator)) {
      setStatus({ kind: "error", message: "This browser cannot share a location." });
      return;
    }

    setStatus({ kind: "idle" });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        startTransition(async () => {
          const result = await saveLocationAction(
            position.coords.latitude,
            position.coords.longitude,
            name,
          );
          if (!result.ok) {
            setStatus({ kind: "error", message: result.error });
            return;
          }
          setStatus({ kind: "ok", message: "Location saved." });
          router.refresh();
        });
      },
      () => {
        setStatus({
          kind: "error",
          message: "Location permission was denied. You can still use the app without it.",
        });
      },
      { timeout: 10000, maximumAge: 600000 },
    );
  }

  function remove() {
    startTransition(async () => {
      await clearLocationAction();
      setStatus({ kind: "idle" });
      router.refresh();
    });
  }

  return (
    <section className="rounded-card border border-line bg-surface p-5 shadow-card">
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        <MapPin className="size-4 text-sage" />
        Weather location
      </h2>
      <p className="mt-1 text-sm text-muted">
        Used only to pick a season for outfit ideas. Coordinates stay in your
        preferences.
      </p>

      {hasLocation ? (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-surface-2/70 px-3 py-2.5">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {label || "Saved location"}
            </p>
            <p className="text-xs text-muted">
              {latitude.toFixed(3)}, {longitude.toFixed(3)}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={remove}
            disabled={pending}
          >
            <X className="size-4" />
            Remove
          </Button>
        </div>
      ) : null}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Home, office…"
          aria-label="Location label"
          className="h-11 sm:max-w-56"
        />
        <Button type="button" onClick={locate} disabled={pending} size="md">
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <MapPin className="size-4" />
          )}
          {hasLocation ? "Update location" : "Use my location"}
        </Button>
      </div>

      {status.kind === "ok" ? (
        <p className="mt-2 text-sm text-sage">{status.message}</p>
      ) : null}
      {status.kind === "error" ? (
        <p className="mt-2 text-sm text-red-700">{status.message}</p>
      ) : null}
    </section>
  );
}
