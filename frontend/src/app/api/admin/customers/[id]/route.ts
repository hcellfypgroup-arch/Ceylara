import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userRepository } from "@/lib/repositories/user.repository";
import { requireAdmin } from "@/app/api/_utils/guards";
import { ok, notFound, serverError } from "@/app/api/_utils/response";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    if (session instanceof Response) return session;

    await db.connect();
    const { id } = await params;
    
    const user = await userRepository.findById(id);
    if (!user) {
      return notFound("Customer not found");
    }

    // Exclude password hash and serialize
    const { passwordHash, ...userData } = user;
    const serialized = {
      ...userData,
      _id: (userData as any)._id ? (typeof (userData as any)._id === 'object' && (userData as any)._id?.toString 
        ? (userData as any)._id.toString() 
        : String((userData as any)._id)) : id,
      addresses: (userData.addresses || []).map((addr: any) => ({
        ...addr,
        _id: typeof addr._id === 'object' && addr._id?.toString 
          ? addr._id.toString() 
          : String(addr._id),
      })),
      createdAt: userData.createdAt ? new Date(userData.createdAt).toISOString() : undefined,
    };

    return ok(serialized);
  } catch (error) {
    return serverError(error);
  }
}

