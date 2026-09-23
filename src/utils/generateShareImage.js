import html2canvas from "html2canvas";

export async function generateImageBlob(element) {
  const canvas = await html2canvas(element, {
    useCORS: true,
    backgroundColor: null,
    scale: 2, // supaya hasil gambar lebih tajam (retina quality)
  });

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
}