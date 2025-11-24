import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Onboarding from './components/Onboarding'
import Game from './components/Game'
import MainMenu from './components/MainMenu'
import Stats from './components/Stats'
import IgnoredAlbums from './components/IgnoredAlbums'

function App() {
  const [username, setUsername] = useState<string | null>(null)
  const [view, setView] = useState<'menu' | 'game' | 'stats' | 'ignored'>('menu')

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('album_elo_user')
    if (storedUser) {
      setUsername(storedUser)
    }

    // Check for Spotify login redirect
    const params = new URLSearchParams(window.location.search)
    const urlUsername = params.get('username')
    if (urlUsername) {
      // Force logout first to clear any old session
      localStorage.removeItem('album_elo_user')
      handleLogin(urlUsername)
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  const handleLogin = (user: string) => {
    setUsername(user)
    localStorage.setItem('album_elo_user', user)
    setView('menu')
  }

  const handleLogout = () => {
    setUsername(null)
    localStorage.removeItem('album_elo_user')
    setView('menu')
  }

  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center p-4">

      <div className="z-10 w-full">
        <AnimatePresence mode="wait">
          {!username ? (
            <motion.div
              key="onboarding"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Onboarding onLogin={handleLogin} />
            </motion.div>
          ) : (
            <>
              {view === 'menu' && (
                <motion.div
                  key="menu"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  className="w-full h-screen absolute inset-0"
                >
                  <MainMenu
                    username={username}
                    onPlay={() => setView('game')}
                    onStats={() => setView('stats')}
                    onIgnored={() => setView('ignored')}
                    onLogout={handleLogout}
                  />
                </motion.div>
              )}

              {view === 'game' && (
                <motion.div
                  key="game"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-screen absolute inset-0"
                >
                  <button
                    onClick={() => setView('menu')}
                    className="absolute top-6 left-6 z-50 px-6 py-2 bg-white text-black border-2 border-black font-bold rounded-xl shadow-[4px_4px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_black] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all"
                  >
                    BACK
                  </button>
                  <Game username={username} />
                </motion.div>
              )}

              {view === 'stats' && (
                <motion.div
                  key="stats"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-screen absolute inset-0"
                >
                  <Stats username={username} onBack={() => setView('menu')} />
                </motion.div>
              )}

              {view === 'ignored' && (
                <motion.div
                  key="ignored"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-screen absolute inset-0"
                >
                  <IgnoredAlbums username={username} onBack={() => setView('menu')} />
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default App
