"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";
import { X, Upload, Image as ImageIcon } from "lucide-react";

type CategoryFormProps = {
  category?: any;
  categoryId?: string;
  onCancel?: () => void;
  onSubmit?: () => void;
};

export const CategoryForm = ({
  category,
  categoryId,
  onCancel,
  onSubmit,
}: CategoryFormProps) => {
  const isEditMode = !!category || !!categoryId;
  const [name, setName] = useState(category?.name || "");
  const [slug, setSlug] = useState(category?.slug || "");
  const [description, setDescription] = useState(category?.description || "");
  const [position, setPosition] = useState(category?.position || 0);
  const [parentId, setParentId] = useState<string>(category?.parent?.toString() || category?.parent || "");
  const [heroImage, setHeroImage] = useState(category?.heroImage || "");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [parentCategories, setParentCategories] = useState<Array<{ value: string; label: string }>>([]);
  const [loadingParents, setLoadingParents] = useState(true);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Load parent categories
  useEffect(() => {
    const loadParentCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          setParentCategories(
            data.data.map((cat: any) => ({
              value: cat._id,
              label: cat.name,
            }))
          );
        }
      } catch (error) {
        console.error("Failed to load parent categories:", error);
      } finally {
        setLoadingParents(false);
      }
    };
    loadParentCategories();
  }, []);

  // Load category data when editing
  useEffect(() => {
    const loadCategoryData = async () => {
      if (categoryId && !category) {
        try {
          const response = await fetch(`/api/categories/id/${categoryId}`);
          if (response.ok) {
            const data = await response.json();
            const catData = data.data;
            const currentCategoryId = catData._id?.toString() || categoryId;
            setName(catData.name || "");
            setSlug(catData.slug || "");
            setDescription(catData.description || "");
            setPosition(catData.position || 0);
            setParentId(catData.parent?.toString() || catData.parent || "");
            setHeroImage(catData.heroImage || "");
          }
        } catch (error) {
          console.error("Failed to load category:", error);
          toast.error("Failed to load category");
        }
      } else if (category) {
        const currentCategoryId = category._id?.toString() || categoryId;
        setName(category.name || "");
        setSlug(category.slug || "");
        setDescription(category.description || "");
        setPosition(category.position || 0);
        setParentId(category.parent?.toString() || category.parent || "");
        setHeroImage(category.heroImage || "");
      }
    };
    
    loadCategoryData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, category]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "categories");

      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const result = await response.json();
      setHeroImage(result.data.url);
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploading(false);
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    }
  };

  const removeImage = () => {
    setHeroImage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData: any = {
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
        description: description || undefined,
        position: position || 0,
      };

      if (parentId) {
        formData.parent = parentId;
      } else {
        formData.parent = null;
      }

      if (heroImage) {
        formData.heroImage = heroImage;
      }

      const id = categoryId || category?._id;
      const url = id ? `/api/categories/id/${id}` : "/api/categories";
      const method = id ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${id ? 'update' : 'create'} category`);
      }

      toast.success(`Category ${id ? 'updated' : 'created'} successfully!`);
      
      if (onSubmit) {
        onSubmit();
      }
      
      router.refresh();
      if (onCancel) {
        onCancel();
      } else {
        // Reset form
        setName("");
        setSlug("");
        setDescription("");
        setPosition(0);
        setParentId("");
        setHeroImage("");
      }
    } catch (error: any) {
      toast.error(error.message || `Failed to ${isEditMode ? 'update' : 'create'} category`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
            Category Management
          </p>
          <h3 className="text-xl font-semibold">
            {isEditMode ? "Edit category" : "Add category"}
          </h3>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Slug</label>
          <Input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="Auto-generated from name"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Description</label>
        <Textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Position</label>
          <Input
            type="number"
            value={position}
            onChange={(e) => setPosition(Number(e.target.value))}
            placeholder="0"
          />
          <p className="text-xs text-[var(--muted)] mt-1">
            Lower numbers appear first
          </p>
        </div>
        <div>
          <label className="text-sm font-medium">Parent Category</label>
          {loadingParents ? (
            <Input disabled placeholder="Loading categories..." />
          ) : (
            <Select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
            >
              <option value="">None (Top-level category)</option>
              {parentCategories
                .filter((cat) => cat.value !== (categoryId || category?._id?.toString()))
                .map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
            </Select>
          )}
          <p className="text-xs text-[var(--muted)] mt-1">
            Select a parent category to create a subcategory
          </p>
        </div>
      </div>

      {/* Category Image Upload */}
      <div>
        <label className="text-sm font-medium mb-2 block">Category Image</label>
        {heroImage ? (
          <div className="relative inline-block">
            <div className="relative w-48 h-48 rounded-lg overflow-hidden border border-[var(--border)]">
              <Image
                src={heroImage}
                alt="Category image"
                fill
                className="object-cover"
              />
            </div>
            <button
              type="button"
              onClick={removeImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => imageInputRef.current?.click()}
            className="border-2 border-dashed border-[var(--border)] rounded-lg p-8 text-center cursor-pointer hover:border-[var(--primary)] transition-colors"
          >
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <ImageIcon className="w-12 h-12 mx-auto mb-2 text-[var(--muted)]" />
            <p className="text-sm text-[var(--muted)]">
              {uploading ? "Uploading..." : "Click to upload category image"}
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="button" variant="ghost" onClick={() => {
          setName("");
          setSlug("");
          setDescription("");
          setPosition(0);
          setParentId("");
          setHeroImage("");
        }}>
          Reset
        </Button>
        <Button type="submit" loading={submitting}>
          {isEditMode ? "Update Category" : "Create Category"}
        </Button>
      </div>
    </form>
  );
};

