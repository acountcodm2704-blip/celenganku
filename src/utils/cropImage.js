export function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}

export async function getCroppedImageBlob(imageSrc, croppedAreaPixels, maxWidth = 1280) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // perkecil kalau hasil crop terlalu besar, supaya tidak melebihi batas 5MB
  const scale = Math.min(1, maxWidth / croppedAreaPixels.width);
  const outW = Math.round(croppedAreaPixels.width * scale);
  const outH = Math.round(croppedAreaPixels.height * scale);

  canvas.width = outW;
  canvas.height = outH;

  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    outW,
    outH
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.9);
  });
}