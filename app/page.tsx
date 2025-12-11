"use client"

import { useState, useCallback } from "react"
import { Header } from "@/components/header"
import { ImageUpload } from "@/components/image-upload"
import { DetectionResult } from "@/components/detection-result"
import { BlockchainRecord } from "@/components/blockchain-record"
import { DetectionHistory } from "@/components/detection-history"
import { StatsPanel } from "@/components/stats-panel"
import { Button } from "@/components/ui/button"
import { Scan, RefreshCw } from "lucide-react"

interface Detection {
  signType: string
  confidence: number
  description: string
  color?: string
  shape?: string
  text?: string
}

interface BlockchainData {
  blockId: string
  hash: string
  previousHash: string
  timestamp: number
  imageHash: string
}

export default function Home() {
  const [imageData, setImageData] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [detection, setDetection] = useState<Detection | null>(null)
  const [blockchainData, setBlockchainData] = useState<BlockchainData | null>(null)
  const [totalDetections, setTotalDetections] = useState(0)
  const [lastDetectionTime, setLastDetectionTime] = useState<number | null>(null)
  const [isDemo, setIsDemo] = useState(false)
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0)

  const handleImageSelect = useCallback((data: string) => {
    setImageData(data)
    setDetection(null)
    setBlockchainData(null)
    setIsDemo(false)
  }, [])

  const runDetection = async () => {
    if (!imageData) return

    setIsProcessing(true)
    setDetection(null)
    setBlockchainData(null)
    setIsDemo(false)

    try {
      const res = await fetch("/api/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageData,
          location: "Web Upload",
          deviceId: "browser-client",
        }),
      })

      if (!res.ok) throw new Error("Detection failed")

      const data = await res.json()
      setDetection(data.detection)
      setBlockchainData(data.blockchain)
      setIsDemo(data.isDemo || false)
      setTotalDetections((prev) => prev + 1)
      setLastDetectionTime(Date.now())
      setHistoryRefreshTrigger((prev) => prev + 1)
    } catch (error) {
      console.error("Detection error:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const resetAll = () => {
    setImageData(null)
    setDetection(null)
    setBlockchainData(null)
    setIsDemo(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Traffic Sign Detection</h2>
          <p className="text-muted-foreground">
            Upload an image to detect traffic signs. Every detection is cryptographically hashed and recorded on an
            immutable blockchain ledger for verification.
          </p>
        </div>

        <StatsPanel totalDetections={totalDetections} lastDetectionTime={lastDetectionTime} />

        <div className="grid lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card border border-border rounded-lg p-4">
              <ImageUpload onImageSelect={handleImageSelect} isProcessing={isProcessing} />

              <div className="flex gap-2 mt-4">
                <Button onClick={runDetection} disabled={!imageData || isProcessing} className="flex-1">
                  <Scan className="w-4 h-4 mr-2" />
                  {isProcessing ? "Analyzing..." : "Detect Signs"}
                </Button>
                <Button variant="outline" onClick={resetAll} disabled={isProcessing}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <DetectionResult detection={detection} isDemo={isDemo} />
              <BlockchainRecord record={blockchainData} />
            </div>

            <DetectionHistory refreshTrigger={historyRefreshTrigger} />
          </div>
        </div>
      </main>
    </div>
  )
}
