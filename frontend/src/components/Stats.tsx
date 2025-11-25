import { useState, useEffect } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { Loader2, ArrowLeft, Trophy } from 'lucide-react'
import type { Album } from '../types'
import { API_BASE_URL } from '../config'

interface StatsProps {
    username: string
    source: string
    onBack: () => void
}

export default function Stats({ username, source, onBack }: StatsProps) {
    const [albums, setAlbums] = useState<Album[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [viewMode, setViewMode] = useState<'top' | 'bottom'>('top')

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/stats/${username}?source=${source}`)
                setAlbums(res.data)
            } catch (err) {
                console.error("Failed to fetch stats", err)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [username, source])

    const filteredAlbums = albums
        .filter(a =>
            a.name.toLowerCase().includes(search.toLowerCase()) ||
            a.artist_name.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => viewMode === 'top' ? b.elo_score - a.elo_score : a.elo_score - b.elo_score)
        .slice(0, 50)

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-black">
                <Loader2 className="w-12 h-12 animate-spin text-yellow-500 mb-4" />
                <p className="text-xl font-bold tracking-widest uppercase">Loading Leaderboard...</p>
            </div>
        )
    }

    return (
        <div className="w-full h-full flex flex-col p-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 text-black border-2 border-black rounded-xl transition-all shadow-[4px_4px_0px_black] hover:shadow-[6px_6px_0px_black] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                >
                    <ArrowLeft size={20} />
                    Back to Menu
                </button>
                <h2 className="text-4xl font-black text-black tracking-tighter">LEADERBOARD</h2>
                <div className="w-[120px]" /> {/* Spacer */}
            </div>

            {/* Controls */}
            <div className="flex gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Search albums or artists..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 bg-white border-2 border-black rounded-xl px-6 py-3 text-black focus:outline-none focus:shadow-[4px_4px_0px_black] transition-all placeholder:text-gray-400"
                />
                <div className="flex gap-2 bg-white rounded-xl p-1 border-2 border-black shadow-[4px_4px_0px_black]">
                    <button
                        onClick={() => setViewMode('top')}
                        className={`px-6 py-2 rounded-lg font-bold transition-all ${viewMode === 'top' ? 'bg-yellow-500 text-black border-2 border-black' : 'text-gray-500 hover:text-black'}`}
                    >
                        Top 50
                    </button>
                    <button
                        onClick={() => setViewMode('bottom')}
                        className={`px-6 py-2 rounded-lg font-bold transition-all ${viewMode === 'bottom' ? 'bg-yellow-500 text-black border-2 border-black' : 'text-gray-500 hover:text-black'}`}
                    >
                        Bottom 50
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                <div className="flex flex-col gap-3 p-2">
                    {filteredAlbums.map((album, index) => (
                        <StatsRow key={album.id} album={album} rank={index + 1} />
                    ))}
                    {filteredAlbums.length === 0 && (
                        <div className="text-center text-gray-500 py-12">
                            No albums found matching "{search}"
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function StatsRow({ album, rank }: { album: Album, rank: number }) {
    const isTop3 = rank <= 3
    let rankColor = "text-gray-500"
    let borderColor = "border-black"

    if (rank === 1) {
        rankColor = "text-yellow-600"
    } else if (rank === 2) {
        rankColor = "text-gray-600"
    } else if (rank === 3) {
        rankColor = "text-amber-700"
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: rank * 0.05 }}
            className={`flex items-center gap-6 p-4 bg-white rounded-xl border-2 ${borderColor} shadow-[4px_4px_0px_rgba(0,0,0,0.1)] hover:shadow-[6px_6px_0px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all group`}
        >
            {/* Rank */}
            <div className={`w-12 text-3xl font-black text-center ${rankColor}`}>
                {rank}
            </div>

            {/* Cover */}
            <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-black flex-shrink-0 relative">
                <img
                    src={album.image_url || 'placeholder'}
                    alt={album.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                    }}
                />
                <div className="hidden absolute inset-0 bg-gray-200 flex items-center justify-center text-2xl">💿</div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-black truncate group-hover:text-yellow-600 transition-colors">
                    {album.name}
                </h3>
                <p className="text-gray-500 truncate font-medium">{album.artist_name}</p>
            </div>

            {/* Score */}
            <div className="flex flex-col items-end px-4">
                <div className="flex items-center gap-2">
                    <Trophy size={16} className={isTop3 ? rankColor : "text-gray-400"} />
                    <span className="text-2xl font-mono font-bold text-black">
                        {Math.round(album.elo_score)}
                    </span>
                </div>
                <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">ELO Score</span>
            </div>
        </motion.div>
    )
}
