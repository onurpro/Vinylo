import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trash2, ArrowLeft, AlertTriangle, Save, Music } from 'lucide-react'
import { API_BASE_URL } from '../config'

interface SettingsProps {
    username: string
    source: string
    onBack: () => void
    onReset: () => void
}

export default function Settings({ username, source, onBack, onReset }: SettingsProps) {
    const [confirming, setConfirming] = useState(false)
    const [loading, setLoading] = useState(false)
    const [scrobbleThreshold, setScrobbleThreshold] = useState(0)
    const [savingSettings, setSavingSettings] = useState(false)
    const [settingsMessage, setSettingsMessage] = useState('')

    useEffect(() => {
        fetchSettings()
    }, [username, source])

    const fetchSettings = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/settings/${username}?source=${source}`)
            if (response.ok) {
                const data = await response.json()
                setScrobbleThreshold(data.scrobble_threshold)
            }
        } catch (error) {
            console.error('Error fetching settings:', error)
        }
    }

    const handleSaveSettings = async () => {
        setSavingSettings(true)
        setSettingsMessage('')
        try {
            const response = await fetch(`${API_BASE_URL}/api/settings/${username}?source=${source}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    scrobble_threshold: scrobbleThreshold
                }),
            })

            if (response.ok) {
                setSettingsMessage('Settings saved!')
                setTimeout(() => setSettingsMessage(''), 3000)
            } else {
                setSettingsMessage('Failed to save settings')
            }
        } catch (error) {
            console.error('Error saving settings:', error)
            setSettingsMessage('Error saving settings')
        } finally {
            setSavingSettings(false)
        }
    }

    const handleReset = async () => {
        if (!confirming) {
            setConfirming(true)
            return
        }

        setLoading(true)
        try {
            const response = await fetch(`${API_BASE_URL}/api/reset/${username}?source=${source}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                onReset()
            } else {
                console.error('Failed to reset data')
                setLoading(false)
                setConfirming(false)
            }
        } catch (error) {
            console.error('Error resetting data:', error)
            setLoading(false)
            setConfirming(false)
        }
    }

    return (
        <div className="flex flex-col items-center justify-center h-full w-full z-10 relative p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-white border-2 border-black shadow-[8px_8px_0px_black] p-8 rounded-2xl"
            >
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h2 className="text-3xl font-black uppercase tracking-tighter">Settings</h2>
                </div>

                <div className="space-y-8">
                    {/* General Settings */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Music size={20} />
                            <h3 className="font-bold text-xl">Preferences</h3>
                        </div>

                        {source !== 'spotify' && (
                            <div className="space-y-2">
                                <label className="block font-bold text-sm">
                                    Minimum Scrobble Threshold
                                </label>
                                <p className="text-xs text-gray-500 mb-2">
                                    Albums with fewer plays than this will be hidden from matchups and stats.
                                </p>
                                <div className="flex gap-4">
                                    <input
                                        type="number"
                                        min="0"
                                        value={scrobbleThreshold}
                                        onChange={(e) => setScrobbleThreshold(Math.max(0, parseInt(e.target.value) || 0))}
                                        className="flex-1 p-3 border-2 border-black rounded-xl font-bold focus:outline-none focus:shadow-[4px_4px_0px_black] transition-shadow"
                                    />
                                    <button
                                        onClick={handleSaveSettings}
                                        disabled={savingSettings}
                                        className="bg-black text-white px-6 rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center gap-2"
                                    >
                                        <Save size={18} />
                                        {savingSettings ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                                {settingsMessage && (
                                    <p className={`text-sm font-bold ${settingsMessage.includes('Failed') || settingsMessage.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
                                        {settingsMessage}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    <hr className="border-black" />

                    {/* Danger Zone */}
                    <div className="space-y-4">
                        <div className="p-4 bg-yellow-50 border-2 border-black rounded-xl flex gap-4 items-start">
                            <AlertTriangle className="text-yellow-600 shrink-0" size={24} />
                            <div>
                                <h3 className="font-bold text-lg mb-1">Danger Zone</h3>
                                <p className="text-sm text-gray-600">
                                    Resetting your data will permanently delete all your albums and rankings. This action cannot be undone.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleReset}
                            disabled={loading}
                            className={`
                                w-full flex items-center justify-center gap-3 px-6 py-4 
                                font-bold text-lg uppercase tracking-wider rounded-xl border-2 border-black 
                                transition-all
                                ${confirming
                                    ? 'bg-red-500 text-white shadow-[4px_4px_0px_black] hover:bg-red-600'
                                    : 'bg-white text-red-500 hover:bg-red-50 shadow-[4px_4px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_black]'
                                }
                                active:translate-x-0 active:translate-y-0 active:shadow-none
                            `}
                        >
                            <Trash2 size={20} />
                            <span>{confirming ? 'Confirm Reset' : 'Reset Data'}</span>
                        </button>

                        {confirming && (
                            <button
                                onClick={() => setConfirming(false)}
                                className="w-full text-center text-gray-500 font-bold hover:text-black transition-colors"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
