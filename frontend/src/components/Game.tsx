import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, TrendingUp, Ban, Share2, HelpCircle } from 'lucide-react'
import { toPng } from 'html-to-image'
import type { Album } from '../types'

import ShareModal from './ShareModal'
import TutorialModal from './TutorialModal'
import { API_BASE_URL } from '../config'
import logo from '../assets/logo.svg'

interface GameProps {
    username: string
    source: string
}

export default function Game({ username, source }: GameProps) {
    const [matchup, setMatchup] = useState<Album[]>([])
    const [loading, setLoading] = useState(true)
    const [voting, setVoting] = useState(false)
    const [showShareModal, setShowShareModal] = useState(false)
    const [showTutorial, setShowTutorial] = useState(false)
    const [capturedImage, setCapturedImage] = useState<string | null>(null)
    const captureRef = useRef<HTMLDivElement>(null)
    const shareRef = useRef<HTMLDivElement>(null)

    const fetchMatchup = async () => {
        try {
            setLoading(true)
            const res = await axios.get(`${API_BASE_URL}/api/matchup/${username}?source=${source}`)
            setMatchup(res.data)
        } catch (err) {
            console.error("Failed to fetch matchup", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMatchup()
    }, [username, source])

    useEffect(() => {
        const tutorialSeen = localStorage.getItem('album_elo_tutorial_seen')
        if (!tutorialSeen) {
            setShowTutorial(true)
            localStorage.setItem('album_elo_tutorial_seen', 'true')
        }
    }, [])

    const handleVote = async (winnerIndex: number) => {
        if (voting || matchup.length < 2) return
        setVoting(true)

        const winner = winnerIndex === 0 ? '1' : '2'
        const album1 = matchup[0]
        const album2 = matchup[1]

        try {
            const res = await axios.post(`${API_BASE_URL}/api/vote`, {
                album1_id: album1.id,
                album2_id: album2.id,
                winner: winner
            })

            // Update local state with new scores to trigger animation
            const { new_scores } = res.data
            setMatchup(prev => prev.map((a, i) => {
                if (i === 0) return { ...a, elo_score: new_scores.album1 }
                if (i === 1) return { ...a, elo_score: new_scores.album2 }
                return a
            }))

            await new Promise(resolve => setTimeout(resolve, 2000)) // Wait for rolling animation
            await fetchMatchup()
        } catch (err) {
            console.error("Vote failed", err)
        } finally {
            setVoting(false)
        }
    }

    const [ignoreId, setIgnoreId] = useState<number | null>(null)

    const handleIgnoreClick = (e: React.MouseEvent, albumId: number) => {
        e.stopPropagation()
        setIgnoreId(albumId)
    }

    const confirmIgnore = async () => {
        if (!ignoreId) return
        try {
            await axios.post(`${API_BASE_URL}/api/ignore/${ignoreId}`)
            setIgnoreId(null)
            fetchMatchup()
        } catch (err) {
            console.error("Ignore failed", err)
        }
    }

    const handleShare = async () => {
        if (shareRef.current) {
            try {
                const dataUrl = await toPng(shareRef.current, { cacheBust: true, pixelRatio: 2, backgroundColor: '#ffffff' })
                setCapturedImage(dataUrl)
                setShowShareModal(true)
            } catch (err) {
                console.error('Failed to capture image', err)
            }
        }
    }

    if (loading && matchup.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-black">
                <Loader2 className="w-12 h-12 animate-spin text-yellow-500 mb-4" />
                <p className="text-xl font-bold tracking-widest uppercase">Finding worthy opponents...</p>
            </div>
        )
    }

    if (matchup.length < 2) return null

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 relative">

            {/* Tutorial Button */}
            <button
                onClick={() => setShowTutorial(true)}
                className="absolute top-6 right-6 z-40 p-2 bg-white border-2 border-black rounded-full text-black hover:bg-yellow-400 transition-colors shadow-[4px_4px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_black] active:translate-x-0 active:translate-y-0 active:shadow-none"
                title="How to Play"
            >
                <HelpCircle size={24} />
            </button>

            {/* Capture Area */}
            <div ref={captureRef} className="relative flex flex-col md:flex-row items-center justify-center gap-8 md:gap-32 p-4 md:p-8 rounded-3xl bg-transparent w-full max-w-6xl">

                {/* VS Badge */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="bg-white text-black font-black text-2xl w-16 h-16 rounded-full flex items-center justify-center shadow-2xl border-4 border-gray-900"
                    >
                        VS
                    </motion.div>
                </div>

                <AnimatePresence mode="wait">
                    {matchup.map((album, index) => (
                        <AlbumCard
                            key={album.id}
                            album={album}
                            index={index}
                            onVote={() => handleVote(index)}
                            onIgnore={(e) => handleIgnoreClick(e, album.id)}
                            disabled={voting}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {/* Actions */}
            <div className="mt-8 flex gap-4">
                <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-200 text-black rounded-full font-bold transition-all shadow-lg hover:shadow-purple-500/20 hover:scale-105 active:scale-95"
                >
                    <Share2 size={18} />
                    Share Matchup
                </button>
            </div>

            {/* Share Modal */}
            {showShareModal && capturedImage && (
                <ShareModal
                    imageSrc={capturedImage}
                    onClose={() => setShowShareModal(false)}
                />
            )}

            {/* Tutorial Modal */}
            <AnimatePresence>
                {showTutorial && (
                    <TutorialModal onClose={() => setShowTutorial(false)} />
                )}
            </AnimatePresence>

            {/* Ignore Confirmation Modal */}
            {ignoreId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setIgnoreId(null)}>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center border-4 border-red-500"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Ban size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-black mb-2">Ignore Album?</h3>
                        <p className="text-gray-600 mb-6 font-medium">
                            This album will be removed from your matchups. This can be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIgnoreId(null)}
                                className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmIgnore}
                                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-black font-bold rounded-xl transition-colors shadow-lg hover:shadow-red-500/30"
                            >
                                Yes, Ignore
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Spotify Attribution */}
            {source === 'spotify' && (
                <div className="absolute bottom-4 flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
                    <img src="https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_Black.png" alt="Spotify" className="h-6" />
                    <span className="text-xs font-medium text-black">Content from Spotify</span>
                </div>
            )}

            {/* Hidden Share Layout */}
            <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                <div ref={shareRef} className="flex flex-col items-center bg-white p-12 rounded-3xl" style={{ width: '900px' }}>

                    {/* Top Banner */}
                    <div className="flex items-center gap-6 mb-12">
                        <img src={logo} alt="Vinylo Logo" className="w-20 h-20" />
                        <h1 className="text-6xl font-black text-black tracking-tighter uppercase">
                            Vinylo
                        </h1>
                    </div>

                    {/* Matchup Content */}
                    <div className="flex flex-row items-center justify-center gap-16 p-8 rounded-3xl bg-transparent relative w-full">
                        {/* VS Badge */}
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                            <div className="bg-white text-black font-black text-3xl w-20 h-20 rounded-full flex items-center justify-center shadow-2xl border-4 border-gray-900">
                                VS
                            </div>
                        </div>

                        {matchup.map((album) => (
                            <div key={`share-${album.id}`} className="w-[340px] h-[500px] flex-shrink-0">
                                <div className="w-full h-full bg-white border-2 border-black rounded-[20px] shadow-[8px_8px_0px_rgba(0,0,0,0.1)] flex flex-col items-center p-[30px] text-center relative">
                                    <div className="w-[250px] h-[250px] mb-[25px] relative shrink-0">
                                        <img
                                            src={album.image_url || 'placeholder'}
                                            alt={album.name}
                                            className="w-full h-full object-cover rounded-[10px] shadow-2xl"
                                        />
                                    </div>
                                    <div className="flex flex-col items-center w-full">
                                        <h3 className="text-2xl font-bold text-black mb-2 leading-tight line-clamp-2 w-full">
                                            {album.name}
                                        </h3>
                                        <p className="text-[#666] font-medium mb-6 line-clamp-1 w-full text-lg">
                                            {album.artist_name}
                                        </p>
                                        <div className="flex items-center gap-2 bg-yellow-500 text-black px-6 py-2 rounded-[15px] border-2 border-black font-bold text-lg mt-auto">
                                            <TrendingUp size={20} />
                                            <span className="font-mono">{Math.round(album.elo_score)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Bottom Banner */}
                    <div className="mt-12 bg-black text-white px-10 py-3 rounded-full font-bold text-2xl tracking-widest uppercase">
                        vinylo.onuryildiz.me
                    </div>
                </div>
            </div>

        </div>
    )
}

function AlbumCard({ album, index, onVote, onIgnore, disabled }: { album: Album, index: number, onVote: () => void, onIgnore: (e: React.MouseEvent) => void, disabled: boolean }) {
    const [imgError, setImgError] = useState(false)

    return (
        <motion.div
            className="relative group cursor-pointer w-full max-w-[350px] aspect-[350/500] md:h-[500px] flex-shrink-0"
            onClick={!disabled ? onVote : undefined}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
        >
            <div className="w-full h-full bg-white border-2 border-black rounded-[20px] shadow-[8px_8px_0px_rgba(0,0,0,0.1)] group-hover:-translate-y-1 group-hover:shadow-[12px_12px_0px_rgba(0,0,0,0.1)] transition-all duration-300 overflow-hidden flex flex-col items-center p-4 md:p-[30px] text-center relative">

                {/* Image Section */}
                <div className="w-full aspect-square max-w-[250px] mb-[25px] relative shrink-0">
                    {!imgError ? (
                        <img
                            src={album.image_url || 'placeholder'}
                            alt={album.name}
                            className="w-full h-full object-cover rounded-[10px] shadow-2xl"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 rounded-[10px] shadow-2xl">
                            <span className="text-6xl">💿</span>
                        </div>
                    )}

                    {/* Ignore Button (Top Right of Image) */}
                    <button
                        onClick={onIgnore}
                        className="absolute -top-2 -right-2 p-2 bg-white border-2 border-black rounded-full text-gray-400 hover:text-red-500 hover:scale-110 transition-all shadow-md opacity-0 group-hover:opacity-100 z-10"
                        title="Ignore this album"
                    >
                        <Ban size={16} />
                    </button>
                </div>

                {/* Info Section */}
                <div className="flex flex-col items-center w-full">
                    <h3 className="text-2xl font-bold text-black mb-1 leading-tight line-clamp-2 w-full" title={album.name}>
                        {album.name}
                    </h3>
                    <p className="text-[#666] font-medium mb-4 line-clamp-1 w-full">
                        {album.artist_name}
                    </p>

                    <div className="flex items-center gap-2 bg-yellow-500 text-black px-4 py-1 rounded-[15px] border-2 border-black font-bold text-sm mt-auto">
                        <TrendingUp size={14} />
                        <RollingNumber value={album.elo_score} />
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

function RollingNumber({ value }: { value: number }) {
    const rounded = Math.round(value)
    const digits = rounded.toString().split('').map(Number)

    return (
        <div className="flex items-center justify-center overflow-hidden h-5 font-mono text-sm leading-none">
            {digits.map((digit, i) => (
                <Digit key={i} digit={digit} />
            ))}
        </div>
    )
}

function Digit({ digit }: { digit: number }) {
    return (
        <div className="relative w-[0.6em] h-5 overflow-hidden">
            <motion.div
                animate={{ y: -digit * 10 + '%' }} // Move by 10% per digit (10 digits total)
                transition={{ type: "spring", stiffness: 60, damping: 15, mass: 1 }}
                className="absolute top-0 left-0 flex flex-col items-center w-full h-[1000%]" // 1000% height for 10 digits
            >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                    <span key={n} className="h-[10%] flex items-center justify-center w-full">
                        {n}
                    </span>
                ))}
            </motion.div>
        </div>
    )
}
