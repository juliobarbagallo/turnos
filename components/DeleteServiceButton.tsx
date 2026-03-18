"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteService } from "@/app/actions/services";

type Props = {
  serviceId: string;
  serviceName: string;
};

export function DeleteServiceButton({ serviceId, serviceName }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setLoading(true);
    await deleteService(serviceId);
    setLoading(false);
    setConfirming(false);
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2 dark:border-amber-800 dark:bg-amber-900/20">
        <span className="flex-1 text-sm text-amber-800 dark:text-amber-200">
          ¿Eliminar &quot;{serviceName}&quot;?
        </span>
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="rounded bg-red-600 px-2 py-1 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          Sí
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="rounded bg-slate-200 px-2 py-1 text-sm font-medium text-slate-700 hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="text-sm text-red-600 hover:underline dark:text-red-400"
    >
      Eliminar
    </button>
  );
}
