import { userRepository, productRepository } from "@/lib/repositories";
import { productService } from "./product.service";
import { buildCartEntry } from "@/lib/cart";

export class CartService {
  async getCart(userId: string) {
    const user = await userRepository.findById(userId);
    return user?.carts || [];
  }

  async addToCart(userId: string, productId: string, variantSku: string) {
    const product = await productRepository.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    const variant = product.variants?.find((v: any) => v.sku === variantSku);
    if (!variant) {
      throw new Error("Variant not found");
    }

    if (variant.stock < 1) {
      throw new Error("Product out of stock");
    }

    const entry = buildCartEntry(product as any, variantSku);
    const productWithId = product as any;
    await userRepository.updateCart(userId, {
      product: productWithId._id || productWithId.id,
      variantSku,
      quantity: 1,
    });
    return entry;
  }

  async updateCartItem(userId: string, variantSku: string, quantity: number) {
    if (quantity < 1) {
      throw new Error("Quantity must be at least 1");
    }

    const hasStock = await productService.checkStock(variantSku, quantity);
    if (!hasStock) {
      throw new Error("Insufficient stock");
    }

    return userRepository.updateCartItem(userId, variantSku, quantity);
  }

  async removeFromCart(userId: string, variantSku: string) {
    return userRepository.removeCartItem(userId, variantSku);
  }

  async clearCart(userId: string) {
    return userRepository.clearCart(userId);
  }
}

export const cartService = new CartService();

