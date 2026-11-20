"use client";

import { useActionState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  fillSampleWardrobeAction,
  type FillSamplesState,
} from "@/lib/actions/samples";

export function FillSamplesButton({ label }: { label?: string }) {
  const [state, formAction, pending] = useActionState<FillSamplesState, FormData>(
    fillSampleWardrobeAction,
    {},
  );

  return (
    <div>
      <form action={formAction}>
        <Button type="submit" variant="outline" size="md" disabled={pending}>
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          {pending ? "Adding 12 pieces…" : (label ?? "Fill with 12 sample pieces")}
        </Button>
      </form>
      {state.error ? (
        <p className="mt-2 text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
    </div>
  );
}
