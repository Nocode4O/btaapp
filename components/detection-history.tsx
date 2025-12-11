"use client"

import { useState, useEffect, useCallback } from "react"
import { History, ChevronDown, ChevronUp, Shield, CheckCircle2, XCircle, Loader2, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface BlockRecord {
  id: string
  hash: string
  previousHash: string
  timestamp: number
  data: {
    imageHash: string
    detectionResult: {
      signType: string
      confidence: number
      description: string
    }
    metadata: {
      location?: string
      modelVersion: string
    }
  }
}

export function DetectionHistory({ refreshTrigger }: { refreshTrigger?: number }) {
  const [records, setRecords] = useState<BlockRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(true)
  const [chainValid, setChainValid] = useState<boolean | null>(null)
  const [verifyingChain, setVerifyingChain] = useState(false)

  const fetchRecords = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/blockchain")
      const data = await res.json()
      setRecords(data.chain || [])
    } catch (error) {
      console.error("Failed to fetch records:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords, refreshTrigger]) // Re-fetch when refreshTrigger changes

  const verifyChain = async () => {
    setVerifyingChain(true)
    try {
      const res = await fetch("/api/blockchain?action=verify-chain")
      const data = await res.json()
      setChainValid(data.valid)
    } catch {
      setChainValid(false)
    } finally {
      setVerifyingChain(false)
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            Detection History
            <span className="text-xs text-muted-foreground font-normal">({records.length} records)</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={fetchRecords} disabled={isLoading} className="h-7 w-7 p-0">
              <RefreshCw className={cn("w-3 h-3", isLoading && "animate-spin")} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={verifyChain}
              disabled={verifyingChain}
              className="h-7 text-xs bg-transparent"
            >
              {verifyingChain ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Shield className="w-3 h-3 mr-1" />}
              Verify Chain
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="h-7 w-7 p-0">
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        {chainValid !== null && (
          <div
            className={cn(
              "flex items-center gap-2 mt-2 p-2 rounded-lg text-xs",
              chainValid
                ? "bg-success/10 text-success border border-success/20"
                : "bg-destructive/10 text-destructive border border-destructive/20",
            )}
          >
            {chainValid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
            {chainValid ? "Blockchain integrity verified - all blocks valid" : "Chain integrity compromised"}
          </div>
        )}
      </CardHeader>
      {isExpanded && (
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
            </div>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <History className="w-8 h-8 mb-2" />
              <p className="text-sm">No detections recorded yet</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
              {records
                .slice()
                .reverse()
                .map((record) => (
                  <div
                    key={record.id}
                    className="p-3 rounded-lg bg-secondary/30 border border-border hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "text-xs font-mono px-2 py-0.5 rounded",
                              record.data.detectionResult.signType === "NONE"
                                ? "bg-warning/20 text-warning"
                                : "bg-primary/20 text-primary",
                            )}
                          >
                            {record.data.detectionResult.signType.replace(/_/g, " ")}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {Math.round(record.data.detectionResult.confidence * 100)}%
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {record.data.detectionResult.description}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-mono text-muted-foreground">{record.hash.slice(0, 8)}...</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(record.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
