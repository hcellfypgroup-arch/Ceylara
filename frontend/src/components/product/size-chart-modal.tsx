"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";

type Measurement = {
  key: string;
  label: string;
  unit?: string;
};

type SizeChart = {
  _id: string;
  name: string;
  description?: string;
  measurements: Measurement[];
  rows: Array<{
    sizeLabel: string;
    values: Record<string, string | number>;
  }>;
};

type SizeChartModalProps = {
  open: boolean;
  onClose: () => void;
};

export const SizeChartModal = ({ open, onClose }: SizeChartModalProps) => {
  const [chart, setChart] = useState<SizeChart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || chart || isLoading) {
      return;
    }

    const fetchChart = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/size-charts/default");
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.error || "Unable to load size chart");
        }
        const payload = await response.json();
        setChart(payload.data as SizeChart);
      } catch (fetchError: any) {
        setError(fetchError.message || "Unable to load size chart");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchChart();
  }, [open, chart, isLoading]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Size Guide"
      description="Measurements listed below are body measurements. Choose the size closest to your measurements."
    >
      {isLoading && (
        <div className="flex items-center justify-center gap-3 py-12">
          <Loader2 className="h-5 w-5 animate-spin text-[var(--primary)]" />
          <p className="text-sm text-[var(--muted)]">Loading size chart…</p>
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-[var(--radius-lg)] border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!isLoading && !error && chart && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold">{chart.name}</h3>
            {chart.description && (
              <p className="mt-2 text-sm text-[var(--muted)]">{chart.description}</p>
            )}
          </div>
          <div className="overflow-x-auto rounded-[var(--radius-xl)] border border-[var(--border)]">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-[var(--accent)]/40 text-left uppercase tracking-[0.2em] text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3">Size</th>
                  {chart.measurements.map((measurement) => (
                    <th key={measurement.key} className="px-4 py-3">
                      {measurement.label}
                      {measurement.unit && (
                        <span className="ml-1 text-xs lowercase text-[var(--muted)]">
                          ({measurement.unit})
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {chart.rows.map((row, index) => (
                  <tr key={`${row.sizeLabel}-${index}`}>
                    <td className="px-4 py-3 font-semibold">{row.sizeLabel}</td>
                    {chart.measurements.map((measurement) => (
                      <td key={measurement.key} className="px-4 py-3 text-[var(--foreground)]">
                        {row.values?.[measurement.key] ?? "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-[var(--muted)]">
            Tip: If you are between sizes, choose the size that best matches your largest measurement for a comfortable fit.
          </p>
        </div>
      )}
    </Modal>
  );
};


