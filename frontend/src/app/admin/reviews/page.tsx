import { AdminTable } from "@/components/admin/admin-table";

const reviews = [
  {
    id: "RV-01",
    customer: "Alya",
    product: "Loose Fit Hoodie",
    rating: 5,
    status: "pending",
  },
  {
    id: "RV-02",
    customer: "Nora",
    product: "Saree Cape Set",
    rating: 4,
    status: "approved",
  },
];

export default function AdminReviewsPage() {
  return (
    <AdminTable
      columns={[
        { key: "customer", label: "Customer" },
        { key: "product", label: "Product" },
        { key: "rating", label: "Rating" },
        { key: "status", label: "Status" },
      ]}
      data={reviews}
      onEdit={(row) => {
        console.log("Approve", row.id);
      }}
      onDelete={(row) => {
        console.log("Reject", row.id);
      }}
    />
  );
}

