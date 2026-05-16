// upload-snapshot.mjs
// Script untuk upload whale activity snapshot ke 0G Storage
// Jalankan: node upload-snapshot.mjs

import { Indexer, MemData } from '@0gfoundation/0g-storage-ts-sdk'
import { ethers } from 'ethers'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { writeFileSync, existsSync, readFileSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: join(__dirname, '.env') })

const RPC_URL = 'https://evmrpc-testnet.0g.ai'
const INDEXER_RPC = 'https://indexer-storage-testnet-turbo.0g.ai'
const PRIVATE_KEY = process.env.PRIVATE_KEY
const GRAPH_ENDPOINT = 'https://api.studio.thegraph.com/query/1749265/tronic-staking/v0.0.2'

// 1. Fetch data terbaru dari The Graph
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
  const data = await res.json()
  return data.data
}

async function main() {
  console.log('🔍 Fetching latest whale activity from The Graph...')
  const graphData = await fetchWhaleData()

  const snapshot = {
    timestamp: new Date().toISOString(),
    source: 'TronicLens',
    network: 'Sepolia Testnet',
    contract: '0x89907e8F6CB6468b2c8fe2d3814249881eF06926',
    subgraph: 'tronic-staking v0.0.2',
    stakeds: graphData.stakeds.map(tx => ({
      user: tx.user,
      amount_eth: parseFloat(tx.amount) / 1e18,
      blockNumber: tx.blockNumber
    })),
    unstakeds: graphData.unstakeds.map(tx => ({
      user: tx.user,
      amount_eth: parseFloat(tx.amount) / 1e18,
      reward: tx.reward,
      blockNumber: tx.blockNumber
    })),
    totalStakers: new Set([
      ...graphData.stakeds.map(tx => tx.user),
      ...graphData.unstakeds.map(tx => tx.user)
    ]).size,
  }

  console.log('📦 Snapshot prepared:')
  console.log(JSON.stringify(snapshot, null, 2))

  // 2. Upload ke 0G Storage
  console.log('\n🚀 Uploading to 0G Storage...')
  const provider = new ethers.JsonRpcProvider(RPC_URL)
  const signer = new ethers.Wallet(PRIVATE_KEY, provider)

  const jsonString = JSON.stringify(snapshot, null, 2)
  const data = new TextEncoder().encode(jsonString)
  const memData = new MemData(data)

  const [tree, treeErr] = await memData.merkleTree()
  if (treeErr) throw new Error(`Merkle tree error: ${treeErr}`)
  
  const rootHash = tree.rootHash()
  console.log('📦 Root Hash:', rootHash)

  const indexer = new Indexer(INDEXER_RPC)
  const [tx, uploadErr] = await indexer.upload(memData, RPC_URL, signer)
  if (uploadErr) throw new Error(`Upload error: ${uploadErr}`)

  console.log('✅ Upload successful!')
  console.log('🔑 Root Hash:', rootHash)

  // 3. Simpan root hash ke file untuk ditampilkan di dashboard
  const historyPath = join(__dirname, 'public', 'og-snapshots.json')
  
  let history = []
  if (existsSync(historyPath)) {
    history = JSON.parse(readFileSync(historyPath, 'utf-8'))
  }

  history.unshift({
    timestamp: snapshot.timestamp,
    rootHash,
    sequence: tx?.txSeq ?? null,
    totalStakers: snapshot.totalStakers,
    totalStakeds: snapshot.stakeds.length,
    totalUnstakeds: snapshot.unstakeds.length,
  })

  // Simpan max 10 snapshot terakhir
  history = history.slice(0, 10)
  writeFileSync(historyPath, JSON.stringify(history, null, 2))
  
  console.log('💾 Snapshot history saved to public/og-snapshots.json')
  console.log('📋 Root hash untuk dashboard:', rootHash)
}

main().catch(console.error)