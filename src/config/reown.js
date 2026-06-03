// src/config/reown.js
import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { sepolia } from '@reown/appkit/networks'
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient()

const projectId = '17f05138ce6e302c0eee7c6ae775a130'

const metadata = {
  name: 'TronicLens',
  description: 'DeFi Staking Intelligence Cockpit — ETHOnline 2026',
  url: 'https://troniclens.vercel.app',
  icons: ['https://troniclens.vercel.app/logos/troniclens-logo-transparent.svg']
}

const networks = [sepolia]

export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: false
})

createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  features: {
    analytics: false,
    email: false,
    socials: false,
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#818cf8',          
    '--w3m-border-radius-master': '6px',
    '--w3m-font-family': "'DM Sans', sans-serif",
    '--w3m-color-mix': '#818cf8',
    '--w3m-color-mix-strength': 15,
  }
})