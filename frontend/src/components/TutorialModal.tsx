import { motion } from 'framer-motion'
import { HelpCircle, Check, Ban } from 'lucide-react'

interface TutorialModalProps {
    onClose: () => void
}

export default function TutorialModal({ onClose }: TutorialModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center border-4 border-black relative"
                onClick={e => e.stopPropagation()}
            >
                <div className="w-16 h-16 bg-yellow-400 text-black rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-black shadow-[4px_4px_0px_black]">
                    <HelpCircle size={32} strokeWidth={2.5} />
                </div>

                <h3 className="text-3xl font-black text-black mb-6 uppercase tracking-tight">How to Play</h3>

                <div className="space-y-4 text-left mb-8">
                    <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0 font-bold text-sm mt-0.5">1</div>
                        <p className="text-black font-medium text-lg">Choose the album you prefer from the two options.</p>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0 font-bold text-sm mt-0.5">2</div>
                        <p className="text-black font-medium text-lg">Your choices help determine the global ranking.</p>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0 font-bold text-sm mt-0.5">3</div>
                        <p className="text-black font-medium text-lg">
                            Use the
                            <span className="inline-flex items-center justify-center w-6 h-6 bg-white border-2 border-black rounded-full text-gray-400 mx-1.5 align-middle -translate-y-0.5">
                                <Ban size={12} />
                            </span>
                            button to skip albums you don't know or prefer not to rank.
                        </p>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="w-full py-4 bg-black text-white font-bold text-xl rounded-xl hover:bg-gray-800 transition-all shadow-[4px_4px_0px_#fbbf24] hover:shadow-[6px_6px_0px_#fbbf24] hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-0 active:translate-y-0 active:shadow-none flex items-center justify-center gap-2"
                >
                    <Check size={24} />
                    Got it!
                </button>
            </motion.div>
        </div>
    )
}
