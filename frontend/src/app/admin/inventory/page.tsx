import { AdminTable } from "@/components/admin/admin-table";

const inventory = [
  {
    id: "SEL-001",
    title: "Loose Fit Hoodie",
    variants: "S-10, M-8, L-6",
  },
  {
    id: "SEL-002",
    title: "Saree Cape Set",
    variants: "Free size-24",
  },
];

export default function AdminInventoryPage() {
  return (
    <AdminTable
      columns={[
        { key: "id", label: "SKU" },
        { key: "title", label: "Product" },
        { key: "variants", label: "Stock levels" },
      ]}
      data={inventory}
    />
  );
}

