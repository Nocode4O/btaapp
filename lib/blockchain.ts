// Blockchain ledger with hybrid storage
// Uses in-memory for v0 preview, file-based for production deployment

export interface BlockchainRecord {
  id: string
  hash: string
  previousHash: string
  timestamp: number
  data: {
    imageHash: string
    detectionResult: DetectionData
    metadata: {
      location?: string
      deviceId?: string
      modelVersion: string
    }
  }
  nonce: number
}

export interface DetectionData {
  signType: string
  confidence: number
  boundingBox?: {
    x: number
    y: number
    width: number
    height: number
  }
  description: string
}

const isServerless = typeof window !== "undefined" || process.env.NEXT_RUNTIME === "edge" || !process.env.DATA_DIR

class BlockchainLedger {
  private chain: BlockchainRecord[] = []
  private readonly difficulty = 2
  private initialized = false

  private createGenesisBlock(): BlockchainRecord {
    return {
      id: "genesis",
      hash: "0".repeat(64),
      previousHash: "0".repeat(64),
      timestamp: Date.now(),
      data: {
        imageHash: "genesis",
        detectionResult: {
          signType: "GENESIS",
          confidence: 1,
          description: "Genesis block - ChainSign AI initialized",
        },
        metadata: {
          modelVersion: "1.0.0",
        },
      },
      nonce: 0,
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return

    if (!isServerless && process.env.DATA_DIR) {
      try {
        const { promises: fs } = await import("fs")
        const path = await import("path")
        const filePath = path.join(process.env.DATA_DIR, "blockchain-data.json")
        const data = await fs.readFile(filePath, "utf-8")
        this.chain = JSON.parse(data)
      } catch {
        this.chain = [this.createGenesisBlock()]
        await this.saveToFile()
      }
    } else {
      // In-memory for v0 preview
      if (this.chain.length === 0) {
        this.chain = [this.createGenesisBlock()]
      }
    }

    this.initialized = true
  }

  private async saveToFile(): Promise<void> {
    if (isServerless || !process.env.DATA_DIR) return

    try {
      const { promises: fs } = await import("fs")
      const path = await import("path")
      const filePath = path.join(process.env.DATA_DIR, "blockchain-data.json")
      await fs.mkdir(process.env.DATA_DIR, { recursive: true })
      await fs.writeFile(filePath, JSON.stringify(this.chain, null, 2))
    } catch (error) {
      console.error("[Blockchain] Failed to save:", error)
    }
  }

  async calculateHash(block: Omit<BlockchainRecord, "hash">): Promise<string> {
    const data = JSON.stringify({
      previousHash: block.previousHash,
      timestamp: block.timestamp,
      data: block.data,
      nonce: block.nonce,
    })

    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)
    const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  }

  async calculateImageHash(imageData: string): Promise<string> {
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(imageData.slice(0, 1000))
    const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  }

  async addBlock(
    imageData: string,
    detectionResult: DetectionData,
    metadata: { location?: string; deviceId?: string },
  ): Promise<BlockchainRecord> {
    await this.ensureInitialized()

    const previousBlock = this.chain[this.chain.length - 1]
    const imageHash = await this.calculateImageHash(imageData)

    let nonce = 0
    let hash = ""
    const newBlock: Omit<BlockchainRecord, "hash"> = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      previousHash: previousBlock.hash,
      timestamp: Date.now(),
      data: {
        imageHash,
        detectionResult,
        metadata: {
          ...metadata,
          modelVersion: "1.0.0",
        },
      },
      nonce: 0,
    }

    do {
      nonce++
      newBlock.nonce = nonce
      hash = await this.calculateHash(newBlock)
    } while (!hash.startsWith("0".repeat(this.difficulty)))

    const finalBlock: BlockchainRecord = {
      ...newBlock,
      hash,
    }

    this.chain.push(finalBlock)
    await this.saveToFile()

    return finalBlock
  }

  async getChain(): Promise<BlockchainRecord[]> {
    await this.ensureInitialized()
    return [...this.chain]
  }

  async getLatestBlock(): Promise<BlockchainRecord> {
    await this.ensureInitialized()
    return this.chain[this.chain.length - 1]
  }

  async verifyChain(): Promise<boolean> {
    await this.ensureInitialized()

    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i]
      const previousBlock = this.chain[i - 1]

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false
      }

      const { hash, ...blockWithoutHash } = currentBlock
      const calculatedHash = await this.calculateHash(blockWithoutHash)
      if (hash !== calculatedHash) {
        return false
      }
    }
    return true
  }

  async verifyBlock(blockId: string): Promise<{ valid: boolean; block?: BlockchainRecord }> {
    await this.ensureInitialized()

    const block = this.chain.find((b) => b.id === blockId)
    if (!block) {
      return { valid: false }
    }

    const blockIndex = this.chain.indexOf(block)
    if (blockIndex === 0) {
      return { valid: true, block }
    }

    const previousBlock = this.chain[blockIndex - 1]
    if (block.previousHash !== previousBlock.hash) {
      return { valid: false, block }
    }

    const { hash, ...blockWithoutHash } = block
    const calculatedHash = await this.calculateHash(blockWithoutHash)

    return {
      valid: hash === calculatedHash,
      block,
    }
  }
}

export const blockchain = new BlockchainLedger()
