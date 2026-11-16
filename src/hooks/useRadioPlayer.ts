import { useCallback, useEffect, useRef, useState } from 'react'

export type RadioStatus = 'stopped' | 'loading' | 'playing' | 'error'

const VOLUME_KEY = 'kihabbo:volume'
const MUTED_KEY = 'kihabbo:muted'

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* modo privado / armazenamento bloqueado: segue sem salvar */
  }
}

interface NowPlaying {
  title: string
  artist: string
}

/**
 * Player da rádio no mesmo esquema do kihabbo.com.br: um <audio> apontando para o stream MP3 ao vivo
 * (https://radio.kihabbo.com.br/, vindo de /v1/player/status), só conectando ao dar play.
 * Ao pausar, desconecta: quando voltar, toca o ao vivo (e não o que ficou no buffer).
 */
export function useRadioPlayer(streamUrl: string, nowPlaying: NowPlaying) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const statusRef = useRef<RadioStatus>('stopped')
  const [status, setStatusState] = useState<RadioStatus>('stopped')
  const [volume, setVolume] = useState(() => {
    const saved = Number(readStorage(VOLUME_KEY))
    return readStorage(VOLUME_KEY) !== null && saved >= 0 && saved <= 100 ? saved : 70
  })
  const [muted, setMuted] = useState(() => readStorage(MUTED_KEY) === '1')

  const setStatus = useCallback((s: RadioStatus) => {
    statusRef.current = s
    setStatusState(s)
  }, [])

  // cria o <audio> uma vez (fora do DOM) e escuta os eventos do stream
  useEffect(() => {
    const audio = new Audio()
    audio.preload = 'none'
    audioRef.current = audio

    const onPlaying = () => setStatus('playing')
    const onWaiting = () => {
      if (statusRef.current !== 'stopped') setStatus('loading')
    }
    const onError = () => {
      if (statusRef.current !== 'stopped') setStatus('error')
    }
    const onPause = () => {
      // pausado por fora (fone desconectado, outro app, teclas de mídia)
      if (statusRef.current === 'playing') setStatus('stopped')
    }

    audio.addEventListener('playing', onPlaying)
    audio.addEventListener('waiting', onWaiting)
    audio.addEventListener('stalled', onWaiting)
    audio.addEventListener('error', onError)
    audio.addEventListener('pause', onPause)
    return () => {
      audio.removeEventListener('playing', onPlaying)
      audio.removeEventListener('waiting', onWaiting)
      audio.removeEventListener('stalled', onWaiting)
      audio.removeEventListener('error', onError)
      audio.removeEventListener('pause', onPause)
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
      audioRef.current = null
    }
  }, [setStatus])

  // aplica e salva volume / mudo
  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      audio.volume = volume / 100
      audio.muted = muted
    }
    writeStorage(VOLUME_KEY, String(volume))
    writeStorage(MUTED_KEY, muted ? '1' : '0')
  }, [volume, muted])

  const play = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return
    setStatus('loading')
    audio.src = streamUrl
    audio.volume = volume / 100
    audio.muted = muted
    try {
      await audio.play()
    } catch (err) {
      // NotAllowedError = navegador bloqueou (sem clique); AbortError = usuário parou antes de conectar
      const name = err instanceof DOMException ? err.name : ''
      setStatus(name === 'NotAllowedError' || name === 'AbortError' ? 'stopped' : 'error')
    }
  }, [streamUrl, volume, muted, setStatus])

  const stop = useCallback(() => {
    const audio = audioRef.current
    setStatus('stopped')
    if (!audio) return
    audio.pause()
    audio.removeAttribute('src') // encerra a conexão com o stream
    audio.load()
  }, [setStatus])

  const toggle = useCallback(() => {
    if (statusRef.current === 'playing' || statusRef.current === 'loading') stop()
    else void play()
  }, [play, stop])

  const changeVolume = useCallback((v: number) => {
    setVolume(v)
    if (v > 0) setMuted(false)
  }, [])

  const toggleMute = useCallback(() => {
    setMuted((m) => !m)
    // desmutar com volume 0 não adiantaria nada
    setVolume((v) => (v === 0 ? 50 : v))
  }, [])

  // teclas de mídia / notificação do sistema (Media Session)
  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: nowPlaying.title,
        artist: nowPlaying.artist,
        album: 'Rádio Kihabbo',
        artwork: [{ src: '/favicon.png', sizes: '42x42', type: 'image/png' }],
      })
      navigator.mediaSession.setActionHandler('play', () => void play())
      navigator.mediaSession.setActionHandler('pause', stop)
      navigator.mediaSession.setActionHandler('stop', stop)
      navigator.mediaSession.playbackState = status === 'playing' ? 'playing' : status === 'stopped' ? 'paused' : 'none'
    } catch {
      /* navegador sem suporte completo */
    }
  }, [nowPlaying.title, nowPlaying.artist, play, stop, status])

  return {
    status,
    playing: status === 'playing',
    volume,
    muted,
    toggle,
    play,
    stop,
    setVolume: changeVolume,
    toggleMute,
  }
}
