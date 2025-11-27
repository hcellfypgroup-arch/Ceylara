"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema } from "@/lib/validators";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MultiSelect } from "@/components/ui/multi-select";
import { ColorPicker } from "@/components/ui/color-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { Select } from "@/components/ui/select";
import { SIZE_OPTIONS } from "@/lib/constants";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";
import { X, Upload, Image as ImageIcon, Plus, Trash2 } from "lucide-react";

type ProductFormValues = {
  title: string;
  summary: string;
  description: string;
  basePrice: number;
  weight?: number;
  categories: string[];
  types?: string[];
  variants: Array<{
    sku: string;
    size: string;
    color: string;
    stock: number;
    price: number;
    salePrice?: number;
  }>;
};

type ProductFormProps = {
  product?: any;
  productId?: string;
  onSubmit?: (values: ProductFormValues) => Promise<void> | void;
  onCancel?: () => void;
};

export const ProductForm = ({
  product,
  productId,
  onSubmit,
  onCancel,
}: ProductFormProps) => {
  const isEditMode = !!product || !!productId;
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<Array<{ value: string; label: string }>>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [types, setTypes] = useState<Array<{ value: string; label: string }>>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [loadingProduct, setLoadingProduct] = useState(isEditMode && !product);
  const [heroImage, setHeroImage] = useState<string>("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isCustomOrderEnabled, setIsCustomOrderEnabled] = useState(false);
  const [customOrderSurcharge, setCustomOrderSurcharge] = useState(0);
  const [customFields, setCustomFields] = useState<Array<{
    label: string;
    type: "text" | "number" | "textarea" | "dropdown";
    required: boolean;
    options?: string[];
  }>>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const heroInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      title: "",
      summary: "",
      description: "",
      basePrice: 120,
      categories: [],
      types: [],
      variants: [
        {
          sku: "SEL-001",
          size: "S",
          color: "Sand",
          stock: 20,
          price: 120,
        },
      ],
    },
  });

  // Load product data when editing
  useEffect(() => {
    const loadProduct = async () => {
      if (productId && !product) {
        try {
          setLoadingProduct(true);
          const response = await fetch(`/api/products/id/${productId}`);
          if (response.ok) {
            const data = await response.json();
            const productData = data.data;
            
            // Populate form with product data
            reset({
              title: productData.title || "",
              summary: productData.summary || "",
              description: productData.description || "",
              basePrice: productData.basePrice || 120,
              categories: productData.categories?.map((cat: any) => 
                typeof cat === 'string' ? cat : cat._id || cat
              ) || [],
              types: productData.types?.map((type: any) => 
                typeof type === 'string' ? type : type._id || type
              ) || [],
              variants: productData.variants?.length > 0 
                ? productData.variants.map((v: any) => ({
                    sku: v.sku || "",
                    size: v.size || "",
                    color: v.color || "",
                    stock: v.stock || 0,
                    price: v.price || productData.basePrice,
                    salePrice: v.salePrice,
                  }))
                : [{
                    sku: "SEL-001",
                    size: "S",
                    color: "Sand",
                    stock: 20,
                    price: productData.basePrice || 120,
                  }],
            });
            // Set images - ensure they're strings/arrays
            setHeroImage(productData.heroImage ? String(productData.heroImage) : "");
            setGalleryImages(
              Array.isArray(productData.gallery) && productData.gallery.length > 0
                ? productData.gallery.map((img: any) => String(img))
                : []
            );
            // Set featured and bestseller flags
            setIsFeatured(productData.isFeatured || false);
            setIsBestSeller(productData.isBestSeller || false);
            // Set custom order fields
            setIsCustomOrderEnabled(productData.isCustomOrderEnabled || false);
            setCustomOrderSurcharge(productData.customOrderSurcharge || 0);
            setCustomFields(productData.customFields || []);
            // Set weight if available
            if (productData.weight !== undefined) {
              setValue("weight", productData.weight);
            }
            // Extract unique sizes and colors from variants
            const sizes = [...new Set(productData.variants?.map((v: any) => v.size).filter(Boolean) || [])];
            const colors = [...new Set(productData.variants?.map((v: any) => v.color).filter(Boolean) || [])];
            setSelectedSizes(sizes.length > 0 ? sizes : []);
            setSelectedColors(colors.length > 0 ? colors : []);
          }
        } catch (error) {
          console.error("Failed to load product:", error);
          toast.error("Failed to load product");
        } finally {
          setLoadingProduct(false);
        }
      } else if (product) {
        // Populate form with provided product data
        reset({
          title: product.title || "",
          summary: product.summary || "",
          description: product.description || "",
          basePrice: product.basePrice || 120,
          weight: product.weight || 0,
          categories: product.categories?.map((cat: any) => 
            typeof cat === 'string' ? cat : cat._id || cat
          ) || [],
          types: product.types?.map((type: any) => 
            typeof type === 'string' ? type : type._id || type
          ) || [],
          variants: product.variants?.length > 0 
            ? product.variants.map((v: any) => ({
                sku: v.sku || "",
                size: v.size || "",
                color: v.color || "",
                stock: v.stock || 0,
                price: v.price || product.basePrice,
                salePrice: v.salePrice,
              }))
            : [{
                sku: "SEL-001",
                size: "S",
                color: "Sand",
                stock: 20,
                price: product.basePrice || 120,
              }],
        });
        // Set images - ensure they're strings/arrays
        setHeroImage(product.heroImage ? String(product.heroImage) : "");
        setGalleryImages(
          Array.isArray(product.gallery) && product.gallery.length > 0
            ? product.gallery.map((img: any) => String(img))
            : []
        );
        // Set featured and bestseller flags
        setIsFeatured(product.isFeatured || false);
        setIsBestSeller(product.isBestSeller || false);
        // Set custom order fields
        setIsCustomOrderEnabled(product.isCustomOrderEnabled || false);
        setCustomOrderSurcharge(product.customOrderSurcharge || 0);
        setCustomFields(product.customFields || []);
        // Extract unique sizes and colors from variants
        const sizes = [...new Set(product.variants?.map((v: any) => v.size).filter(Boolean) || [])];
        const colors = [...new Set(product.variants?.map((v: any) => v.color).filter(Boolean) || [])];
        setSelectedSizes(sizes.length > 0 ? sizes : []);
        setSelectedColors(colors.length > 0 ? colors : []);
      }
    };
    loadProduct();
  }, [product, productId, reset]);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(
            data.data.map((cat: any) => ({
              value: cat._id,
              label: cat.name,
            }))
          );
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        toast.error("Failed to load categories");
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch types on mount
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const response = await fetch("/api/types");
        if (response.ok) {
          const data = await response.json();
          setTypes(
            data.data.map((type: any) => ({
              value: type._id,
              label: type.name,
            }))
          );
        }
      } catch (error) {
        console.error("Failed to fetch types:", error);
        toast.error("Failed to load types");
      } finally {
        setLoadingTypes(false);
      }
    };
    fetchTypes();
  }, []);

  const selectedCategories = watch("categories") || [];
  const selectedTypes = watch("types") || [];
  const baseSku = watch("variants.0.sku") || "SEL-001";
  const basePrice = watch("basePrice") || 120;
  const baseStock = watch("variants.0.stock") || 0;

  // Image upload handlers
  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setUploadingHero(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "products");

      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const result = await response.json();
      setHeroImage(result.data.url);
      toast.success("Hero image uploaded successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploadingHero(false);
      if (heroInputRef.current) {
        heroInputRef.current.value = "";
      }
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      toast.error("Please select image files");
      return;
    }

    setUploadingGallery(true);
    try {
      const uploadPromises = imageFiles.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "products");

        const response = await fetch("/api/uploads", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        const result = await response.json();
        return result.data.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setGalleryImages((prev) => [...prev, ...uploadedUrls]);
      toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
    } catch (error: any) {
      toast.error(error.message || "Failed to upload images");
    } finally {
      setUploadingGallery(false);
      if (galleryInputRef.current) {
        galleryInputRef.current.value = "";
      }
    }
  };

  const removeHeroImage = () => {
    setHeroImage("");
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Generate variants from selected sizes and colors
  const generateVariants = (sizes: string[], colors: string[], existingVariants?: any[]): Array<{
    sku: string;
    size: string;
    color: string;
    stock: number;
    price: number;
    salePrice?: number;
  }> => {
    if (sizes.length === 0 || colors.length === 0) {
      return existingVariants || [];
    }

    const variants: Array<{
      sku: string;
      size: string;
      color: string;
      stock: number;
      price: number;
      salePrice?: number;
    }> = [];

    // Create a map of existing variants by size-color key for preserving data
    const existingVariantMap = new Map<string, any>();
    if (existingVariants) {
      existingVariants.forEach((v) => {
        const key = `${v.size}-${v.color}`;
        existingVariantMap.set(key, v);
      });
    }

    sizes.forEach((size) => {
      colors.forEach((color, colorIdx) => {
        const key = `${size}-${color}`;
        const existing = existingVariantMap.get(key);
        
        // Generate SKU: baseSku-size-colorIndex
        const colorIndex = colors.indexOf(color) + 1;
        const sku = existing?.sku || `${baseSku}-${size}-${colorIndex}`.toUpperCase().replace(/\s+/g, "-");
        
        variants.push({
          sku,
          size,
          color,
          stock: existing?.stock ?? baseStock,
          price: existing?.price ?? basePrice,
          salePrice: existing?.salePrice,
        });
      });
    });

    return variants;
  };

  // Update variants when sizes or colors change
  useEffect(() => {
    if (selectedSizes.length > 0 && selectedColors.length > 0) {
      const currentVariants = watch("variants") || [];
      const variants = generateVariants(selectedSizes, selectedColors, currentVariants);
      setValue("variants", variants, { shouldDirty: false });
    } else if (selectedSizes.length === 0 && selectedColors.length === 0) {
      // If no sizes or colors selected, keep at least one empty variant
      setValue("variants", [{
        sku: baseSku,
        size: "",
        color: "",
        stock: baseStock,
        price: basePrice,
      }], { shouldDirty: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSizes, selectedColors, baseSku, basePrice, baseStock]);

  const submit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      // Generate variants from selected sizes and colors
      let finalVariants = values.variants;
      if (selectedSizes.length > 0 && selectedColors.length > 0) {
        finalVariants = generateVariants(selectedSizes, selectedColors, values.variants);
      }

      // Ensure categories and types are properly formatted as arrays of strings
      const formData: any = {
        ...values,
        categories: Array.isArray(values.categories) 
          ? values.categories.filter(Boolean)
          : [],
        types: Array.isArray(values.types) 
          ? values.types.filter(Boolean)
          : [],
        variants: finalVariants,
      };
      
      // Always include images (even if empty) so they can be updated/cleared
      formData.heroImage = heroImage || "";
      formData.gallery = galleryImages || [];
      // Include featured and bestseller flags
      formData.isFeatured = isFeatured;
      formData.isBestSeller = isBestSeller;
      // Include custom order fields
      formData.isCustomOrderEnabled = isCustomOrderEnabled;
      formData.customOrderSurcharge = customOrderSurcharge;
      formData.customFields = customFields;

      // Always submit to API
      const id = productId || (product?._id ? String(product._id) : null);
      const url = id ? `/api/products/id/${id}` : "/api/products";
      const method = id ? "PATCH" : "POST";

      console.log("Submitting form data:", JSON.stringify(formData, null, 2));
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${id ? 'update' : 'create'} product`);
      }

      toast.success(`Product ${id ? 'updated' : 'created'} successfully!`);
      
      // Call onSubmit callback if provided (for UI state management)
      if (onSubmit) {
        await onSubmit(formData);
      }
      
      router.refresh();
      if (onCancel) {
        onCancel();
      } else {
        reset();
        setHeroImage("");
        setGalleryImages([]);
        setIsFeatured(false);
        setIsBestSeller(false);
      }
    } catch (error: any) {
      toast.error(error.message || `Failed to ${isEditMode ? 'update' : 'create'} product`);
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <form
      onSubmit={submit}
      className="space-y-6 rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
            Product Management
          </p>
          <h3 className="text-xl font-semibold">
            {isEditMode ? "Edit product" : "Add product"}
          </h3>
        </div>
        <Badge tone="brand">CSV import available</Badge>
      </div>
      {loadingProduct && (
        <div className="text-center py-4 text-sm text-[var(--muted)]">
          Loading product data...
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Title</label>
          <Input {...register("title")} />
          {errors.title && (
            <p className="text-xs text-red-500">{errors.title.message}</p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium">Summary</label>
          <Input {...register("summary")} />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Description</label>
        <Textarea rows={4} {...register("description")} />
      </div>

      {/* Hero Image Upload */}
      <div>
        <label className="text-sm font-medium mb-2 block">Hero Image</label>
        {heroImage ? (
          <div className="relative inline-block">
            <div className="relative w-48 h-48 rounded-lg overflow-hidden border border-[var(--border)]">
              <Image
                src={heroImage}
                alt="Hero image"
                fill
                className="object-cover"
              />
            </div>
            <button
              type="button"
              onClick={removeHeroImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => heroInputRef.current?.click()}
            className="border-2 border-dashed border-[var(--border)] rounded-lg p-8 text-center cursor-pointer hover:border-[var(--primary)] transition-colors"
          >
            <input
              ref={heroInputRef}
              type="file"
              accept="image/*"
              onChange={handleHeroImageUpload}
              className="hidden"
            />
            <ImageIcon className="w-12 h-12 mx-auto mb-2 text-[var(--muted)]" />
            <p className="text-sm text-[var(--muted)]">
              {uploadingHero ? "Uploading..." : "Click to upload hero image"}
            </p>
          </div>
        )}
      </div>

      {/* Gallery Images Upload */}
      <div>
        <label className="text-sm font-medium mb-2 block">Gallery Images</label>
        <div className="grid grid-cols-4 gap-4 mb-4">
          {galleryImages.map((image, index) => (
            <div key={index} className="relative group">
              <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-[var(--border)]">
                <Image
                  src={image}
                  alt={`Gallery ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => removeGalleryImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <div
            onClick={() => galleryInputRef.current?.click()}
            className="border-2 border-dashed border-[var(--border)] rounded-lg p-4 text-center cursor-pointer hover:border-[var(--primary)] transition-colors aspect-square flex flex-col items-center justify-center"
          >
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryUpload}
              className="hidden"
            />
            <Upload className="w-6 h-6 mb-1 text-[var(--muted)]" />
            <p className="text-xs text-[var(--muted)]">
              {uploadingGallery ? "Uploading..." : "Add images"}
            </p>
          </div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="text-sm font-medium">Base price</label>
          <Input type="number" {...register("basePrice", { valueAsNumber: true })} />
        </div>
        <div>
          <label className="text-sm font-medium">Weight (grams)</label>
          <Input 
            type="number" 
            {...register("weight", { valueAsNumber: true })} 
            placeholder="0"
          />
          <p className="text-xs text-[var(--muted)] mt-1">
            Used for shipping calculation
          </p>
        </div>
        <div>
          <label className="text-sm font-medium">Base SKU</label>
          <Input placeholder="SEL-001" {...register("variants.0.sku")} />
          <p className="text-xs text-[var(--muted)] mt-1">
            Variant SKUs will be auto-generated (e.g., SEL-001-S-1)
          </p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Categories</label>
          {loadingCategories ? (
            <Input disabled placeholder="Loading categories..." />
          ) : (
            <MultiSelect
              options={categories}
              value={selectedCategories}
              onChange={(values) => setValue("categories", values)}
              placeholder="Select categories..."
            />
          )}
          {errors.categories && (
            <p className="text-xs text-red-500">
              {Array.isArray(errors.categories)
                ? errors.categories[0]?.message
                : errors.categories.message}
            </p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium">Types</label>
          {loadingTypes ? (
            <Input disabled placeholder="Loading types..." />
          ) : (
            <MultiSelect
              options={types}
              value={selectedTypes}
              onChange={(values) => setValue("types", values)}
              placeholder="Select types..."
            />
          )}
          {errors.types && (
            <p className="text-xs text-red-500">
              {Array.isArray(errors.types)
                ? errors.types[0]?.message
                : errors.types.message}
            </p>
          )}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Sizes</label>
          <MultiSelect
            options={SIZE_OPTIONS.map((size) => ({ value: size, label: size }))}
            value={selectedSizes}
            onChange={setSelectedSizes}
            placeholder="Select sizes..."
          />
          <p className="text-xs text-[var(--muted)] mt-1">
            Select all available sizes for this product
          </p>
        </div>
        <div>
          <label className="text-sm font-medium">Colors</label>
          <ColorPicker
            value={selectedColors}
            onChange={setSelectedColors}
            placeholder="Select colors..."
          />
          <p className="text-xs text-[var(--muted)] mt-1">
            Select all available colors for this product
          </p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Default Stock</label>
          <Input
            type="number"
            {...register("variants.0.stock", { valueAsNumber: true })}
            placeholder="0"
          />
          <p className="text-xs text-[var(--muted)] mt-1">
            Default stock quantity for all variants (can be edited per variant later)
          </p>
        </div>
        <div>
          <label className="text-sm font-medium">Default Price</label>
          <Input
            type="number"
            {...register("variants.0.price", { valueAsNumber: true })}
            placeholder="120"
          />
          <p className="text-xs text-[var(--muted)] mt-1">
            Default price for all variants (can be edited per variant later)
          </p>
        </div>
      </div>
      {selectedSizes.length > 0 && selectedColors.length > 0 && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--accent)] p-4">
          <p className="text-sm font-medium mb-2">
            Variants Preview ({selectedSizes.length * selectedColors.length} variants will be created):
          </p>
          <div className="text-xs text-[var(--muted)] space-y-1">
            {selectedSizes.map((size) => (
              <div key={size} className="flex gap-2">
                <span className="font-medium">{size}:</span>
                <span>{selectedColors.join(", ")}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Featured and Best Seller Toggles */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex items-center gap-3 p-4 rounded-lg border border-[var(--border)]">
          <Checkbox
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            label="Featured Product"
          />
          <p className="text-xs text-[var(--muted)] ml-auto">
            Show in "Editors' picks for this season"
          </p>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-lg border border-[var(--border)]">
          <Checkbox
            checked={isBestSeller}
            onChange={(e) => setIsBestSeller(e.target.checked)}
            label="Best Seller"
          />
          <p className="text-xs text-[var(--muted)] ml-auto">
            Show in "Most loved pieces"
          </p>
        </div>
      </div>

      {/* Custom Orders Configuration */}
      <div className="space-y-4 rounded-lg border border-[var(--border)] bg-[var(--accent)]/5 p-4">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={isCustomOrderEnabled}
            onChange={(e) => {
              setIsCustomOrderEnabled(e.target.checked);
              if (!e.target.checked) {
                setCustomFields([]);
                setCustomOrderSurcharge(0);
              }
            }}
            label="Enable Custom Orders"
          />
          <p className="text-xs text-[var(--muted)] ml-auto">
            Allow customers to place custom orders with additional measurements/requirements
          </p>
        </div>

        {isCustomOrderEnabled && (
          <div className="space-y-4 pt-4 border-t border-[var(--border)]">
            <div>
              <label className="text-sm font-medium">Custom Order Surcharge</label>
              <Input
                type="number"
                value={customOrderSurcharge}
                onChange={(e) => setCustomOrderSurcharge(Number(e.target.value) || 0)}
                placeholder="0"
                min="0"
                step="0.01"
              />
              <p className="text-xs text-[var(--muted)] mt-1">
                Additional price charged for custom orders (added to base price)
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Custom Fields</label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCustomFields([
                      ...customFields,
                      { label: "", type: "text", required: false },
                    ]);
                  }}
                  className="text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Field
                </Button>
              </div>
              <div className="space-y-3">
                {customFields.map((field, index) => (
                  <div
                    key={index}
                    className="grid gap-3 p-3 rounded-lg border border-[var(--border)] bg-white"
                  >
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="text-xs font-medium">Field Label</label>
                        <Input
                          value={field.label}
                          onChange={(e) => {
                            const updated = [...customFields];
                            updated[index].label = e.target.value;
                            setCustomFields(updated);
                          }}
                          placeholder="e.g., Bust Measurement"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium">Field Type</label>
                        <Select
                          value={field.type}
                          onChange={(e) => {
                            const updated = [...customFields];
                            updated[index].type = e.target.value as "text" | "number" | "textarea" | "dropdown";
                            if (e.target.value !== "dropdown") {
                              delete updated[index].options;
                            } else if (!updated[index].options) {
                              updated[index].options = [];
                            }
                            setCustomFields(updated);
                          }}
                        >
                          <option value="text">Text</option>
                          <option value="number">Number</option>
                          <option value="textarea">Textarea</option>
                          <option value="dropdown">Dropdown</option>
                        </Select>
                      </div>
                    </div>
                    {field.type === "dropdown" && (
                      <div>
                        <label className="text-xs font-medium">Options (comma-separated)</label>
                        <Input
                          value={field.options?.join(", ") || ""}
                          onChange={(e) => {
                            const updated = [...customFields];
                            updated[index].options = e.target.value
                              .split(",")
                              .map((opt) => opt.trim())
                              .filter(Boolean);
                            setCustomFields(updated);
                          }}
                          placeholder="e.g., Small, Medium, Large"
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <Checkbox
                        checked={field.required}
                        onChange={(e) => {
                          const updated = [...customFields];
                          updated[index].required = e.target.checked;
                          setCustomFields(updated);
                        }}
                        label="Required"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCustomFields(customFields.filter((_, i) => i !== index));
                        }}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
                {customFields.length === 0 && (
                  <p className="text-xs text-[var(--muted)] text-center py-4">
                    No custom fields added. Click "Add Field" to create one.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            reset();
            setHeroImage("");
            setGalleryImages([]);
            setIsFeatured(false);
            setIsBestSeller(false);
            setIsCustomOrderEnabled(false);
            setCustomOrderSurcharge(0);
            setCustomFields([]);
          }}
        >
          Reset
        </Button>
        <Button type="submit" loading={submitting} disabled={loadingProduct}>
          {isEditMode ? "Update Product" : "Save Product"}
        </Button>
      </div>
    </form>
  );
};

