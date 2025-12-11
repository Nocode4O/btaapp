"use client"

import { useState } from "react"
import { Link2, Hash, Clock, Shield, CheckCircle2, Loader2, Copy, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface BlockchainRecordProps {
  record: {
    blockId: string
    hash: string
    previousHash: string
    timestamp: number
    imageHash: string
  } | null
}

export function BlockchainRecord({ record }: BlockchainRecordProps) {
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const verifyBlock = async () => {
    if (!record) return
    setIsVerifying(true)
    setVerificationResult(null)

    try {
      const res = await fetch(`/api/blockchain?action=verify&blockId=${record.blockId}`)
      const data = await res.json()
      setVerificationResult(data.valid)
    } catch {
      setVerificationResult(false)
    } finally {
      setIsVerifying(false)
    }
  }

  if (!record) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Link2 className="w-4 h-4 text-muted-foreground" />
            Blockchain Record
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Shield className="w-8 h-8 mb-2" />
            <p className="text-sm">No record yet</p>
            <p className="text-xs mt-1">Detection will be logged to blockchain</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const truncateHash = (hash: string) => `${hash.slice(0, 8)}...${hash.slice(-8)}`

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Link2 className="w-4 h-4 text-primary" />
            Blockchain Record
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={verifyBlock}
            disabled={isVerifying}
            className="h-7 text-xs bg-transparent"
          >
            {isVerifying ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Shield className="w-3 h-3 mr-1" />}
            Verify
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {verificationResult !== null && (
          <div
            className={cn(
              "flex items-center gap-2 p-2 rounded-lg text-sm",
              verificationResult
                ? "bg-success/10 text-success border border-success/20"
                : "bg-destructive/10 text-destructive border border-destructive/20",
            )}
          >
            <CheckCircle2 className="w-4 h-4" />
            {verificationResult ? "Block verified successfully" : "Verification failed"}
          </div>
        )}

        <div className="space-y-2">
          <HashField
            label="Block Hash"
            value={record.hash}
            truncated={truncateHash(record.hash)}
            onCopy={() => copyToClipboard(record.hash, "hash")}
            copied={copiedField === "hash"}
          />
          <HashField
            label="Previous Hash"
            value={record.previousHash}
            truncated={truncateHash(record.previousHash)}
            onCopy={() => copyToClipboard(record.previousHash, "prevHash")}
            copied={copiedField === "prevHash"}
          />
          <HashField
            label="Image Hash"
            value={record.imageHash}
            truncated={truncateHash(record.imageHash)}
            onCopy={() => copyToClipboard(record.imageHash, "imgHash")}
            copied={copiedField === "imgHash"}
          />
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-border text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span className="text-xs">{new Date(record.timestamp).toLocaleString()}</span>
        </div>
      </CardContent>
    </Card>
  )
}

function HashField({
  label,
  value,
  truncated,
  onCopy,
  copied,
}: {
  label: string
  value: string
  truncated: string
  onCopy: () => void
  copied: boolean
}) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/50 border border-border">
      <div className="flex items-center gap-2 min-w-0">
        <Hash className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xs font-mono text-foreground truncate">{truncated}</p>
        </div>
      </div>
      <Button variant="ghost" size="sm" onClick={onCopy} className="h-6 w-6 p-0 shrink-0">
        {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
      </Button>
    </div>
  )
}
