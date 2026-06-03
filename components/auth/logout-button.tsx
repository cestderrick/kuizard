"use client";

import { Button } from "@/components/ui/button";
import { signoutAction } from "@/lib/actions/auth";

export function LogoutButton() {
  return (
    <form action={signoutAction}>
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        className="text-sm"
      >
        Se déconnecter
      </Button>
    </form>
  );
}
