"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

type Props = {
  value: string;
  label?: string;
};

export function CopyButton({ value, label = "Copier" }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // navigator.clipboard peut être indispo en http en local — fallback
      const textarea = document.createElement("textarea");
      textarea.value = value;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      } catch {
        // tant pis
      }
      document.body.removeChild(textarea);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className="font-medium"
    >
      {copied ? "✓ Copié" : label}
    </Button>
  );
}
