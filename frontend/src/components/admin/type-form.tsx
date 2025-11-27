"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";
import { X, Upload, Image as ImageIcon } from "lucide-react";

type TypeFormProps = {
  type?: any;
  typeId?: string;
  onCancel?: () => void;
  onSubmit?: () => void;
};

export const TypeForm = ({
  type,
  typeId,
  onCancel,
  onSubmit,
}: TypeFormProps) => {
  const isEditMode = !!type || !!typeId;
  const [name, setName] = useState(type?.name || "");
  const [slug, setSlug] = useState(type?.slug || "");
  const [description, setDescription] = useState(type?.description || "");
  const [position, setPosition] = useState(type?.position || 0);
  const [heroImage, setHeroImage] = useState(type?.heroImage || "");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Load type data when editing
  useEffect(() => {
    if (typeId && !type) {
      const loadType = async () => {
        try {
          const response = await fetch(`/api/types/id/${typeId}`);
          if (response.ok) {
            const data = await response.json();
            const typeData = data.data;
            setName(typeData.name || "");
            setSlug(typeData.slug || "");
            setDescription(typeData.description || "");
            setPosition(typeData.position || 0);
            setHeroImage(typeData.heroImage || "");
          }
        } catch (error) {
          console.error("Failed to load type:", error);
          toast.error("Failed to load type");
        }
      };
      loadType();
    } else if (type) {
      setName(type.name || "");
      setSlug(type.slug || "");
      setDescription(type.description || "");
      setPosition(type.position || 0);
      setHeroImage(type.heroImage || "");
    }
  }, [typeId, type]);

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
      formData.append("folder", "types");

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

      if (heroImage) {
        formData.heroImage = heroImage;
      }

      const id = typeId || type?._id;
      const url = id ? `/api/types/id/${id}` : "/api/types";
      const method = id ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${id ? 'update' : 'create'} type`);
      }

      toast.success(`Type ${id ? 'updated' : 'created'} successfully!`);
      
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
        setHeroImage("");
      }
    } catch (error: any) {
      toast.error(error.message || `Failed to ${isEditMode ? 'update' : 'create'} type`);
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
            Type Management
          </p>
          <h3 className="text-xl font-semibold">
            {isEditMode ? "Edit type" : "Add type"}
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

      {/* Type Image Upload */}
      <div>
        <label className="text-sm font-medium mb-2 block">Type Image</label>
        {heroImage ? (
          <div className="relative inline-block">
            <div className="relative w-48 h-48 rounded-lg overflow-hidden border border-[var(--border)]">
              <Image
                src={heroImage}
                alt="Type image"
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
              {uploading ? "Uploading..." : "Click to upload type image"}
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
          setHeroImage("");
        }}>
          Reset
        </Button>
        <Button type="submit" loading={submitting}>
          {isEditMode ? "Update Type" : "Create Type"}
        </Button>
      </div>
    </form>
  );
};

