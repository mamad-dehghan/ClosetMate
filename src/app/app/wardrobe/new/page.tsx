import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ItemForm } from "@/components/wardrobe/item-form";

export const metadata = { title: "Add clothing" };

export default function NewItemPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <Link
          href="/app/wardrobe"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          Wardrobe
        </Link>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl">Add clothing</h1>
        <p className="mt-1 text-sm text-muted">
          Photo and category is enough. Everything else can wait.
        </p>
      </div>
      <ItemForm mode="create" />
    </div>
  );
}
