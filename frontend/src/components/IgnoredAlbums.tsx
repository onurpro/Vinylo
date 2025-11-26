import { useState, useEffect } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { Loader2, ArrowLeft, RefreshCcw, Ban } from 'lucide-react'
import type { Album } from '../types'
import { API_BASE_URL } from '../config'

interface IgnoredAlbumsProps {
    username: string
    source: string
    onBack: () => void
}

export default function IgnoredAlbums({ username, source, onBack }: IgnoredAlbumsProps) {
    const [albums, setAlbums] = useState<Album[]>([])
    const [loading, setLoading] = useState(true)

    const fetchIgnored = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/ignored/${username}?source=${source}`)
            setAlbums(res.data)
        } catch (err) {
            console.error("Failed to fetch ignored albums", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchIgnored()
    }, [username, source])

    const handleRestore = async (albumId: number) => {
        try {
            await axios.post(`${API_BASE_URL}/api/unignore/${albumId}`)
            setAlbums(prev => prev.filter(a => a.id !== albumId))
        } catch (err) {
            console.error("Failed to restore album", err)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-black">
                <Loader2 className="w-12 h-12 animate-spin text-yellow-500 mb-4" />
                <p className="text-xl font-bold tracking-widest uppercase">Loading Ignored Albums...</p>
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
                <h2 className="text-4xl font-black text-black tracking-tighter">IGNORED ALBUMS</h2>
                <div className="w-[120px]" /> {/* Spacer */}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                <div className="flex flex-col gap-3 p-2">
                    {albums.map((album, index) => (
                        <motion.div
                            key={album.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center gap-4 md:gap-6 p-4 bg-white rounded-xl border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,0.1)] hover:shadow-[6px_6px_0px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all group"
                        >
                            {/* Cover */}
                            <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-black flex-shrink-0 relative">
                                <img
                                    src={album.image_url || 'placeholder'}
                                    alt={album.name}
                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
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

                            {/* Action */}
                            <button
                                onClick={() => handleRestore(album.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-green-50 text-black border-2 border-black rounded-lg font-bold transition-all hover:shadow-[2px_2px_0px_#16a34a] active:translate-y-[2px] active:shadow-none"
                                title="Restore to matchups"
                            >
                                <RefreshCcw size={16} />
                                Restore
                            </button>
                        </motion.div>
                    ))}

                    {albums.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                            <Ban size={48} className="mb-4 opacity-50" />
                            <p className="text-xl font-bold">No ignored albums.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
