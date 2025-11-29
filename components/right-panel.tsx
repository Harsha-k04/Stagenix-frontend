"use client"

import { useState } from "react"
import { sendPrompt, uploadImage } from "@/lib/api"

interface RightPanelProps {
  isGenerating: boolean
  setIsGenerating: (value: boolean) => void
  setSceneObjects: (objects: any[]) => void
}

export default function RightPanel({
  isGenerating,
  setIsGenerating,
  setSceneObjects,
}: RightPanelProps) {
  const [prompt, setPrompt] = useState("")
  const [results, setResults] = useState<any>(null)

  // 🧠 Function for text prompt
 const handleGenerate = async () => {
  if (!prompt.trim()) return alert("Enter a prompt");

  setIsGenerating(true);
  setResults(null);

  try {
    // 1️⃣ Ask backend to create job
    const { job_id } = await request3DGeneration(prompt);
    console.log("Job created:", job_id);

    // 2️⃣ Poll job status every 4 seconds
    const interval = setInterval(async () => {
      const statusData = await checkJobStatus(job_id);
      console.log("Status:", statusData);

      if (statusData.status === "done") {
        clearInterval(interval);

        const glbUrl = `${API_BASE_URL}/result/${job_id}`;

        // 🔥 Replace sceneObjects with the 3D model returned
        setSceneObjects([
          {
            name: "wedding", // any label
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            glbUrl,      // <<<<<< USE THIS IN CANVAS3D
          },
        ]);

        setIsGenerating(false);
      }

      if (statusData.status === "failed") {
        clearInterval(interval);
        setIsGenerating(false);
        alert("Generation failed.");
      }
    }, 4000);
  } catch (err) {
    console.error(err);
    setIsGenerating(false);
  }
};


  // 🧠 Function for image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsGenerating(true)
    try {
      const data = await uploadImage(file)
      console.log("Image response:", data)
      setResults(data)

      // ✅ If backend returns objects from segmentation
      if (data.objects) setSceneObjects(data.objects)
    } catch (err) {
      console.error("Upload error:", err)
      alert("Failed to upload image.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="p-4 border-l border-primary/20 flex flex-col h-full bg-card/30">
      <h2 className="text-xl font-semibold mb-4">AI Stage Generator</h2>

      {/* Text Prompt Input */}
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe your stage design (e.g. 'a vase and a plant on stage')..."
        className="w-full h-32 p-2 border rounded-lg bg-background/50 mb-4"
      />

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="bg-primary text-white py-2 rounded-lg hover:bg-primary/80 mb-4"
      >
        {isGenerating ? "Generating..." : "Generate from Prompt"}
      </button>

      {/* Image Upload Section */}
      <label className="block text-sm font-medium text-muted-foreground mb-2">
        Or upload an image for segmentation:
      </label>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="mb-4"
      />

      {/* Backend Result Preview */}
      {results && (
        <div className="mt-4 text-sm text-green-400">
          ✅ Received response from backend:
          <pre className="bg-black/20 p-2 rounded mt-2 text-xs overflow-auto">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
