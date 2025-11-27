import { SizeChartManager } from "@/components/admin/size-chart-manager";
import { db } from "@/lib/db";
import { sizeChartService } from "@/lib/services";

export default async function AdminSizeChartPage() {
  await db.connect();
  const charts = await sizeChartService.getAllSizeCharts();
  
  // Serialize Mongoose documents to plain objects
  const serializedCharts = charts.map((chart: any) => ({
    _id: typeof chart._id === 'object' && chart._id?.toString ? chart._id.toString() : String(chart._id),
    name: String(chart.name || ''),
    description: chart.description ? String(chart.description) : '',
    measurements: (chart.measurements || []).map((m: any) => ({
      key: String(m.key || ''),
      label: String(m.label || ''),
      unit: m.unit ? String(m.unit) : '',
    })),
    rows: (chart.rows || []).map((row: any) => ({
      sizeLabel: String(row.sizeLabel || ''),
      values: row.values instanceof Map 
        ? Object.fromEntries(row.values) 
        : (typeof row.values === 'object' && row.values !== null ? row.values : {}),
    })),
    isDefault: Boolean(chart.isDefault || false),
    createdAt: chart.createdAt ? new Date(chart.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: chart.updatedAt ? new Date(chart.updatedAt).toISOString() : undefined,
  }));

  return <SizeChartManager charts={serializedCharts} />;
}


