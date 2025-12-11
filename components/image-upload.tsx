"use client"

import type React from "react"

import { useCallback, useState } from "react"
import { Upload, Camera, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  onImageSelect: (imageData: string) => void
  isProcessing: boolean
}

export function ImageUpload({ onImageSelect, isProcessing }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setPreview(result)
        onImageSelect(result)
      }
      reader.readAsDataURL(file)
    },
    [onImageSelect],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const clearImage = () => {
    setPreview(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-foreground">Upload Image</h2>
        {preview && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearImage}
            disabled={isProcessing}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {preview ? (
        <div className="relative rounded-lg overflow-hidden border border-border bg-secondary/50">
          <img src={preview || "/placeholder.svg"} alt="Upload preview" className="w-full h-64 object-contain" />
          {isProcessing && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <span className="text-sm text-muted-foreground">Analyzing image...</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <label
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "flex flex-col items-center justify-center h-64 rounded-lg border-2 border-dashed cursor-pointer transition-all duration-200",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border bg-secondary/30 hover:border-primary/50 hover:bg-secondary/50",
          )}
        >
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
            }}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-secondary">
              <Upload className="w-6 h-6" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">Drop image here or click to upload</p>
              <p className="text-xs mt-1">Supports JPG, PNG, WebP</p>
            </div>
          </div>
        </label>
      )}

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 bg-transparent"
          disabled={isProcessing}
          onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
        >
          <Camera className="w-4 h-4 mr-2" />
          Take Photo
        </Button>
      </div>
    </div>
  )
}
