"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteItemAction } from "@/lib/actions/items";

export function DeleteItemButton({ id, name }: { id: string; name: string }) {
  return (
    <form
      action={deleteItemAction}
      onSubmit={(event) => {
        if (
          !window.confirm(
            `Delete “${name}”? It will also be removed from any outfit that uses it.`,
          )
        ) {
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
