import { getMediaSessionCover, timeInSecondsToString } from '../../../utils/misc'
import { RepeatMode, Site, StateMode } from '../../types'
import { querySelector, querySelectorEventReport, querySelectorReport } from '../selectors'

const site: Site = {
  ready: () => navigator.mediaSession.metadata !== null && querySelector<boolean, HTMLAudioElement>('audio', (el) => true, false),
  info: {
    player: () => 'Navidrome',
    // Not reporting state as it has no > svg > path when loading
    state: () => querySelector<StateMode, HTMLElement>('.group.play-btn svg path', (el) => {
      const playingPath = 'M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm-16 328c0 8.8-7.2 16-16 16h-48c-8.8 0-16-7.2-16-16V176c0-8.8 7.2-16 16-16h48c8.8 0 16 7.2 16 16v160zm112 0c0 8.8-7.2 16-16 16h-48c-8.8 0-16-7.2-16-16V176c0-8.8 7.2-16 16-16h48c8.8 0 16 7.2 16 16v160z'
      if (el.getAttribute('d') === playingPath) return StateMode.PLAYING
      return StateMode.PAUSED
    }, StateMode.STOPPED),
    title: () => navigator.mediaSession.metadata?.title || '',
    artist: () => navigator.mediaSession.metadata?.artist || '',
    album: () => {
      const album = navigator.mediaSession.metadata?.album || ''
      if (album === site.info.title()) return ''
      return album
    },
    cover: () => getMediaSessionCover(),
    duration: () => querySelectorReport<string, HTMLAudioElement>('audio', (el) => timeInSecondsToString(el.duration), '0:00', 'duration'),
    position: () => querySelectorReport<string, HTMLAudioElement>('audio', (el) => timeInSecondsToString(el.currentTime), '0:00', 'position'),
    volume: () => querySelectorReport<number, HTMLAudioElement>('audio', (el) => el.volume * 100, 100, 'volume'),
    rating: () => querySelectorReport<number, HTMLElement>('.player-content > button path', (el) => {
      const favPath = 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'
      if (el.getAttribute('d') === favPath) return 5
      return 0
    }, 0, 'rating'),
    repeat: () => querySelectorReport<RepeatMode, HTMLElement>('.group.loop-btn svg path', (el) => {
      const repeatNonePath = 'M4 15h16v-2H4v2zm0 4h16v-2H4v2zm0-8h16V9H4v2zm0-6v2h16V5H4z'
      const repeatAllPath = 'M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z'
      const repeatOnePath = 'M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z'
      if (el.getAttribute('d') === repeatNonePath) return RepeatMode.NONE
      if (el.getAttribute('d') === repeatAllPath) return RepeatMode.ALL
      if (el.getAttribute('d') === repeatOnePath) return RepeatMode.ONE
      return RepeatMode.NONE
    }, RepeatMode.NONE, 'repeat'),
    shuffle: () => querySelectorReport<boolean, HTMLElement>('.group.loop-btn svg path', (el) => {
      // eslint-disable-next-line max-len
      const shufflePath = 'M4 9h3.5c.736 0 1.393.391 1.851 1.001.325-.604.729-1.163 1.191-1.662-.803-.823-1.866-1.339-3.042-1.339h-3.5c-.553 0-1 .448-1 1s.447 1 1 1zM11.685 12.111c.551-1.657 2.256-3.111 3.649-3.111h1.838l-1.293 1.293c-.391.391-.391 1.023 0 1.414.195.195.451.293.707.293s.512-.098.707-.293l3.707-3.707-3.707-3.707c-.391-.391-1.023-.391-1.414 0s-.391 1.023 0 1.414l1.293 1.293h-1.838c-2.274 0-4.711 1.967-5.547 4.479l-.472 1.411c-.641 1.926-2.072 3.11-2.815 3.11h-2.5c-.553 0-1 .448-1 1s.447 1 1 1h2.5c1.837 0 3.863-1.925 4.713-4.479l.472-1.41zM15.879 13.293c-.391.391-.391 1.023 0 1.414l1.293 1.293h-2.338c-1.268 0-2.33-.891-2.691-2.108-.256.75-.627 1.499-1.09 2.185.886 1.162 2.243 1.923 3.781 1.923h2.338l-1.293 1.293c-.391.391-.391 1.023 0 1.414.195.195.451.293.707.293s.512-.098.707-.293l3.707-3.707-3.707-3.707c-.391-.391-1.023-.391-1.414 0z'
      if (el.getAttribute('d') === shufflePath) return true
      return false
    }, false, 'shuffle')
  },
  events: {
    togglePlaying: () => querySelectorEventReport<HTMLButtonElement>('.group.play-btn', (el) => el.click(), 'togglePlaying'),
    next: () => querySelectorEventReport<HTMLButtonElement>('.group.next-audio', (el) => el.click(), 'next'),
    previous: () => querySelectorEventReport<HTMLButtonElement>('.group.prev-audio', (el) => el.click(), 'previous'),
    setPositionSeconds: (positionInSeconds: number) => querySelectorEventReport<HTMLAudioElement>('audio', (el) => el.currentTime = positionInSeconds, 'setPositionSeconds'),
    setPositionPercentage: null,
    setVolume: (volume: number) => querySelectorEventReport<HTMLAudioElement>('audio', (el) => el.volume = volume / 100, 'setVolume'),
    toggleRepeat: () => {
      const click = (n = 1) => {
        for (let i = 0; i < n; i++) querySelectorEventReport<HTMLButtonElement>('.group.loop-btn', (el) => el.click(), 'toggleRepeat')
      }
      const shuffle = site.info.shuffle()
      const repeat = site.info.repeat()
      if (shuffle || repeat === RepeatMode.ONE) return click(2)
      click()
    },
    toggleShuffle: () => {
      const click = (n = 1) => {
        for (let i = 0; i < n; i++) querySelectorEventReport<HTMLButtonElement>('.group.loop-btn', (el) => el.click(), 'toggleShuffle')
      }
      const shuffle = site.info.shuffle()
      const repeat = site.info.repeat()
      if (shuffle || repeat === RepeatMode.ONE) return click()
      if (repeat === RepeatMode.NONE) return click(3)
      if (repeat === RepeatMode.ALL) return click(2)
    },
    toggleThumbsUp: () => querySelectorEventReport<HTMLButtonElement>('.player-content > button', (el) => el.click(), 'toggleThumbsUp'),
    toggleThumbsDown: null,
    setRating: (rating: number) => {
      if (rating >= 3 && site.info.rating?.() !== 5)
        site.events.toggleThumbsUp?.()
      else if (rating < 3 && site.info.rating?.() === 5)
        site.events.toggleThumbsUp?.()
    }
  }
}

export default site