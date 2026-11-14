"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteCapsuleAction } from "@/lib/actions/capsules";

export function DeleteCapsuleButton({ id, name }: { id: string; name: string }) {
  return (
    <form
      action={deleteCapsuleAction}
      onSubmit={(event) => {
        if (!window.confirm(`Delete the capsule “${name}”?`)) {
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
