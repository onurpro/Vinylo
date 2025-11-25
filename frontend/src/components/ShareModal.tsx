import { X, Download, Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface ShareModalProps {
    imageSrc: string
    onClose: () => void
}

export default function ShareModal({ imageSrc, onClose }: ShareModalProps) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        try {
            const response = await fetch(imageSrc)
            const blob = await response.blob()
            await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
            ])
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy', err)
            alert('Failed to copy to clipboard. Please try downloading instead.')
        }
    }

    const handleDownload = () => {
        const link = document.createElement('a')
        link.download = 'vinylo-matchup.png'
        link.href = imageSrc
        link.click()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-white border-4 border-black rounded-[2rem] max-w-2xl w-full p-8 shadow-[12px_12px_0px_rgba(0,0,0,0.2)] relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-6 right-6 text-black hover:scale-110 transition-transform bg-gray-100 p-2 rounded-full border-2 border-black">
                    <X size={24} />
                </button>

                <h3 className="text-3xl font-black text-black mb-8 text-center tracking-tighter uppercase">Share Matchup</h3>

                <div className="bg-gray-100 rounded-xl overflow-hidden mb-8 border-2 border-black p-4 flex justify-center shadow-inner">
                    <img src={imageSrc} alt="Matchup Preview" className="max-h-[50vh] w-auto rounded-lg shadow-lg border border-gray-200" />
                </div>

                <div className="flex gap-4 justify-center">
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 px-6 py-4 bg-white hover:bg-gray-50 text-black rounded-xl font-bold transition-all border-2 border-black shadow-[4px_4px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_black] active:translate-x-0 active:translate-y-0 active:shadow-none"
                    >
                        {copied ? <Check size={20} className="text-green-600" /> : <Copy size={20} />}
                        {copied ? 'Copied!' : 'Copy Image'}
                    </button>
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-6 py-4 bg-yellow-400 hover:bg-yellow-300 text-black rounded-xl font-bold transition-all border-2 border-black shadow-[4px_4px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_black] active:translate-x-0 active:translate-y-0 active:shadow-none"
                    >
                        <Download size={20} />
                        Download
                    </button>
                </div>
            </div>
        </div>
    )
}
