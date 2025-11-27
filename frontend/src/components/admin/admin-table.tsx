import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

type Column<T> = {
  key: keyof T;
  label: string;
  render?: (row: T) => ReactNode;
};

type AdminTableProps<T extends { id: string }> = {
  columns: Column<T>[];
  data: T[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
};

export const AdminTable = <T extends { id: string }>({
  columns,
  data,
  onEdit,
  onDelete,
}: AdminTableProps<T>) => (
  <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-white">
    <table className="w-full text-sm">
      <thead className="bg-[var(--accent)]/60 text-left uppercase tracking-[0.3em] text-[var(--muted)]">
        <tr>
          {columns.map((column) => (
            <th key={column.key as string} className="px-5 py-4 font-medium">
              {column.label}
            </th>
          ))}
          <th className="px-5 py-4" />
        </tr>
      </thead>
      <tbody className="divide-y divide-[var(--border)]">
        {data.map((row) => (
          <tr key={row.id} className="hover:bg-[var(--accent)]/20">
            {columns.map((column) => (
              <td key={column.key as string} className="px-5 py-4">
                {column.render ? column.render(row) : (row[column.key] as ReactNode)}
              </td>
            ))}
            <td className="px-5 py-4 text-right">
              <div className="inline-flex gap-2">
                {onEdit && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onEdit(row)}
                    className="hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all duration-300 active:scale-95"
                  >
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onDelete(row)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-300 active:scale-95"
                  >
                    Delete
                  </Button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

