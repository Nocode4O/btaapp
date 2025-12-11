"use client"

import { CheckCircle2, AlertCircle, Target, Percent, FileText, Palette, Shapes, FlaskConical } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface DetectionResultProps {
  detection: {
    signType: string
    confidence: number
    description: string
    color?: string
    shape?: string
    text?: string
  } | null
  isDemo?: boolean
}

export function DetectionResult({ detection, isDemo }: DetectionResultProps) {
  if (!detection) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="w-4 h-4 text-muted-foreground" />
            Detection Result
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <AlertCircle className="w-8 h-8 mb-2" />
            <p className="text-sm">No detection yet</p>
            <p className="text-xs mt-1">Upload an image to analyze</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const isNoSign = detection.signType === "NONE"
  const confidencePercent = Math.round(detection.confidence * 100)

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          Detection Result
          {isDemo && (
            <span className="ml-auto flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-warning/10 text-warning rounded-full">
              <FlaskConical className="w-3 h-3" />
              Demo Mode
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isDemo && (
          <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 text-warning text-xs">
            API quota exceeded. Showing simulated detection. Results are for demonstration only.
          </div>
        )}

        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex items-center justify-center w-12 h-12 rounded-lg",
              isNoSign ? "bg-warning/10" : "bg-success/10",
            )}
          >
            {isNoSign ? (
              <AlertCircle className="w-6 h-6 text-warning" />
            ) : (
              <CheckCircle2 className="w-6 h-6 text-success" />
            )}
          </div>
          <div>
            <p className="font-mono text-lg font-semibold text-foreground">{detection.signType.replace(/_/g, " ")}</p>
            <p className="text-xs text-muted-foreground">Detected Sign Type</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-secondary/50 border border-border">
            <div className="flex items-center gap-2 mb-1">
              <Percent className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Confidence</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span
                className={cn(
                  "text-xl font-mono font-bold",
                  confidencePercent >= 80
                    ? "text-success"
                    : confidencePercent >= 50
                      ? "text-warning"
                      : "text-destructive",
                )}
              >
                {confidencePercent}
              </span>
              <span className="text-xs text-muted-foreground">%</span>
            </div>
          </div>

          {detection.shape && (
            <div className="p-3 rounded-lg bg-secondary/50 border border-border">
              <div className="flex items-center gap-2 mb-1">
                <Shapes className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Shape</span>
              </div>
              <p className="text-sm font-medium text-foreground capitalize">{detection.shape}</p>
            </div>
          )}

          {detection.color && (
            <div className="p-3 rounded-lg bg-secondary/50 border border-border">
              <div className="flex items-center gap-2 mb-1">
                <Palette className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Color</span>
              </div>
              <p className="text-sm font-medium text-foreground capitalize">{detection.color}</p>
            </div>
          )}

          {detection.text && (
            <div className="p-3 rounded-lg bg-secondary/50 border border-border">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Text</span>
              </div>
              <p className="text-sm font-medium text-foreground">{detection.text}</p>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground mb-1">Description</p>
          <p className="text-sm text-foreground leading-relaxed">{detection.description}</p>
        </div>
      </CardContent>
    </Card>
  )
}
