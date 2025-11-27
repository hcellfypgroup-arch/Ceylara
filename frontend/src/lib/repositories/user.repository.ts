import { UserModel, type UserDocument } from "@/lib/models";
import type { PaginationOptions, PaginatedResult } from "./_types";
import { paginate } from "./_utils";

export class UserRepository {
  async findById(id: string): Promise<UserDocument | null> {
    return UserModel.findById(id).lean() as Promise<UserDocument | null>;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return UserModel.findOne({ email: email.toLowerCase() }).lean() as Promise<UserDocument | null>;
  }

  async create(data: Partial<UserDocument>): Promise<UserDocument> {
    const user = await UserModel.create(data);
    return user.toObject();
  }

  async update(id: string, data: Partial<UserDocument>): Promise<UserDocument | null> {
    const user = await UserModel.findByIdAndUpdate(id, data, { new: true }).lean() as UserDocument | null;
    return user;
  }

  async delete(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id);
    return !!result;
  }

  async findAll(options: PaginationOptions & { filter?: any } = {}): Promise<PaginatedResult<UserDocument>> {
    const { filter, ...paginationOptions } = options;
    const query = filter ? UserModel.find(filter) : UserModel.find();
    return paginate<UserDocument>(query, paginationOptions);
  }

  async updateCart(userId: string, cartItem: any): Promise<UserDocument | null> {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $push: { carts: cartItem } },
      { new: true }
    ).lean() as UserDocument | null;
    return user;
  }

  async updateCartItem(userId: string, variantSku: string, quantity: number): Promise<boolean> {
    const result = await UserModel.updateOne(
      { _id: userId, "carts.variantSku": variantSku },
      { $set: { "carts.$.quantity": quantity } }
    );
    return result.modifiedCount > 0;
  }

  async removeCartItem(userId: string, variantSku: string): Promise<boolean> {
    const result = await UserModel.updateOne(
      { _id: userId },
      { $pull: { carts: { variantSku } } }
    );
    return result.modifiedCount > 0;
  }

  async clearCart(userId: string): Promise<boolean> {
    const result = await UserModel.updateOne({ _id: userId }, { $set: { carts: [] } });
    return result.modifiedCount > 0;
  }

  async addToWishlist(userId: string, productId: string): Promise<boolean> {
    const result = await UserModel.updateOne(
      { _id: userId },
      { $addToSet: { wishlist: productId } }
    );
    return result.modifiedCount > 0;
  }

  async removeFromWishlist(userId: string, productId: string): Promise<boolean> {
    const result = await UserModel.updateOne(
      { _id: userId },
      { $pull: { wishlist: productId } }
    );
    return result.modifiedCount > 0;
  }

  async addAddress(userId: string, address: any): Promise<UserDocument | null> {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $push: { addresses: address } },
      { new: true }
    ).lean() as UserDocument | null;
    return user;
  }

  async updateAddress(userId: string, addressId: string, address: any): Promise<boolean> {
    const result = await UserModel.updateOne(
      { _id: userId, "addresses._id": addressId },
      { $set: { "addresses.$": address } }
    );
    return result.modifiedCount > 0;
  }

  async removeAddress(userId: string, addressId: string): Promise<boolean> {
    const result = await UserModel.updateOne(
      { _id: userId },
      { $pull: { addresses: { _id: addressId } } }
    );
    return result.modifiedCount > 0;
  }

  async addRecentlyViewed(userId: string, productId: string): Promise<void> {
    await UserModel.updateOne(
      { _id: userId },
      {
        $pull: { recentlyViewed: { product: productId } },
        $push: {
          recentlyViewed: {
            $each: [{ product: productId, viewedAt: new Date() }],
            $slice: -20,
          },
        },
      }
    );
  }
}

export const userRepository = new UserRepository();


