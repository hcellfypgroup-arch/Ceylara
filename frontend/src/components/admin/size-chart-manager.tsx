"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Search } from "lucide-react";
import type { SizeChartDocument } from "@/lib/models";
import { AdminTable } from "@/components/admin/admin-table";
import { SizeChartForm } from "@/components/admin/size-chart-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SizeChartManagerProps = {
  charts: SizeChartDocument[];
};

type TableRow = {
  id: string;
  name: string;
  measurementSummary: string;
  sizeCount: number;
  defaultLabel: string;
};

export const SizeChartManager = ({ charts }: SizeChartManagerProps) => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingChart, setEditingChart] = useState<SizeChartDocument | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredCharts = useMemo(() => {
    if (!search.trim()) {
      return charts;
    }
    const query = search.trim().toLowerCase();
    return charts.filter((chart) => {
      const measurementMatch = chart.measurements?.some((m) =>
        m.label.toLowerCase().includes(query)
      );
      return (
        chart.name.toLowerCase().includes(query) ||
        measurementMatch ||
        chart.description?.toLowerCase().includes(query)
      );
    });
  }, [charts, search]);

  const tableData: TableRow[] = filteredCharts.map((chart) => ({
    id: chart._id?.toString() ?? "",
    name: chart.name,
    measurementSummary:
      chart.measurements?.map((m) => m.label).join(", ") || "—",
    sizeCount: chart.rows?.length ?? 0,
    defaultLabel: chart.isDefault ? "Default" : "—",
  }));

  const handleAddNew = () => {
    setEditingChart(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEdit = (row: TableRow) => {
    const chart = charts.find((c) => c._id?.toString() === row.id);
    if (!chart) {
      toast.error("Unable to load size chart");
      return;
    }
    setEditingChart(chart);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (row: TableRow) => {
    const chart = charts.find((c) => c._id?.toString() === row.id);
    if (!chart) {
      toast.error("Size chart not found");
      return;
    }

    if (
      !confirm(
        `Delete "${chart.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/size-charts/${row.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error || "Failed to delete size chart");
      }

      toast.success("Size chart deleted");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete size chart");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormCancel = () => {
    setEditingChart(null);
    setShowForm(false);
  };

  const handleFormSuccess = () => {
    setEditingChart(null);
    setShowForm(false);
    router.refresh();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[var(--foreground)]">
            Size Charts
          </h1>
          <p className="text-sm text-[var(--muted)]">
            Configure measurement columns and sizes for the size guide modal.
          </p>
        </div>
        {!showForm && (
          <Button onClick={handleAddNew}>Add Size Chart</Button>
        )}
      </div>

      {!showForm && (
        <form
          onSubmit={(event) => event.preventDefault()}
          className="flex flex-wrap gap-4"
        >
          <div className="relative flex-1 min-w-[240px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or measurement..."
              className="pl-10"
            />
          </div>
        </form>
      )}

      {showForm && (
        <SizeChartForm
          chart={editingChart}
          onCancel={handleFormCancel}
          onSuccess={handleFormSuccess}
        />
      )}

      {!showForm && (
        <>
          {tableData.length === 0 ? (
            <div className="rounded-[var(--radius-xl)] border border-dashed border-[var(--border)] bg-white p-12 text-center">
              <p className="text-[var(--muted)]">No size charts yet.</p>
              <p className="text-sm text-[var(--muted)]">
                Create one to power the storefront size guide.
              </p>
            </div>
          ) : (
            <AdminTable<TableRow>
              columns={[
                { key: "name", label: "Name" },
                {
                  key: "measurementSummary",
                  label: "Measurements",
                },
                {
                  key: "sizeCount",
                  label: "Sizes",
                  render: (row) => `${row.sizeCount}`,
                },
                {
                  key: "defaultLabel",
                  label: "Status",
                },
              ]}
              data={tableData}
              onEdit={handleEdit}
              onDelete={isDeleting ? undefined : handleDelete}
            />
          )}
        </>
      )}
    </div>
  );
};


