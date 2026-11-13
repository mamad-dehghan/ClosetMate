"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteOutfitAction } from "@/lib/actions/outfits";

export function DeleteOutfitButton({ id, name }: { id: string; name: string }) {
  return (
    <form
      action={deleteOutfitAction}
      onSubmit={(event) => {
        if (!window.confirm(`Delete the outfit “${name}”?`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="ghost" size="sm" className="text-red-700">
        <Trash2 className="size-4" />
        Delete
      </Button>
    </form>
  );
}
