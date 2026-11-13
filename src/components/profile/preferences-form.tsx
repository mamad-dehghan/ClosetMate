"use client";

import { useActionState } from "react";
import { Check, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Select } from "@/components/ui/field";
import {
  deleteAccountAction,
  updatePreferencesAction,
  type PreferencesState,
} from "@/lib/actions/profile";

export function PreferencesForm({
  currency,
  units,
  theme,
}: {
  currency: string;
  units: string;
  theme: string;
}) {
  const [state, action, pending] = useActionState<PreferencesState, FormData>(
    updatePreferencesAction,
    {},
  );

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Currency" htmlFor="currency">
          <Select id="currency" name="currency" defaultValue={currency}>
            {["USD", "EUR", "GBP", "PLN", "CAD", "AUD"].map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Units" htmlFor="units">
          <Select id="units" name="units" defaultValue={units}>
            <option value="metric">Metric</option>
            <option value="imperial">Imperial</option>
          </Select>
        </Field>
        <Field label="Theme" htmlFor="theme">
          <Select id="theme" name="theme" defaultValue={theme}>
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </Select>
        </Field>
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Check className="size-4" />
          )}
          Save preferences
        </Button>
        {state.saved ? (
          <span className="text-sm text-sage">Saved</span>
        ) : null}
        {state.error ? (
          <span className="text-sm text-red-700">{state.error}</span>
        ) : null}
      </div>
    </form>
  );
}

export function DeleteAccountForm() {
  return (
    <form
      action={deleteAccountAction}
      onSubmit={(event) => {
        if (
          !window.confirm(
            "Delete this wardrobe permanently? Every item, outfit and plan will be removed.",
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <Button type="submit" variant="danger" size="sm">
        <Trash2 className="size-4" />
        Delete wardrobe
      </Button>
    </form>
  );
}
