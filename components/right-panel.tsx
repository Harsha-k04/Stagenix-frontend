"use client" 

import { useState, forwardRef, useImperativeHandle } from "react"
import { sendPrompt, uploadImage } from "@/lib/api"
import { request3DGeneration, checkJobStatus } from "@/lib/api";
import { API_BASE_URL } from "@/lib/api";

interface RightPanelProps {
  isGenerating: boolean
  setIsGenerating: (value: boolean) => void
  setSceneObjects: (objects: any[]) => void
  onSketchSelected?: (file: File) => void
}

const RightPanel = forwardRef(function RightPanel(
  {
    isGenerating,
    setIsGenerating,
    setSceneObjects,
  }: RightPanelProps,
  ref
) {

  const [prompt, setPrompt] = useState("")
  const [results, setResults] = useState<any>(null)

  // 🔥 SKETCH HANDLER (CALLED FROM LEFT SIDEBAR → DASHBOARD)
  const handleSketchUpload = async (file: File) => {
    setIsGenerating(true)

    try {
      const formData = new FormData()
      formData.append("sketch", file)

      const res = await fetch(`${API_BASE_URL}/api/upload-sketch`, {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      console.log("Sketch saved:", data)
      const sketchUrl = data.sketch_url
      // Create job WITH sketch path
      const jobData = await request3DGeneration(prompt, {
        sketch_url: sketchUrl,
        use_controlnet: true
      })

      const job_id = jobData.job_id
      console.log("Sketch job created:", job_id)

      // Poll status
      const interval = setInterval(async () => {
        const statusData = await checkJobStatus(job_id)

        if (statusData.status === "done") {
          clearInterval(interval)

          const glbUrl = `${API_BASE_URL}/result/${job_id}`

          setSceneObjects([
            {
              name: "stage",
              position: [0, 0, 0],
              rotation: [0, 0, 0],
              glbUrl,
            },
          ])

          setIsGenerating(false)
        }

        if (statusData.status === "failed") {
          clearInterval(interval)
          setIsGenerating(false)
          alert("Sketch-based generation failed.")
        }
      }, 4000)

    } catch (err) {
      console.error("Sketch error:", err)
      alert("Sketch upload failed.")
      setIsGenerating(false)
    }
  }

  // 👉 EXPOSE sketch handler to Dashboard using ref
  useImperativeHandle(ref, () => ({
    handleSketchUpload
  }))

  // TEXT–PROMPT GENERATION (UNCHANGED)
  const handleGenerate = async () => {
    if (!prompt.trim()) return alert("Enter a prompt")

    setIsGenerating(true)
    setResults(null)

    try {
      const { job_id } = await request3DGeneration(prompt)
      console.log("Job created:", job_id)

      const interval = setInterval(async () => {
        const statusData = await checkJobStatus(job_id)

        if (statusData.status === "done") {
          clearInterval(interval)

          const glbUrl = `${API_BASE_URL}/result/${job_id}`

          setSceneObjects([
            {
              name: "stage",
              position: [0, 0, 0],
              rotation: [0, 0, 0],
              glbUrl,
            },
          ])

          setIsGenerating(false)
        }

        if (statusData.status === "failed") {
          clearInterval(interval)
          setIsGenerating(false)
        }
      }, 4000)

    } catch (err) {
      console.error(err)
      setIsGenerating(false)
    }
  }

  // NORMAL IMAGE SEGMENTATION (UNCHANGED)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsGenerating(true)
    try {
      const data = await uploadImage(file)
      setResults(data)
      if (data.objects) setSceneObjects(data.objects)
    } catch (err) {
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="p-4 border-l border-primary/20 flex flex-col h-full bg-card/30">
      <h2 className="text-xl font-semibold mb-4">AI Stage Generator</h2>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe your stage design..."
        className="w-full h-32 p-2 border rounded-lg bg-background/50 mb-4"
      />

      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="bg-primary text-white py-2 rounded-lg hover:bg-primary/80 mb-4"
      >
        {isGenerating ? "Generating..." : "Generate from Prompt"}
      </button>

      <label className="block text-sm font-medium text-muted-foreground mb-2">
        Or upload an image for segmentation:
      </label>
      <input type="file" accept="image/*" onChange={handleImageUpload} className="mb-4" />

      {results && (
        <div className="mt-4 text-sm text-green-400">
          <pre className="bg-black/20 p-2 rounded mt-2 text-xs overflow-auto">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
})

export default RightPanel
