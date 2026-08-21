// useWhaleActivity.ts
import { useState, useEffect, useRef } from 'react';
import { fetchWithTimeout } from '../utils/fetchWithTimeout';

const GRAPH_ENDPOINT = 'https://api.studio.thegraph.com/query/1749265/tronic-staking/version/latest';
const GRAPH_GATEWAY = 'https://gateway.thegraph.com/api/a7d929e390f4bf07126ba6fc1dcf9de2/subgraphs/id/AbF6DWEE3iNwqVa3kyG9YyutLWYcvsNJQ7ihD6fztGNL';

const PROTOCOL_STATS_QUERY = `
  {
    protocolStats(id: "global") {
      currentTVL
      totalStakersEver
      totalStakeCount
      totalUnstakeCount
      peakTVL
      totalRewardsDistributed
      lastUpdatedTimestamp
    }
  }
`;

const WHALE_QUERY = `
  {
    stakeds(first: 20, orderBy: blockNumber, orderDirection: desc) {
      id
      user
      amount
      blockNumber
      blockTimestamp
    }
    unstakeds(first: 20, orderBy: blockNumber, orderDirection: desc) {
      id
      user
      amount
      reward
      blockNumber
      blockTimestamp
    }
  }
`;

export interface ActivityItem {
  id: string;
  wallet: string;
  address: string;
  action: 'STAKE' | 'UNSTAKE';
  amountEth: number;
  amount: string;
  amountUSD: string;
  blockNumber: number;
  timestamp: number;
}

export interface ProtocolStats {
  currentTVL: string;
  totalStakersEver: string;
  totalStakeCount: string;
  totalUnstakeCount: string;
  peakTVL: string;
  totalRewardsDistributed: string;
  lastUpdatedTimestamp: string;
}

export interface RealStats {
  totalStaked: string;
  totalStakedUSD: string;
  activeStakers: number;
  whaleCount: number;
  avgStakeSize: string;
  ethPrice: string | null;
  retailStakers: number;
  peakTVL: string | null;
  totalStakeCount: string | null;
  totalRewardsDistributed: string | null;
}

export interface ChainlinkPriceObj {
  price: string;
  pair: string;
  updatedAt: string;
  btcPrice: string | null;
  btcPair: string;
}

export interface UseWhaleActivityOptions {
  refreshInterval?: number | null; // ms — null = auto-refresh OFF
  whaleThreshold?: number;    // ETH
}

