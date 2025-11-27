import type { UpdateQuery } from "mongoose";
import { userRepository } from "@/lib/repositories";
import type { UserDocument } from "@/lib/models";

type ProfileUpdateInput = Partial<Pick<UserDocument, "name" | "phone" | "avatarUrl">>;

type AddressInput = UserDocument["addresses"][number];

type CartEntryInput = UserDocument["carts"][number];

export const userService = {
  getById: (userId: string) => userRepository.findById(userId),
  getByEmail: (email: string) =>
    userRepository.findByEmail(email),
  updateProfile: (userId: string, payload: ProfileUpdateInput) =>
    userRepository.update(userId, {
      name: payload.name,
      phone: payload.phone,
      avatarUrl: payload.avatarUrl,
    }),
  saveAddress: (userId: string, address: AddressInput, addressId?: string) => {
    if (addressId) {
      return userRepository.updateAddress(userId, addressId, address);
    } else {
      return userRepository.addAddress(userId, address);
    }
  },
  removeAddress: (userId: string, addressId: string) =>
    userRepository.removeAddress(userId, addressId),
  addToWishlist: (userId: string, productId: string) =>
    userRepository.addToWishlist(userId, productId),
  removeFromWishlist: (userId: string, productId: string) =>
    userRepository.removeFromWishlist(userId, productId),
  saveCartEntry: (userId: string, entry: CartEntryInput) =>
    userRepository.updateCart(userId, entry),
  setCartEntries: (userId: string, entries: CartEntryInput[]) =>
    userRepository.update(userId, { carts: entries } as any),
  clearCart: (userId: string) =>
    userRepository.clearCart(userId),
};

