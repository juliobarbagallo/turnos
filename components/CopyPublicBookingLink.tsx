"use client";

import { useState } from "react";

export function CopyPublicBookingLink({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const full = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(full);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
    >
      {copied ? "¡Copiado!" : "Copiar enlace"}
    </button>
  );
}
