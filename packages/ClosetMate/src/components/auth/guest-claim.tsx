"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { claimGuestWardrobeAction } from "@/lib/actions/guest";

export function GuestClaim() {
  const router = useRouter();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;

    claimGuestWardrobeAction()
      .then((result) => {
        if (result?.claimed) router.refresh();
      })
      .catch(() => undefined);
  }, [router]);

  return null;
}
