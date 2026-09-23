const CLOUD_NAME = "oewrvegb";
const UPLOAD_PRESET = "celenganku_preset";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export function validateImageFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Format file tidak didukung. Gunakan JPG, PNG, atau WEBP.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "Ukuran file terlalu besar. Maksimal 5 MB.";
  }
  return null;
}

export async function uploadImageToCloudinary(file) {
  const error = validateImageFile(file);
  if (error) {
    throw new Error(error);
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!response.ok) {
    throw new Error("Upload gagal. Coba lagi.");
  }

  const data = await response.json();
  return data.secure_url;
}