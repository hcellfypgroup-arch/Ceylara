"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import type { SizeChartDocument } from "@/lib/models";
import { slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

type SizeChartFormProps = {
  chart: SizeChartDocument | null;
  onCancel: () => void;
  onSuccess: () => void;
};

type Measurement = {
  key: string;
  label: string;
  unit: string;
};

type RowState = {
  id: string;
  sizeLabel: string;
  values: Record<string, string>;
};

const createRowId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const SizeChartForm = ({ chart, onCancel, onSuccess }: SizeChartFormProps) => {
  const [name, setName] = useState(chart?.name ?? "");
  const [description, setDescription] = useState(chart?.description ?? "");
  const [isDefault, setIsDefault] = useState(chart?.isDefault ?? false);
  const [measurements, setMeasurements] = useState<Measurement[]>(
    () =>
      chart?.measurements?.map((measurement, index) => ({
        key: measurement.key || `measurement_${index}`,
        label: measurement.label ?? `Measurement ${index + 1}`,
        unit: measurement.unit ?? "",
      })) ?? []
  );
  const [rows, setRows] = useState<RowState[]>(() => {
    const baseRows =
      chart?.rows?.map((row) => ({
        id: createRowId(),
        sizeLabel: row.sizeLabel,
        values: measurements.reduce<Record<string, string>>((acc, measurement) => {
          const sourceValues = row.values as Record<string, string>;
          acc[measurement.key] = sourceValues?.[measurement.key] ?? "";
          return acc;
        }, {}),
      })) ?? [];
    return baseRows.length > 0 ? baseRows : [{ id: createRowId(), sizeLabel: "", values: {} }];
  });
  const [newMeasurementLabel, setNewMeasurementLabel] = useState("");
  const [newMeasurementUnit, setNewMeasurementUnit] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const preparedRows = useMemo(() => {
    return rows.map((row) => ({
      ...row,
      values: measurements.reduce<Record<string, string>>((acc, measurement) => {
        acc[measurement.key] = row.values?.[measurement.key] ?? "";
        return acc;
      }, {}),
    }));
  }, [rows, measurements]);

  const handleAddMeasurement = () => {
    const label = newMeasurementLabel.trim();
    if (!label) {
      toast.error("Measurement label is required");
      return;
    }

    const baseKey = slugify(label) || label.toLowerCase().replace(/\s+/g, "_");
    let candidateKey = baseKey || `measurement_${measurements.length + 1}`;
    let suffix = 1;
    while (measurements.some((measurement) => measurement.key === candidateKey)) {
      candidateKey = `${baseKey}_${suffix++}`;
    }

    const nextMeasurements = [
      ...measurements,
      { key: candidateKey, label, unit: newMeasurementUnit.trim() },
    ];
    setMeasurements(nextMeasurements);
    setRows((current) =>
      current.map((row) => ({
        ...row,
        values: {
          ...row.values,
          [candidateKey]: row.values?.[candidateKey] ?? "",
        },
      }))
    );
    setNewMeasurementLabel("");
    setNewMeasurementUnit("");
  };

  const handleMeasurementChange = (index: number, field: "label" | "unit", value: string) => {
    setMeasurements((current) => {
      const next = [...current];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleRemoveMeasurement = (key: string) => {
    setMeasurements((current) => current.filter((measurement) => measurement.key !== key));
    setRows((current) =>
      current.map((row) => {
        const nextValues = { ...row.values };
        delete nextValues[key];
        return { ...row, values: nextValues };
      })
    );
  };

  const handleRowChange = (rowId: string, field: "sizeLabel", value: string) => {
    setRows((current) =>
      current.map((row) => (row.id === rowId ? { ...row, [field]: value } : row))
    );
  };

  const handleRowMeasurementChange = (rowId: string, measurementKey: string, value: string) => {
    setRows((current) =>
      current.map((row) =>
        row.id === rowId
          ? { ...row, values: { ...row.values, [measurementKey]: value } }
          : row
      )
    );
  };

  const handleAddRow = () => {
    const newRow: RowState = {
      id: createRowId(),
      sizeLabel: "",
      values: measurements.reduce<Record<string, string>>((acc, measurement) => {
        acc[measurement.key] = "";
        return acc;
      }, {}),
    };
    setRows((current) => [...current, newRow]);
  };

  const handleRemoveRow = (rowId: string) => {
    setRows((current) => current.filter((row) => row.id !== rowId));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (measurements.length === 0) {
      toast.error("Add at least one measurement column");
      return;
    }

    const sanitizedRows = preparedRows
      .filter((row) => row.sizeLabel.trim())
      .map((row) => ({
        sizeLabel: row.sizeLabel.trim(),
        values: measurements.reduce<Record<string, string | number>>((acc, measurement) => {
          acc[measurement.key] = row.values?.[measurement.key] ?? "";
          return acc;
        }, {}),
      }));

    if (sanitizedRows.length === 0) {
      toast.error("Add at least one size row");
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim(),
      isDefault,
      measurements: measurements.map((measurement) => ({
        key: measurement.key,
        label: measurement.label.trim() || measurement.key,
        unit: measurement.unit.trim(),
      })),
      rows: sanitizedRows,
    };

    setIsSubmitting(true);
    try {
      const response = await fetch(
        chart?._id ? `/api/size-charts/${chart._id}` : "/api/size-charts",
        {
          method: chart?._id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error || "Failed to save size chart");
      }

      toast.success(`Size chart ${chart ? "updated" : "created"} successfully`);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to save size chart");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-8 shadow-[var(--shadow-card)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">
            {chart ? "Edit Size Chart" : "Create Size Chart"}
          </h2>
          <p className="text-sm text-[var(--muted)]">
            Define the measurement columns and size rows shown in the storefront guide.
          </p>
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : chart ? "Update" : "Create"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--foreground)]">Name</label>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Womenswear Standard"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--foreground)]">
            Description <span className="text-[var(--muted)]">(optional)</span>
          </label>
          <Textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            placeholder="Help shoppers understand how to measure themselves."
          />
        </div>
      </div>

      <div>
        <Checkbox
          checked={isDefault}
          onChange={(event) => setIsDefault(event.target.checked)}
          label="Make this the default size chart"
        />
        <p className="mt-1 text-xs text-[var(--muted)]">
          Only the default chart is shown on the storefront size guide button.
        </p>
      </div>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Measurements</h3>
            <p className="text-sm text-[var(--muted)]">
              Add the measurement columns you want to capture (e.g., bust, waist, hip).
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={newMeasurementLabel}
              onChange={(event) => setNewMeasurementLabel(event.target.value)}
              placeholder="Measurement label"
            />
            <Input
              value={newMeasurementUnit}
              onChange={(event) => setNewMeasurementUnit(event.target.value)}
              placeholder="Unit (optional)"
            />
            <Button type="button" onClick={handleAddMeasurement}>
              Add
            </Button>
          </div>
        </div>

        {measurements.length === 0 ? (
          <p className="rounded-[var(--radius-md)] border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted)]">
            No measurements yet. Add at least one to start defining your chart.
          </p>
        ) : (
          <div className="space-y-3">
            {measurements.map((measurement, index) => (
              <div
                key={measurement.key}
                className="grid gap-3 rounded-[var(--radius-md)] border border-[var(--border)] p-4 md:grid-cols-[2fr_1fr_auto]"
              >
                <Input
                  value={measurement.label}
                  onChange={(event) => handleMeasurementChange(index, "label", event.target.value)}
                  placeholder="Label"
                />
                <Input
                  value={measurement.unit}
                  onChange={(event) => handleMeasurementChange(index, "unit", event.target.value)}
                  placeholder="Unit"
                />
                <Button
                  type="button"
                  variant="ghost"
                  className="justify-self-end text-red-600 hover:text-red-700"
                  onClick={() => handleRemoveMeasurement(measurement.key)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Size Rows</h3>
            <p className="text-sm text-[var(--muted)]">
              Provide measurements for each size you offer.
            </p>
          </div>
          <Button type="button" variant="outline" onClick={handleAddRow}>
            Add Size Row
          </Button>
        </div>

        {preparedRows.length === 0 ? (
          <p className="rounded-[var(--radius-md)] border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted)]">
            Add at least one size row.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-[var(--radius-xl)] border border-[var(--border)]">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-[var(--accent)]/40 text-left uppercase tracking-[0.2em] text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3">Size</th>
                  {measurements.map((measurement) => (
                    <th key={measurement.key} className="px-4 py-3">
                      {measurement.label}
                      {measurement.unit && (
                        <span className="ml-2 text-xs lowercase text-[var(--muted)]">
                          ({measurement.unit})
                        </span>
                      )}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {preparedRows.map((row) => (
                  <tr key={row.id} className="bg-white">
                    <td className="px-4 py-3">
                      <Input
                        value={row.sizeLabel}
                        onChange={(event) =>
                          handleRowChange(row.id, "sizeLabel", event.target.value)
                        }
                        placeholder="Size label"
                      />
                    </td>
                    {measurements.map((measurement) => (
                      <td key={measurement.key} className="px-4 py-3">
                        <Input
                          value={row.values?.[measurement.key] ?? ""}
                          onChange={(event) =>
                            handleRowMeasurementChange(row.id, measurement.key, event.target.value)
                          }
                          placeholder="Value"
                        />
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleRemoveRow(row.id)}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </form>
  );
};


