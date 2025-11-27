import type { FilterQuery, UpdateQuery } from "mongoose";
import { UserModel, type UserDocument } from "@/lib/models";
import { applyQueryOptions, withLean } from "./utils";
import type { QueryOptions } from "./types";

type UserFilters = FilterQuery<UserDocument>;

export const userRepository = {
  findById: (id: string, options?: QueryOptions) => {
    const query = UserModel.findById(id);
    applyQueryOptions(query, options);
    return withLean(query, options?.lean ?? true);
  },
  findByEmail: (email: string, options?: QueryOptions) => {
    const query = UserModel.findOne({ email });
    applyQueryOptions(query, options);
    return withLean(query, options?.lean ?? true);
  },
  search: (filters: UserFilters = {}, options?: QueryOptions) => {
    const query = UserModel.find(filters);
    applyQueryOptions(query, options);
    return withLean(query, options?.lean ?? true);
  },
  count: (filters: UserFilters = {}) => UserModel.countDocuments(filters),
  create: (payload: Partial<UserDocument>) => UserModel.create(payload),
  updateById: (id: string, payload: UpdateQuery<UserDocument>) =>
    UserModel.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    }).lean(),
  pushToWishlist: (userId: string, productId: string) =>
    UserModel.findByIdAndUpdate(
      userId,
      { $addToSet: { wishlist: productId } },
      { new: true }
    ).lean(),
  pullFromWishlist: (userId: string, productId: string) =>
    UserModel.findByIdAndUpdate(
      userId,
      { $pull: { wishlist: productId } },
      { new: true }
    ).lean(),
  upsertAddress: (
    userId: string,
    addressId: string | null,
    payload: Record<string, unknown>
  ) => {
    if (addressId) {
      return UserModel.findOneAndUpdate(
        { _id: userId, "addresses._id": addressId },
        { $set: { "addresses.$": payload } },
        { new: true }
      ).lean();
    }
    return UserModel.findByIdAndUpdate(
      userId,
      { $push: { addresses: payload } },
      { new: true }
    ).lean();
  },
  removeAddress: (userId: string, addressId: string) =>
    UserModel.findByIdAndUpdate(
      userId,
      { $pull: { addresses: { _id: addressId } } },
      { new: true }
    ).lean(),
};

