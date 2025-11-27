export const API_BASE_URL = "https://stagenix-backend.onrender.com";

export async function sendPrompt(prompt: string) {
  const formData = new FormData();
  formData.append("prompt", prompt);
  const res = await fetch(`${API_BASE_URL}/predict`, { method: "POST", body: formData });
  if (!res.ok) throw new Error("Failed to get response from backend");
  return res.json();
}

export async function uploadImage(imageFile: File) {
  const formData = new FormData();
  formData.append("image", imageFile);
  const res = await fetch(`${API_BASE_URL}/predict`, { method: "POST", body: formData });
  if (!res.ok) throw new Error("Failed to upload image");
  return res.json();
}
