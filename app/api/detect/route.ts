import { generateObject } from "ai"
import { z } from "zod"
import { createGroq } from "@ai-sdk/groq"
import { blockchain } from "@/lib/blockchain"

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

const trafficSignSchema = z.object({
  signType: z.string().describe("The type of traffic sign detected (e.g., STOP, YIELD, SPEED_LIMIT, NO_PARKING, etc.)"),
  confidence: z.number().min(0).max(1).describe("Confidence score between 0 and 1"),
  description: z.string().describe("Detailed description of the detected sign"),
  color: z.string().optional().describe("Primary color of the sign"),
  shape: z.string().optional().describe("Shape of the sign (octagon, triangle, circle, rectangle)"),
  text: z.string().optional().describe("Any text visible on the sign"),
  boundingBox: z
    .object({
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number(),
    })
    .optional()
    .describe("Approximate bounding box of the sign in the image"),
})

function getDemoDetection() {
  const demoSigns = [
    {
      signType: "STOP",
      confidence: 0.94,
      description: "Red octagonal stop sign requiring vehicles to come to a complete stop",
      color: "Red",
      shape: "Octagon",
      text: "STOP",
      boundingBox: { x: 120, y: 80, width: 200, height: 200 },
    },
    {
      signType: "SPEED_LIMIT",
      confidence: 0.89,
      description: "Speed limit sign indicating maximum speed of 50 km/h",
      color: "White with red border",
      shape: "Circle",
      text: "50",
      boundingBox: { x: 150, y: 100, width: 180, height: 180 },
    },
    {
      signType: "YIELD",
      confidence: 0.91,
      description: "Yellow triangular yield sign indicating drivers must give way",
      color: "Yellow",
      shape: "Triangle",
      text: "YIELD",
      boundingBox: { x: 100, y: 90, width: 220, height: 190 },
    },
    {
      signType: "NO_PARKING",
      confidence: 0.87,
      description: "No parking sign with red circle and diagonal line",
      color: "Blue with red",
      shape: "Circle",
      text: "P",
      boundingBox: { x: 130, y: 110, width: 160, height: 160 },
    },
  ]
  return demoSigns[Math.floor(Math.random() * demoSigns.length)]
}

async function attemptAIDetection(
  imageData: string,
): Promise<{ detection: z.infer<typeof trafficSignSchema>; isDemo: boolean }> {
  if (!process.env.GROQ_API_KEY) {
    console.log("[v0] No GROQ_API_KEY set, using demo mode")
    return { detection: getDemoDetection(), isDemo: true }
  }

  return new Promise((resolve) => {
    generateObject({
      model: groq("meta-llama/llama-4-scout-17b-16e-instruct"),
      schema: trafficSignSchema,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this image and detect any traffic signs present. If you see a traffic sign, provide detailed information about it. If no traffic sign is visible, return signType as "NONE" with appropriate description. Be precise about the sign type and provide a realistic confidence score.`,
            },
            {
              type: "image",
              image: imageData,
            },
          ],
        },
      ],
    })
      .then((result) => {
        console.log("[v0] AI detection successful")
        resolve({ detection: result.object, isDemo: false })
      })
      .catch((error) => {
        console.log("[v0] AI call failed, falling back to demo:", error?.message || "Unknown error")
        resolve({ detection: getDemoDetection(), isDemo: true })
      })
  })
}

export async function POST(req: Request) {
  try {
    const { imageData, location, deviceId } = await req.json()

    if (!imageData) {
      return Response.json({ error: "No image data provided" }, { status: 400 })
    }

    const { detection, isDemo } = await attemptAIDetection(imageData)

    const blockchainRecord = await blockchain.addBlock(
      imageData,
      {
        signType: detection.signType,
        confidence: detection.confidence,
        description: detection.description,
        boundingBox: detection.boundingBox,
      },
      { location, deviceId },
    )

    return Response.json({
      detection,
      isDemo,
      blockchain: {
        blockId: blockchainRecord.id,
        hash: blockchainRecord.hash,
        previousHash: blockchainRecord.previousHash,
        timestamp: blockchainRecord.timestamp,
        imageHash: blockchainRecord.data.imageHash,
      },
    })
  } catch (error: unknown) {
    console.error("[v0] Unexpected error, using demo fallback:", error)
    const demoDetection = getDemoDetection()

    return Response.json({
      detection: demoDetection,
      isDemo: true,
      blockchain: {
        blockId: `demo-${Date.now()}`,
        hash: `demo-hash-${Math.random().toString(36).slice(2)}`,
        previousHash: "genesis",
        timestamp: Date.now(),
        imageHash: `demo-image-${Math.random().toString(36).slice(2)}`,
      },
    })
  }
}
