export const API_BASE_URL = "https://stagenix-backend.onrender.com";

// 1️⃣ Create job - CORRECTED TO ACCEPT AND SEND OPTIONS (INCLUDING META)
export async function request3DGeneration(
  prompt: string,
  // 🎯 FIX: Add an optional parameter for configuration (like the meta object)
  options: { [key: string]: any } = {} 
) {
  const body = {
    prompt,
    // 🎯 FIX: Spread the options object into the request body
    ...options
  };

  const res = await fetch(`${API_BASE_URL}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // 🎯 FIX: Stringify the combined body object
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error("Failed to create job");
  return res.json(); // {job_id}
}

// 2️⃣ Poll job status (No change needed)
export async function checkJobStatus(job_id: string) {
  const res = await fetch(`${API_BASE_URL}/status/${job_id}`);
  return res.json();
}
