import { userRepository } from "@/lib/repositories";
import { hashPassword } from "@/lib/auth";
import type { UserDocument } from "@/lib/models";

export class UserService {
  async createUser(data: { name: string; email: string; password: string; role?: string }) {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const passwordHash = await hashPassword(data.password);
    return userRepository.create({
      ...data,
      email: data.email.toLowerCase(),
      passwordHash,
      role: (data.role || "customer") as "customer" | "admin",
    });
  }

  async updateProfile(userId: string, data: Partial<UserDocument>) {
    if (data.email) {
      const existingUser = await userRepository.findByEmail(data.email);
      const existingUserId = (existingUser as any)?._id?.toString() || (existingUser as any)?.id;
      if (existingUser && existingUserId !== userId) {
        throw new Error("Email already in use");
      }
      data.email = data.email.toLowerCase();
    }

    return userRepository.update(userId, data);
  }

  async addAddress(userId: string, address: any) {
    if (address.isDefault) {
      await userRepository.update(userId, {
        "addresses.$[].isDefault": false,
      } as any);
    }
    return userRepository.addAddress(userId, address);
  }

  async updateAddress(userId: string, addressId: string, address: any) {
    if (address.isDefault) {
      await userRepository.update(userId, {
        "addresses.$[].isDefault": false,
      } as any);
    }
    return userRepository.updateAddress(userId, addressId, address);
  }
}

export const userService = new UserService();


