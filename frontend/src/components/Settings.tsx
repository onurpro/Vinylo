import { useState } from 'react'
import { motion } from 'framer-motion'
import { Trash2, ArrowLeft, AlertTriangle } from 'lucide-react'
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

                <div className="space-y-6">
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
            </motion.div>
        </div>
    )
}
