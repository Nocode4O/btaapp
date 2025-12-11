"use client"

import type React from "react"

import { Activity, Database, Clock, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface StatsPanelProps {
  totalDetections: number
  lastDetectionTime: number | null
}

export function StatsPanel({ totalDetections, lastDetectionTime }: StatsPanelProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard icon={Activity} label="Total Detections" value={totalDetections.toString()} color="primary" />
      <StatCard icon={Database} label="Blocks Created" value={totalDetections.toString()} color="accent" />
      <StatCard
        icon={Clock}
        label="Last Detection"
        value={lastDetectionTime ? formatTimeAgo(lastDetectionTime) : "Never"}
        color="info"
      />
      <StatCard icon={TrendingUp} label="Chain Status" value="Healthy" color="success" />
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  color: "primary" | "accent" | "info" | "success"
}) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary border-primary/20",
    accent: "bg-accent/10 text-accent border-accent/20",
    info: "bg-info/10 text-info border-info/20",
    success: "bg-success/10 text-success border-success/20",
  }

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`flex items-center justify-center w-10 h-10 rounded-lg border ${colorClasses[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-semibold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return "Just now"
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}
