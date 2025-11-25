import { useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { User, ArrowRight, Loader2, AlertCircle, Music } from 'lucide-react'
import { API_BASE_URL } from '../config'

interface OnboardingProps {
    onLogin: (username: string, source: string) => void
}

export default function Onboarding({ onLogin }: OnboardingProps) {
    const [username, setUsername] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!username.trim()) return

        setIsLoading(true)
        setError('')

        try {
            // Call the init endpoint
            await axios.post(`${API_BASE_URL}/api/init/${username}?source=lastfm`)

            // If successful, notify parent
            onLogin(username, 'lastfm')
        } catch (err: any) {
            console.error(err)
            if (err.response && err.response.status === 404) {
                setError('User not found on Last.fm or no albums available.')
            } else {
                setError('Failed to connect to the server. Please try again.')
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleSpotifyLogin = async () => {
        try {
            setIsLoading(true)
            const res = await axios.get(`${API_BASE_URL}/api/login/spotify`)
            window.location.href = res.data.url
        } catch (err) {
            console.error(err)
            setError('Failed to initialize Spotify login.')
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col items-center justify-center w-full h-full min-h-[60vh] p-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[90vw]"
            >
                <div className="relative w-full bg-white border-4 border-black rounded-[2rem] p-8 md:p-16 shadow-[12px_12px_0px_rgba(0,0,0,0.1)] overflow-hidden">

                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16">

                        {/* Left Side: Text */}
                        <div className="flex-1 text-left space-y-8">
                            <div>
                                <h2 className="text-6xl font-black text-black mb-6 leading-tight tracking-tighter">
                                    Rank Your <br />
                                    <span className="text-yellow-500 text-stroke-black">
                                        Favorite Albums
                                    </span>
                                </h2>
                                <p className="text-2xl text-gray-600 max-w-2xl leading-relaxed font-medium">
                                    Connect your Last.fm account to import your history. We'll generate head-to-head matchups to find your true favorite albums.
                                </p>
                            </div>

                            <div className="flex items-center gap-4 text-sm font-bold text-black uppercase tracking-wider">
                                <span className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full border-2 border-black">
                                    <div className="w-3 h-3 rounded-full bg-green-500 border border-black" />
                                    Live Sync
                                </span>
                                <span className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full border-2 border-black">
                                    <div className="w-3 h-3 rounded-full bg-blue-500 border border-black" />
                                    ELO Rating System
                                </span>
                            </div>
                        </div>

                        {/* Right Side: Form */}
                        <div className="flex-1 w-full max-w-xl">
                            <form onSubmit={handleSubmit} className="space-y-6 bg-gray-50 p-8 rounded-2xl border-2 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)]">
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-black uppercase tracking-wider ml-1">Username</label>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            placeholder="Enter Last.fm username"
                                            className="w-full bg-white border-2 border-black text-black text-xl rounded-xl px-6 py-5 pl-14 focus:outline-none focus:shadow-[4px_4px_0px_black] transition-all placeholder-gray-400 font-bold"
                                            disabled={isLoading}
                                        />
                                        <User className="absolute left-5 top-6 text-black w-6 h-6" />
                                    </div>
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center gap-3 text-red-600 text-base bg-red-50 p-4 rounded-xl border-2 border-red-500 font-bold"
                                    >
                                        <AlertCircle size={20} />
                                        {error}
                                    </motion.div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading || !username.trim()}
                                    className="w-full bg-yellow-400 text-black text-xl font-black rounded-xl py-5 px-6 flex items-center justify-center gap-3 border-2 border-black shadow-[4px_4px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_black] active:translate-x-0 active:translate-y-0 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={24} />
                                            Syncing Library...
                                        </>
                                    ) : (
                                        <>
                                            Start Ranking
                                            <ArrowRight size={24} />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-8 flex items-center gap-4">
                                <div className="h-[2px] flex-1 bg-gray-200" />
                                <span className="text-gray-400 font-bold uppercase text-sm">Or</span>
                                <div className="h-[2px] flex-1 bg-gray-200" />
                            </div>

                            <button
                                onClick={handleSpotifyLogin}
                                disabled={isLoading}
                                className="mt-8 w-full bg-[#1DB954] text-white text-xl font-black rounded-xl py-5 px-6 flex items-center justify-center gap-3 border-2 border-black shadow-[4px_4px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_black] active:translate-x-0 active:translate-y-0 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <Music size={24} />
                                Login with Spotify
                            </button>
                        </div>

                    </div>
                </div>
            </motion.div>
        </div>
    )
}
