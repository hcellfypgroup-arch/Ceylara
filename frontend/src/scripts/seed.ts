import { db } from "@/lib/db";
import {
  UserModel,
  CategoryModel,
  ProductModel,
  CouponModel,
  SiteSettingModel,
  OrderModel,
} from "@/lib/models";
import { hashPassword } from "@/lib/auth";
import { slugify } from "@/lib/utils";

async function seed() {
  try {
    await db.connect();
    console.log("Connected to database");

    // Clear existing data
    await UserModel.deleteMany({});
    await CategoryModel.deleteMany({});
    await ProductModel.deleteMany({});
    await CouponModel.deleteMany({});
    await SiteSettingModel.deleteMany({});
    await OrderModel.deleteMany({});

    console.log("Cleared existing data");

    // Create admin user
    const adminPassword = await hashPassword("admin123");
    const admin = await UserModel.create({
      email: "admin@ceylara.com",
      name: "Admin User",
      passwordHash: adminPassword,
      role: "admin",
    });
    console.log("Created admin user:", admin.email);

    // Create test customer
    const customerPassword = await hashPassword("customer123");
    const customer = await UserModel.create({
      email: "customer@ceylara.com",
      name: "Test Customer",
      passwordHash: customerPassword,
      role: "customer",
    });
    console.log("Created customer user:", customer.email);

    // Create categories
    const categories = await CategoryModel.insertMany([
      {
        name: "Dresses",
        slug: "dresses",
        description: "Beautiful dresses for every occasion",
        position: 1,
      },
      {
        name: "Tops",
        slug: "tops",
        description: "Stylish tops and blouses",
        position: 2,
      },
      {
        name: "T-Shirts",
        slug: "t-shirts",
        description: "Comfortable and stylish t-shirts",
        position: 3,
      },
      {
        name: "Jeans / Pants / Skirts",
        slug: "bottoms",
        description: "Pants, skirts, and shorts",
        position: 4,
      },
      {
        name: "Abaya / Hijab",
        slug: "abaya-hijab",
        description: "Modest wear and hijabs",
        position: 5,
      },
      {
        name: "Sarees / Kurti",
        slug: "sarees-kurti",
        description: "Traditional Indian wear",
        position: 6,
      },
      {
        name: "Lingerie / Sleepwear",
        slug: "lingerie-sleepwear",
        description: "Comfortable sleepwear and lingerie",
        position: 7,
      },
      {
        name: "Accessories",
        slug: "accessories",
        description: "Jewelry, bags, and more",
        position: 8,
      },
    ]);
    console.log(`Created ${categories.length} categories`);

    // Helper function to get category by slug
    const getCategory = (slug: string) =>
      categories.find((c) => c.slug === slug);

    // Create realistic products
    const productData = [
      {
        title: "Sculpt Midi Dress",
        summary: "Elegant midi dress with structured silhouette",
        description:
          "A timeless midi dress crafted from premium fabric with a flattering A-line cut. Features a structured bodice and flowing skirt perfect for both day and evening wear. Available in multiple colors and sizes.",
        category: "dresses",
        basePrice: 189,
        variants: [
          { size: "S", color: "Black", stock: 15, price: 189 },
          { size: "M", color: "Black", stock: 20, price: 189 },
          { size: "L", color: "Black", stock: 12, price: 189 },
          { size: "S", color: "Navy", stock: 10, price: 189 },
          { size: "M", color: "Navy", stock: 18, price: 189 },
        ],
        isFeatured: true,
        isBestSeller: true,
        style: "Formal",
        materials: ["Polyester", "Elastane"],
        sleeveLength: "Short",
      },
      {
        title: "Loose Fit Hoodie",
        summary: "Comfortable oversized hoodie for casual wear",
        description:
          "A relaxed-fit hoodie made from soft, breathable cotton blend. Perfect for layering or wearing alone. Features a drawstring hood, kangaroo pocket, and ribbed cuffs and hem.",
        category: "tops",
        basePrice: 129,
        variants: [
          { size: "S", color: "Beige", stock: 25, price: 129 },
          { size: "M", color: "Beige", stock: 30, price: 129 },
          { size: "L", color: "Beige", stock: 22, price: 129 },
          { size: "XL", color: "Beige", stock: 15, price: 129 },
          { size: "M", color: "Pink", stock: 18, price: 129 },
          { size: "L", color: "Pink", stock: 20, price: 129 },
        ],
        isFeatured: true,
        style: "Casual",
        materials: ["Cotton", "Modal"],
        sleeveLength: "Long",
      },
      {
        title: "Dune Kimono Set",
        summary: "Modest two-piece set with flowing kimono",
        description:
          "A beautiful modest wear set featuring a comfortable inner dress and an elegant flowing kimono. Perfect for special occasions or daily wear. Made from premium chiffon fabric.",
        category: "abaya-hijab",
        basePrice: 159,
        variants: [
          { size: "S", color: "Maroon", stock: 12, price: 159 },
          { size: "M", color: "Maroon", stock: 15, price: 159 },
          { size: "L", color: "Maroon", stock: 10, price: 159 },
          { size: "M", color: "Black", stock: 18, price: 159 },
          { size: "L", color: "Black", stock: 14, price: 159 },
        ],
        isBestSeller: true,
        style: "Modest",
        materials: ["Chiffon", "Polyester"],
        sleeveLength: "Long",
      },
      {
        title: "Saree with Organza Cape",
        summary: "Traditional saree with modern organza cape",
        description:
          "A stunning traditional saree paired with a contemporary organza cape. Features intricate embroidery and premium silk fabric. Perfect for festive occasions and celebrations.",
        category: "sarees-kurti",
        basePrice: 299,
        variants: [
          { size: "Free Size", color: "Mustard", stock: 8, price: 299 },
          { size: "Free Size", color: "Maroon", stock: 10, price: 299 },
          { size: "Free Size", color: "Green", stock: 6, price: 299 },
        ],
        isFeatured: true,
        style: "Festive",
        materials: ["Silk", "Organza"],
      },
      {
        title: "Classic White Blouse",
        summary: "Versatile white blouse for work and casual wear",
        description:
          "A crisp white blouse with a tailored fit. Features a button-down front, pointed collar, and long sleeves. Perfect for office wear or pairing with jeans for a casual look.",
        category: "tops",
        basePrice: 89,
        variants: [
          { size: "S", color: "White", stock: 20, price: 89 },
          { size: "M", color: "White", stock: 25, price: 89 },
          { size: "L", color: "White", stock: 18, price: 89 },
          { size: "XL", color: "White", stock: 12, price: 89 },
        ],
        style: "Formal",
        materials: ["Cotton", "Polyester"],
        sleeveLength: "Long",
      },
      {
        title: "High-Waisted Wide Leg Pants",
        summary: "Comfortable wide-leg pants with high waist",
        description:
          "Stylish wide-leg pants with a high-waisted design. Made from premium fabric that drapes beautifully. Perfect for creating a sophisticated silhouette.",
        category: "bottoms",
        basePrice: 149,
        variants: [
          { size: "S", color: "Black", stock: 15, price: 149 },
          { size: "M", color: "Black", stock: 20, price: 149 },
          { size: "L", color: "Black", stock: 16, price: 149 },
          { size: "M", color: "Beige", stock: 12, price: 149 },
          { size: "L", color: "Beige", stock: 14, price: 149 },
        ],
        isBestSeller: true,
        style: "Casual",
        materials: ["Polyester", "Viscose"],
      },
      {
        title: "Floral Print Midi Skirt",
        summary: "Elegant floral print skirt for spring and summer",
        description:
          "A beautiful midi skirt featuring a delicate floral print. Made from lightweight fabric perfect for warm weather. Features an elastic waistband for comfort.",
        category: "bottoms",
        basePrice: 119,
        variants: [
          { size: "S", color: "Pink", stock: 18, price: 119 },
          { size: "M", color: "Pink", stock: 22, price: 119 },
          { size: "L", color: "Pink", stock: 15, price: 119 },
          { size: "M", color: "Blue", stock: 20, price: 119 },
        ],
        style: "Casual",
        materials: ["Polyester", "Cotton"],
      },
      {
        title: "Cotton T-Shirt",
        summary: "Soft and comfortable everyday t-shirt",
        description:
          "A classic t-shirt made from 100% organic cotton. Soft, breathable, and perfect for everyday wear. Available in multiple colors.",
        category: "t-shirts",
        basePrice: 49,
        variants: [
          { size: "S", color: "White", stock: 30, price: 49 },
          { size: "M", color: "White", stock: 35, price: 49 },
          { size: "L", color: "White", stock: 28, price: 49 },
          { size: "S", color: "Black", stock: 25, price: 49 },
          { size: "M", color: "Black", stock: 32, price: 49 },
          { size: "L", color: "Black", stock: 26, price: 49 },
        ],
        style: "Casual",
        materials: ["Cotton"],
        sleeveLength: "Short",
      },
      {
        title: "Embroidered Kurti",
        summary: "Traditional kurti with modern embroidery",
        description:
          "A beautiful kurti featuring intricate embroidery work. Made from premium cotton fabric. Perfect for both casual and semi-formal occasions.",
        category: "sarees-kurti",
        basePrice: 179,
        variants: [
          { size: "S", color: "Maroon", stock: 12, price: 179 },
          { size: "M", color: "Maroon", stock: 15, price: 179 },
          { size: "L", color: "Maroon", stock: 10, price: 179 },
          { size: "M", color: "Green", stock: 14, price: 179 },
          { size: "L", color: "Green", stock: 11, price: 179 },
        ],
        style: "Festive",
        materials: ["Cotton", "Silk"],
        sleeveLength: "3/4",
      },
      {
        title: "Silk Scarf Set",
        summary: "Luxurious silk scarves in multiple colors",
        description:
          "A set of premium silk scarves perfect for accessorizing. Soft, lightweight, and available in various colors. Can be worn as a headscarf, neck scarf, or shawl.",
        category: "accessories",
        basePrice: 79,
        variants: [
          { size: "Free Size", color: "Mustard", stock: 20, price: 79 },
          { size: "Free Size", color: "Pink", stock: 18, price: 79 },
          { size: "Free Size", color: "Blue", stock: 15, price: 79 },
          { size: "Free Size", color: "Green", stock: 22, price: 79 },
        ],
        style: "Casual",
        materials: ["Silk"],
      },
      {
        title: "Maxi Abaya",
        summary: "Elegant full-length abaya for modest wear",
        description:
          "A beautiful maxi abaya made from premium fabric. Features a flowing silhouette and comfortable fit. Perfect for daily wear or special occasions.",
        category: "abaya-hijab",
        basePrice: 199,
        variants: [
          { size: "S", color: "Black", stock: 10, price: 199 },
          { size: "M", color: "Black", stock: 15, price: 199 },
          { size: "L", color: "Black", stock: 12, price: 199 },
          { size: "XL", color: "Black", stock: 8, price: 199 },
          { size: "M", color: "Navy", stock: 12, price: 199 },
        ],
        isBestSeller: true,
        style: "Modest",
        materials: ["Polyester", "Viscose"],
        sleeveLength: "Long",
      },
      {
        title: "Lace Nightgown",
        summary: "Comfortable and elegant sleepwear",
        description:
          "A beautiful lace-trimmed nightgown made from soft, breathable fabric. Features delicate lace details and a comfortable fit perfect for a good night's sleep.",
        category: "lingerie-sleepwear",
        basePrice: 69,
        variants: [
          { size: "S", color: "White", stock: 15, price: 69 },
          { size: "M", color: "White", stock: 20, price: 69 },
          { size: "L", color: "White", stock: 16, price: 69 },
          { size: "M", color: "Pink", stock: 18, price: 69 },
        ],
        style: "Casual",
        materials: ["Cotton", "Lace"],
      },
      {
        title: "A-Line Floral Dress",
        summary: "Charming floral dress for spring occasions",
        description:
          "A delightful A-line dress featuring a beautiful floral print. Made from lightweight fabric perfect for warm weather. Features a flattering fit and comfortable design.",
        category: "dresses",
        basePrice: 149,
        variants: [
          { size: "S", color: "Pink", stock: 14, price: 149 },
          { size: "M", color: "Pink", stock: 18, price: 149 },
          { size: "L", color: "Pink", stock: 12, price: 149 },
          { size: "M", color: "Blue", stock: 16, price: 149 },
        ],
        isFeatured: true,
        style: "Casual",
        materials: ["Polyester", "Cotton"],
        sleeveLength: "Short",
      },
      {
        title: "Structured Blazer",
        summary: "Professional blazer for office wear",
        description:
          "A well-tailored blazer perfect for professional settings. Features a structured fit, notched lapels, and button closure. Available in classic colors.",
        category: "tops",
        basePrice: 229,
        variants: [
          { size: "S", color: "Black", stock: 10, price: 229 },
          { size: "M", color: "Black", stock: 12, price: 229 },
          { size: "L", color: "Black", stock: 9, price: 229 },
          { size: "M", color: "Navy", stock: 11, price: 229 },
        ],
        style: "Formal",
        materials: ["Polyester", "Wool"],
        sleeveLength: "Long",
      },
      {
        title: "Pleated Midi Skirt",
        summary: "Elegant pleated skirt with modern design",
        description:
          "A sophisticated pleated midi skirt that adds movement and elegance to any outfit. Made from premium fabric with a comfortable elastic waistband.",
        category: "bottoms",
        basePrice: 139,
        variants: [
          { size: "S", color: "Black", stock: 16, price: 139 },
          { size: "M", color: "Black", stock: 20, price: 139 },
          { size: "L", color: "Black", stock: 14, price: 139 },
          { size: "M", color: "Beige", stock: 18, price: 139 },
        ],
        style: "Formal",
        materials: ["Polyester", "Viscose"],
      },
    ];

    // Helper function to get placeholder images
    const getPlaceholderImage = (index: number, type: "hero" | "gallery" = "hero") => {
      // Use Picsum Photos (Lorem Picsum) - reliable and free placeholder service
      // Using seed parameter for consistent images per product
      const width = type === "hero" ? 800 : 600;
      const height = type === "hero" ? 1000 : 800;
      
      // Create unique seed for each product/image combination
      const seed = `selara-fashion-${index}-${type}`;
      
      // Picsum Photos with seed for consistent images
      return `https://picsum.photos/seed/${seed}/${width}/${height}`;
    };

    // Create products from data
    const products = productData.map((data, index) => {
      const category = getCategory(data.category);
      if (!category) {
        throw new Error(`Category not found: ${data.category}`);
      }

      const slug = slugify(data.title);
      const heroImage = getPlaceholderImage(index, "hero");
      const galleryImage1 = getPlaceholderImage(index, "gallery");
      const galleryImage2 = getPlaceholderImage(index + 1, "gallery");
      
      const variants = data.variants.map((variant, vIndex) => ({
        sku: `SEL-${String(index + 1).padStart(3, "0")}-${variant.size}-${variant.color.substring(0, 3).toUpperCase()}`,
        size: variant.size,
        color: variant.color,
        stock: variant.stock,
        price: variant.price,
        images: [getPlaceholderImage(index + vIndex, "gallery")],
      }));

      return {
        title: data.title,
        slug: `${slug}-${index + 1}`,
        summary: data.summary,
        description: data.description,
        categories: [category._id],
        basePrice: data.basePrice,
        variants,
        isFeatured: data.isFeatured || false,
        isBestSeller: data.isBestSeller || false,
        tags: data.isFeatured ? ["featured"] : data.isBestSeller ? ["bestseller"] : [],
        style: data.style,
        materials: data.materials || [],
        sleeveLength: data.sleeveLength,
        fabrics: data.materials || [],
        heroImage,
        gallery: [galleryImage1, galleryImage2],
        rating: 4.5 + Math.random() * 0.5,
        ratingCount: Math.floor(Math.random() * 100) + 10,
      };
    });

    const createdProducts = await ProductModel.insertMany(products);
    console.log(`Created ${createdProducts.length} products`);

    // Create sample orders
    const orderStatuses = ["pending", "confirmed", "packed", "shipped", "delivered"];
    const paymentMethods = ["cod", "card"] as const;
    
    // Get some products for orders
    const product1 = createdProducts[0];
    const product2 = createdProducts[1];
    const product3 = createdProducts[2];
    const product4 = createdProducts[5];
    
    const sampleOrders = [];
    
    // Create orders from the last 30 days
    for (let i = 0; i < 15; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);
      
      const selectedProducts = [
        product1,
        product2,
        product3,
        product4,
      ].slice(0, Math.floor(Math.random() * 3) + 1);
      
      const items = selectedProducts.map((product) => {
        const variant = product.variants[Math.floor(Math.random() * product.variants.length)];
        return {
          product: product._id,
          title: product.title,
          variantSku: variant.sku,
          size: variant.size,
          color: variant.color,
          price: variant.price,
          quantity: Math.floor(Math.random() * 2) + 1,
          thumbnail: product.heroImage,
        };
      });
      
      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const deliveryFee = subtotal >= 150 ? 0 : 5;
      const discount = Math.random() > 0.7 ? Math.floor(subtotal * 0.1) : 0;
      const total = subtotal + deliveryFee - discount;
      
      const statusIndex = Math.min(
        Math.floor((30 - daysAgo) / 6),
        orderStatuses.length - 1
      );
      const status = orderStatuses[statusIndex];
      
      sampleOrders.push({
        user: customer._id,
        email: customer.email,
        address: {
          recipientName: customer.name,
          line1: "123 Test Street",
          city: "Mumbai",
          state: "Maharashtra",
          postalCode: "400001",
          country: "IN",
          phone: "+91 9876543210",
        },
        items,
        subtotal,
        discount,
        deliveryFee,
        total,
        couponCode: discount > 0 ? "WELCOME10" : undefined,
        status,
        payment: {
          method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
          status: status === "delivered" ? "paid" : status === "cancelled" ? "refunded" : "pending",
        },
        delivery: {
          method: "Standard",
          fee: deliveryFee,
          estimatedDate: new Date(createdAt.getTime() + 5 * 24 * 60 * 60 * 1000),
          statusHistory: [
            {
              status: "pending",
              note: "Order placed",
              timestamp: createdAt,
            },
          ],
        },
        createdAt,
        updatedAt: createdAt,
      });
    }
    
    await OrderModel.insertMany(sampleOrders);
    console.log(`Created ${sampleOrders.length} sample orders`);

    // Create coupons
    await CouponModel.insertMany([
      {
        code: "WELCOME10",
        type: "percentage",
        value: 10,
        minSpend: 50,
        maxDiscount: 20,
        isActive: true,
        usageLimit: 100,
      },
      {
        code: "SAVE20",
        type: "fixed",
        value: 20,
        minSpend: 100,
        isActive: true,
        usageLimit: 50,
      },
    ]);
    console.log("Created coupons");

    // Create site settings
    await SiteSettingModel.create({
      shipping: {
        defaultFee: 5,
        freeOver: 150,
        deliveryZones: [
          {
            name: "Standard",
            minDays: 3,
            maxDays: 7,
            fee: 5,
            freeOver: 150,
          },
        ],
      },
      paymentMethods: {
        cod: true,
        card: true,
        bankTransfer: false,
      },
    });
    console.log("Created site settings");

    console.log("Seed completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seed();