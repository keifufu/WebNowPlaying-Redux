export enum StateMode { STOPPED = 'STOPPED', PLAYING = 'PLAYING', PAUSED = 'PAUSED' }
export enum RepeatMode { NONE = 'NONE', ONE = 'ONE', ALL = 'ALL' }

export type MediaInfo = {
  player: string
  state: StateMode
  title: string
  artist: string
  album: string
  cover: string
  duration: string
  position: string
  volume: number
  rating: number
  repeat: RepeatMode
  shuffle: boolean
  timestamp: number
}

export const defaultMediaInfo: MediaInfo = {
  player: '',
  state: StateMode.STOPPED,
  title: '',
  artist: '',
  album: '',
  cover: '',
  duration: '0:00',
  position: '0:00',
  volume: 100,
  rating: 0,
  repeat: RepeatMode.NONE,
  shuffle: false,
  timestamp: 0
}

export type SiteInfo = {
  player: () => string // Default '' (empty string)
  state: () => StateMode // Default StateEnum.STOPPED
  title: () => string // Default '' (empty string)
  artist: () => string // Default '' (empty string)
  album: () => string // Default '' (empty string)
  cover: () => string // Default '' (empty string)
  duration: () => string // Default '0:00'
  position: () => string // Default '0:00'
  volume: (() => number) | null // Default 100
  rating: (() => number) | null // Default 0
  repeat: () => RepeatMode // Default RepeatEnum.NONE
  shuffle: () => boolean // Default false
}

export type Site = {
  init?: () => void
  ready: () => boolean,
  info: SiteInfo
  events: {
    togglePlaying: (() => void) | null
    next: (() => void) | null
    previous: (() => void) | null
    setPositionSeconds: ((positionInSeconds: number) => void) | null
    setPositionPercentage: ((progressPercentage: number) => void) | null
    setVolume: ((volume: number) => void) | null
    toggleRepeat: (() => void) | null
    toggleShuffle: (() => void) | null
    toggleThumbsUp: (() => void) | null
    toggleThumbsDown: (() => void) | null
    setRating: ((rating: number) => void) | null
  }
}