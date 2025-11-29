export const API_BASE_URL = "https://stagenix-backend.onrender.com";

// 1️⃣ Create job
export async function request3DGeneration(prompt: string) {
  const res = await fetch(`${API_BASE_URL}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) throw new Error("Failed to create job");
  return res.json(); // {job_id}
}

// 2️⃣ Poll job status
export async function checkJobStatus(job_id: string) {
  const res = await fetch(`${API_BASE_URL}/status/${job_id}`);
  return res.json();
}
