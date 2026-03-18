"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createService, updateService, type Service } from "@/app/actions/services";

type Props = {
  service?: Service | null;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function ServiceForm({ service, onSuccess, onCancel }: Props) {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const isEditing = !!service;

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = isEditing
      ? await updateService(service!.id, formData)
      : await createService(formData);
    if (result.error) setError(result.error);
    else {
      onSuccess?.();
      router.push("/dashboard/servicios");
      router.refresh();
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Nombre del servicio
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={service?.name}
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          placeholder="Ej: Corte de pelo"
        />
      </div>
      <div>
        <label
          htmlFor="duration_minutes"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Duración (minutos)
        </label>
        <input
          id="duration_minutes"
          name="duration_minutes"
          type="number"
          required
          min={1}
          defaultValue={service?.duration_minutes ?? 30}
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />
      </div>
      <div>
        <label
          htmlFor="price"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Precio ($)
        </label>
        <input
          id="price"
          name="price"
          type="number"
          required
          min={0}
          step={0.01}
          defaultValue={service?.price ?? 0}
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />
      </div>
      <div>
        <label
          htmlFor="deposit_amount"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Seña ($)
        </label>
        <input
          id="deposit_amount"
          name="deposit_amount"
          type="number"
          min={0}
          step={0.01}
          defaultValue={service?.deposit_amount ?? 0}
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
        >
          {isEditing ? "Guardar cambios" : "Crear servicio"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
