import { v2 as cloudinary } from "cloudinary";
import { env } from "@/lib/env";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export const uploadImage = async (
  file: Buffer | string,
  options: {
    folder?: string;
    public_id?: string;
    transformation?: any;
  } = {}
): Promise<UploadResult> => {
  const uploadOptions: any = {
    folder: options.folder || env.CLOUDINARY_UPLOAD_FOLDER,
    ...options.transformation,
  };

  if (options.public_id) {
    uploadOptions.public_id = options.public_id;
  }

  let result;
  if (typeof file === "string") {
    // URL upload
    result = await cloudinary.uploader.upload(file, uploadOptions);
  } else {
    // Buffer upload - convert to base64 data URI
    const base64 = file.toString("base64");
    const dataUri = `data:image/jpeg;base64,${base64}`;
    result = await cloudinary.uploader.upload(dataUri, uploadOptions);
  }

  return {
    public_id: result.public_id,
    secure_url: result.secure_url,
    url: result.url,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  };
};

export const deleteImage = async (publicId: string): Promise<boolean> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === "ok";
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    return false;
  }
};

export const generateUploadSignature = (params: {
  folder?: string;
  timestamp?: number;
}) => {
  const timestamp = params.timestamp || Math.round(new Date().getTime() / 1000);
  const folder = params.folder || env.CLOUDINARY_UPLOAD_FOLDER;

  const signature = cloudinary.utils.api_sign_request(
    {
      folder,
      timestamp,
    },
    env.CLOUDINARY_API_SECRET
  );

  return {
    signature,
    timestamp,
    folder,
    api_key: env.CLOUDINARY_API_KEY,
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
  };
};

export { cloudinary };

