import { db } from "@/lib/db";
import { couponService } from "@/lib/services/coupon.service";
import { CouponsManager } from "@/components/admin/coupons-manager";

export default async function AdminDiscountsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  await db.connect();
  
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const limit = 10;
  const search = params.search || "";

  const result = await couponService.getAllCoupons(page, limit, search);

  // Serialize Mongoose documents to plain objects
  const serializedCoupons = result.data.map((coupon: any) => ({
    _id: typeof coupon._id === 'object' && coupon._id?.toString ? coupon._id.toString() : String(coupon._id),
    code: String(coupon.code || ''),
    type: (coupon.type === 'fixed' || coupon.type === 'percentage' ? coupon.type : 'percentage') as 'fixed' | 'percentage',
    value: Number(coupon.value || 0),
    minSpend: coupon.minSpend ? Number(coupon.minSpend) : undefined,
    maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : undefined,
    startsAt: coupon.startsAt ? new Date(coupon.startsAt).toISOString() : undefined,
    endsAt: coupon.endsAt ? new Date(coupon.endsAt).toISOString() : undefined,
    usageLimit: coupon.usageLimit ? Number(coupon.usageLimit) : undefined,
    usedCount: Number(coupon.usedCount || 0),
    autoApply: Boolean(coupon.autoApply || false),
    isActive: Boolean(coupon.isActive !== undefined ? coupon.isActive : true),
    createdAt: coupon.createdAt ? new Date(coupon.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: coupon.updatedAt ? new Date(coupon.updatedAt).toISOString() : undefined,
  }));

  return (
    <CouponsManager
      coupons={serializedCoupons}
      total={result.total}
      page={page}
      limit={limit}
      search={search}
    />
  );
}
