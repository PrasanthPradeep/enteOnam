import { useState, useRef, useEffect } from 'react'
import { Volume2, VolumeOff } from 'lucide-react'

export default function MusicToggle() {
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.loop = true
    if (playing) {
      audio.play().catch(() => setPlaying(false))
    } else {
      audio.pause()
    }
  }, [playing])

  return (
    <>
      <audio ref={audioRef} src="/onamBgm.mp3" preload="none" />
      <button
        onClick={() => setPlaying(prev => !prev)}
        aria-label={playing ? 'Pause background music' : 'Play background music'}
        className={`fixed bottom-6 left-4 md:bottom-auto md:left-auto md:top-20 md:right-4 z-40 h-11 w-11 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${
          playing
            ? 'bg-gold text-white shadow-gold/30 animate-pulse'
            : 'bg-green text-white hover:bg-green-600'
        }`}
      >
        {playing ? <Volume2 className="h-5 w-5" /> : <VolumeOff className="h-5 w-5" />}
      </button>
    </>
  )
}
