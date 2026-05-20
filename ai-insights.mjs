// ai-insights.mjs
// 0G Compute Hello World — AI analysis whale data via Qwen2.5
// Jalankan: node ai-insights.mjs

import OpenAI from 'openai'
import { Indexer, MemData } from '@0gfoundation/0g-storage-ts-sdk'
import { ethers } from 'ethers'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { writeFileSync, existsSync, readFileSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: join(__dirname, '.env') })

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const ZG_COMPUTE_ENDPOINT = 'https://router-api-testnet.integratenetwork.work/v1'
const ZG_COMPUTE_API_KEY  = process.env.ZG_COMPUTE_API_KEY
const MODEL               = 'qwen/qwen-2.5-7b-instruct'

const GRAPH_ENDPOINT = 'https://api.studio.thegraph.com/query/1749265/tronic-staking/v0.0.2'
const RPC_URL        = 'https://evmrpc-testnet.0g.ai'
const INDEXER_RPC    = 'https://indexer-storage-testnet-turbo.0g.ai'
const PRIVATE_KEY    = process.env.PRIVATE_KEY

// ─── 1. FETCH WHALE DATA FROM THE GRAPH ──────────────────────────────────────
async function fetchWhaleData() {
  const res = await fetch(GRAPH_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `{
        stakeds(first: 10, orderBy: blockNumber, orderDirection: desc) {
          id user amount blockNumber
        }
        unstakeds(first: 10, orderBy: blockNumber, orderDirection: desc) {
          id user amount reward blockNumber
        }
      }`
    })
  })
  const json = await res.json()
  console.log('✅ Whale data fetched from The Graph')
  return json.data
}

// ─── 2. AI ANALYSIS VIA 0G COMPUTE ───────────────────────────────────────────
async function analyzeWithAI(graphData) {
  const client = new OpenAI({
    baseURL: ZG_COMPUTE_ENDPOINT,
    apiKey: ZG_COMPUTE_API_KEY,
  })

  const summary = {
    recentStakes: graphData.stakeds.map(tx => ({
      user: tx.user,
      amount_eth: (parseFloat(tx.amount) / 1e18).toFixed(4),
      block: tx.blockNumber
    })),
    recentUnstakes: graphData.unstakeds.map(tx => ({
      user: tx.user,
      amount_eth: (parseFloat(tx.amount) / 1e18).toFixed(4),
      block: tx.blockNumber
    })),
  }

  const prompt = `You are a DeFi analyst for TronicLens, an on-chain analytics dashboard on Ethereum Sepolia testnet.

Analyze this recent staking activity and respond ONLY with a valid JSON object, no explanation:

${JSON.stringify(summary, null, 2)}

JSON format:
{
  "whaleAlert": "1 sentence about the biggest staking activity",
  "protocolHealthScore": <number 0-100>,
  "healthReasoning": "1 sentence explanation",
  "riskLevel": "Low|Medium|High",
  "keyInsight": "1 actionable insight for stakers",
  "sentiment": "Bullish|Neutral|Bearish"
}`

  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 300,
  })

  const raw = completion.choices[0].message.content.trim()
  console.log('✅ AI response from 0G Compute:')
  console.log(raw)

  // Parse JSON dari response
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Response bukan valid JSON')
  return JSON.parse(jsonMatch[0])
}

// ─── 3. SAVE RESULT TO 0G STORAGE ────────────────────────────────────────────
async function saveToStorage(aiResult) {
  const provider = new ethers.JsonRpcProvider(RPC_URL)
  const signer   = new ethers.Wallet(PRIVATE_KEY, provider)

  const payload = {
    timestamp: new Date().toISOString(),
    source: 'TronicLens AI Insights — 0G Compute',
    model: MODEL,
    result: aiResult,
  }

  const data    = new TextEncoder().encode(JSON.stringify(payload, null, 2))
  const memData = new MemData(data)

  const [tree, treeErr] = await memData.merkleTree()
  if (treeErr) throw new Error(`Merkle tree error: ${treeErr}`)
  // Append ke og-snapshots.json supaya muncul di dashboard
  const historyPath = join(__dirname, 'public', 'og-snapshots.json')
  let history = []
  if (existsSync(historyPath)) {
    history = JSON.parse(readFileSync(historyPath, 'utf-8'))
  }
  history.unshift({
    timestamp: payload.timestamp,
    rootHash,
    sequence: tx?.txSeq ?? null,
    type: 'ai-insights',
    sentiment: aiResult.sentiment,
    healthScore: aiResult.protocolHealthScore,
  })
  history = history.slice(0, 10)
  writeFileSync(historyPath, JSON.stringify(history, null, 2))
  console.log('💾 Updated og-snapshots.json')

  return rootHash
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 TronicLens AI Insights — 0G Compute Hello World\n')

  if (!ZG_COMPUTE_API_KEY) throw new Error('ZG_COMPUTE_API_KEY tidak ada di .env!')
  if (!PRIVATE_KEY) throw new Error('PRIVATE_KEY tidak ada di .env!')

  const graphData = await fetchWhaleData()
  const aiResult  = await analyzeWithAI(graphData)

  console.log('\n📊 Final AI Analysis:')
  console.log(JSON.stringify(aiResult, null, 2))

  const rootHash = await saveToStorage(aiResult)

  console.log('\n🎉 COMPLETE!')
  console.log('Root Hash :', rootHash)
  console.log('StorageScan: https://storagescan-galileo.0g.ai')
}

main().catch(console.error)