export function useWhaleActivity({
  refreshInterval = 30000,
  whaleThreshold = 0.1,
}: UseWhaleActivityOptions = {}) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [allActivities, setAllActivities] = useState<ActivityItem[]>([]);
  const [stats, setStats] = useState<RealStats | null>(null);
  const [chainlinkPrice, setChainlinkPrice] = useState<ChainlinkPriceObj | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [protocolData, setProtocolData] = useState<ProtocolStats | null>(null);
  const currentBlockRef = useRef<number>(10850000);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_KEY;
        const alchemyUrl = alchemyKey 
          ? `https://eth-sepolia.g.alchemy.com/v2/${alchemyKey}` 
          : "https://ethereum-sepolia-rpc.publicnode.com";

        const rpcBatch = async (calls: { id: number; method: string; params: any[] }[]) => {
          try {
            const res = await fetchWithTimeout(alchemyUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(calls.map(c => ({ jsonrpc: '2.0', ...c }))),
            }, 8000);
            return await res.json(); // array of { id, result }
          } catch {
            return null;
          }
        };

        // 1. Chainlink ETH/USD, BTC/USD, dan block number — digabung jadi 1 request (batch), bukan 3 request terpisah
        const batchResults = await rpcBatch([
          { id: 1, method: 'eth_call', params: [{ to: '0x694AA1769357215DE4FAC081bf1f309aDC325306', data: '0x50d25bcd' }, 'latest'] },
          { id: 3, method: 'eth_call', params: [{ to: '0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43', data: '0x50d25bcd' }, 'latest'] },
          { id: 2, method: 'eth_blockNumber', params: [] },
        ]);

        const findResult = (id: number) => Array.isArray(batchResults) ? batchResults.find((r: any) => r.id === id) : null;

        let ethPrice: number | null = null;
        const ethResult = findResult(1);
        if (ethResult?.result) ethPrice = parseInt(ethResult.result, 16) / 1e8;
        else console.warn('Chainlink fetch failed');

        let btcPrice: number | null = null;
        const btcResult = findResult(3);
        if (btcResult?.result) btcPrice = parseInt(btcResult.result, 16) / 1e8;
        else console.warn('BTC/USD Chainlink fetch failed');

        let latestBlock = 10850000;
        const blockResult = findResult(2);
        if (blockResult?.result) latestBlock = parseInt(blockResult.result, 16);
        else console.warn('Block number fetch failed');

        // 3. Fetch dari The Graph — pakai GATEWAY (production), bukan Studio (buat testing doang)
        const graphRes = await fetchWithTimeout(GRAPH_GATEWAY, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: WHALE_QUERY }),
        }, 8000);
        const graphData = await graphRes.json();
        if (graphData.errors) throw new Error(graphData.errors[0].message);

        interface StakedResponse {
          id: string;
          user: string;
          amount: string;
          blockNumber: string;
          blockTimestamp: string;
        }

        interface UnstakedResponse {
          id: string;
          user: string;
          amount: string;
          reward: string;
          blockNumber: string;
          blockTimestamp: string;
        }

        const stakeds: StakedResponse[] = graphData.data.stakeds;
        const unstakeds: UnstakedResponse[] = graphData.data.unstakeds;

        // 3b. Fetch protocolStats dari gateway
        let protocol: ProtocolStats | null = null;
        try {
          const gatewayRes = await fetchWithTimeout(GRAPH_GATEWAY, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: PROTOCOL_STATS_QUERY }),
          }, 8000);
          const gatewayData = await gatewayRes.json();
          if (gatewayData.data?.protocolStats) {
            protocol = gatewayData.data.protocolStats;
          }
        } catch {
          console.warn('Protocol stats fetch failed');
        }

        // 4. Gabung & sort
        const combined: ActivityItem[] = [
          ...stakeds.map(tx => ({
            id: tx.id,
            wallet: tx.user,
            address: tx.user,
            action: 'STAKE' as const,
            amountEth: parseFloat(tx.amount) / 1e18,
            amount: (parseFloat(tx.amount) / 1e18).toFixed(4),
            amountUSD: ethPrice
              ? (parseFloat(tx.amount) / 1e18 * ethPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              : '0.00',
            blockNumber: parseInt(tx.blockNumber),
            timestamp: parseInt(tx.blockTimestamp),
          })),
          ...unstakeds.map(tx => ({
            id: tx.id,
            wallet: tx.user,
            address: tx.user,
            action: 'UNSTAKE' as const,
            amountEth: parseFloat(tx.amount) / 1e18,
            amount: (parseFloat(tx.amount) / 1e18).toFixed(4),
            amountUSD: ethPrice
              ? (parseFloat(tx.amount) / 1e18 * ethPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              : '0.00',
            blockNumber: parseInt(tx.blockNumber),
            timestamp: parseInt(tx.blockTimestamp),
          })),
        ].sort((a, b) => b.blockNumber - a.blockNumber);

        // 5. Filter whale pakai threshold dari settings
        const whaleOnly = combined.filter(tx => tx.amountEth >= whaleThreshold);

        // 6. Hitung stats
        const totalStakedEth = stakeds.reduce((sum, tx) => sum + parseFloat(tx.amount) / 1e18, 0);
        const totalUnstakedEth = unstakeds.reduce((sum, tx) => sum + parseFloat(tx.amount) / 1e18, 0);

        // Active stakers — wallet yang punya net stake > 0
        const stakerNet: Record<string, number> = {};
        stakeds.forEach(tx => {
          stakerNet[tx.user] = (stakerNet[tx.user] || 0) + parseFloat(tx.amount) / 1e18;
        });
        unstakeds.forEach(tx => {
          stakerNet[tx.user] = (stakerNet[tx.user] || 0) - parseFloat(tx.amount) / 1e18;
        });
        const activeStakerSet = new Set(Object.keys(stakerNet).filter(addr => stakerNet[addr] > 0));
        const whaleWallets = new Set(whaleOnly.map(tx => tx.wallet));

        const currentTVLEth = protocol
          ? parseFloat(protocol.currentTVL) / 1e18
          : Math.max(0, totalStakedEth - totalUnstakedEth);

        const activeStakersCount = protocol
          ? parseInt(protocol.totalStakersEver)
          : activeStakerSet.size;

        const realStats: RealStats = {
          totalStaked: currentTVLEth.toFixed(4),
          totalStakedUSD: ethPrice
            ? (currentTVLEth * ethPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : '0.00',
          activeStakers: activeStakersCount,
          whaleCount: whaleWallets.size,
          avgStakeSize: activeStakersCount > 0 ? (currentTVLEth / activeStakersCount).toFixed(2) : '0.00',
          ethPrice: ethPrice ? ethPrice.toFixed(2) : null,
          retailStakers: Math.max(0, activeStakersCount - whaleWallets.size),
          peakTVL: protocol ? (parseFloat(protocol.peakTVL) / 1e18).toFixed(4) : null,
          totalStakeCount: protocol ? protocol.totalStakeCount : null,
          totalRewardsDistributed: protocol ? (parseFloat(protocol.totalRewardsDistributed) / 1e18).toFixed(6) : null,
        };

        const chainlinkObj: ChainlinkPriceObj | null = ethPrice ? {
          price: ethPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          pair: 'ETH / USD',
          updatedAt: new Date().toLocaleString('en-GB', {
            day: '2-digit',
            month: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'UTC',
            timeZoneName: 'short',
          }),
          btcPrice: btcPrice ? btcPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : null,
          btcPair: 'BTC / USD',
        } : null;

        setActivities(whaleOnly);
        setAllActivities(combined);
        setStats(realStats);
        setProtocolData(protocol);
        setChainlinkPrice(chainlinkObj);
        setError(null);
        currentBlockRef.current = latestBlock;

      } catch (err: any) {
        setError('Failed to fetch from The Graph: ' + err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const handleManualRefresh = () => fetchData();
    window.addEventListener('troniclens:refresh', handleManualRefresh);

    let interval: NodeJS.Timeout | null = null;
    if (typeof refreshInterval === 'number' && refreshInterval > 0) {
      interval = setInterval(fetchData, refreshInterval);
    }

    return () => {
      window.removeEventListener('troniclens:refresh', handleManualRefresh);
      if (interval) clearInterval(interval);
    };
  }, [refreshInterval, whaleThreshold]);

  const formatTime = (timestamp: number) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = Math.max(0, now - timestamp);
    const minutes = Math.floor(diff / 60);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return `${Math.floor(days / 7)}w ago`;
  };

  const formatAddress = (address: string) => {
    if (!address) return '0x????...????';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return {
    protocolData,
    activities,
    allActivities,
    stats,
    chainlinkPrice,
    loading,
    error,
    formatTime,
    formatAddress,
    WHALE_THRESHOLD: whaleThreshold,
  };
}
