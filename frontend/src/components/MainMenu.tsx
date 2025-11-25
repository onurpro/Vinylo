import { motion } from 'framer-motion'
import { Play, Trophy, LogOut, Ban, Settings } from 'lucide-react'
import logo from '../assets/logo.svg'

interface MainMenuProps {
    username: string
    source: string
    onPlay: () => void
    onStats: () => void
    onIgnored: () => void
    onSettings: () => void
    onLogout: () => void
}

export default function MainMenu({ username, source, onPlay, onStats, onIgnored, onSettings, onLogout }: MainMenuProps) {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full z-10 relative">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12 flex flex-col items-center gap-4"
            >
                <img src={logo} alt="Vinylo Logo" className="w-24 h-24" />
                <h1 className="text-6xl md:text-8xl font-black text-black mb-2 tracking-tighter uppercase">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 text-stroke-black">Vinylo</span>
                </h1>
                <p className="text-xl font-bold text-gray-500 mb-8 flex items-center gap-2 justify-center">
                    Logged in as: <span className="text-black">{username}</span>
                    {source === 'spotify' ? (
                        <span className="bg-[#1DB954] text-white text-xs px-2 py-1 rounded-full border border-black uppercase tracking-wider">Spotify</span>
                    ) : (
                        <span className="bg-[#ba0000] text-white text-xs px-2 py-1 rounded-full border border-black uppercase tracking-wider">Last.fm</span>
                    )}
                </p>

                <div className="flex flex-col gap-4 w-full max-w-md px-8">
                    <MenuButton
                        onClick={onPlay}
                        icon={<Play size={20} fill="currentColor" />}
                        label="START RANKING"
                        primary
                    />
                    <MenuButton
                        onClick={onStats}
                        icon={<Trophy size={20} />}
                        label="LEADERBOARD"
                    />
                    <MenuButton
                        onClick={onIgnored}
                        icon={<Ban size={20} />}
                        label="MANAGE IGNORED"
                    />
                    <MenuButton
                        onClick={onSettings}
                        icon={<Settings size={20} />}
                        label="SETTINGS"
                    />

                    <div className="h-4" /> {/* Spacer */}

                    <button
                        onClick={onLogout}
                        className="flex items-center justify-center gap-2 text-gray-400 hover:text-red-500 transition-colors text-sm font-bold tracking-widest uppercase"
                    >
                        <LogOut size={16} />
                        Log Out
                    </button>
                </div>
            </motion.div>
        </div>
    )
}

function MenuButton({ onClick, icon, label, primary = false, disabled = false }: { onClick: () => void, icon: React.ReactNode, label: string, primary?: boolean, disabled?: boolean }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
        btn w-full flex items-center justify-center gap-3 text-lg
        ${primary ? 'btn-primary' : 'btn-secondary'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
        >
            {icon}
            <span>{label}</span>
        </button>
    )
}
