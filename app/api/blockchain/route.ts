import { blockchain } from "@/lib/blockchain"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get("action")
  const blockId = searchParams.get("blockId")

  if (action === "verify" && blockId) {
    const result = await blockchain.verifyBlock(blockId)
    return Response.json(result)
  }

  if (action === "verify-chain") {
    const isValid = await blockchain.verifyChain()
    const chain = await blockchain.getChain()
    return Response.json({ valid: isValid, blockCount: chain.length })
  }

  const chain = await blockchain.getChain()
  const displayChain = chain.slice(1) // Exclude genesis for display
  const latestBlock = await blockchain.getLatestBlock()

  return Response.json({
    chain: displayChain,
    totalBlocks: displayChain.length,
    latestBlock,
  })
}
