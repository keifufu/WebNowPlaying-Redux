import { getMediaSessionCover } from '../../../utils/misc'
import { RepeatMode, Site, StateMode } from '../../types'
import { querySelector, querySelectorEventReport, querySelectorReport } from '../selectors'
import { ratingUtils } from '../utils'

const site: Site = {
  ready: () => navigator.mediaSession.metadata !== null && querySelector<boolean, HTMLElement>('(.player-controls__buttons button svg path)[3]', (el) => true, false),
  info: {
    player: () => 'Spotify',
    // Supports mediaSession.metadata, but not mediaSession.playbackState
    state: () => querySelectorReport<StateMode, HTMLButtonElement>('(.player-controls__buttons button svg path)[3]', (el) => {
      const path = el.getAttribute('d')
      const playingPath = 'M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z'
      if (path === playingPath) return StateMode.PLAYING
      return StateMode.PAUSED
    }, StateMode.PAUSED, 'state'),
    title: () => navigator.mediaSession.metadata?.title || '',
    artist: () => navigator.mediaSession.metadata?.artist || '',
    album: () => navigator.mediaSession.metadata?.album || '',
    cover: () => getMediaSessionCover(),
    duration: () => querySelectorReport<string, HTMLElement>('(.playback-bar > div)[2]', (el) => el.innerText, '0:00', 'duration'),
    position: () => querySelectorReport<string, HTMLElement>('.playback-bar > div', (el) => el.innerText, '0:00', 'position'),
    volume: () => querySelectorReport<number, HTMLElement>('.volume-bar__slider-container > div > div', (el) => parseFloat(el.style.getPropertyValue('--progress-bar-transform').replace('%', '')), 100, 'volume'),
    rating: () => querySelectorReport<number, HTMLButtonElement>('(.Root__now-playing-bar button)[1]', (el) => (el.getAttribute('aria-checked') === 'true' ? 5 : 0), 0, 'rating'),
    repeat: () => querySelectorReport<RepeatMode, HTMLButtonElement>('(.player-controls__buttons button)[4]', (el) => {
      const state = el.getAttribute('aria-checked')
      if (state === 'true') return RepeatMode.ALL
      if (state === 'mixed') return RepeatMode.ONE
      return RepeatMode.NONE
    }, RepeatMode.NONE, 'repeat'),
    shuffle: () => querySelectorReport<boolean, HTMLButtonElement>('.player-controls__buttons button', (el) => el.getAttribute('aria-checked') === 'true', false, 'shuffle')
  },
  events: {
    togglePlaying: () => querySelectorEventReport<HTMLButtonElement>('(.player-controls__buttons button)[2]', (el) => el.click(), 'togglePlaying'),
    next: () => querySelectorEventReport<HTMLButtonElement>('(.player-controls__buttons button)[3]', (el) => el.click(), 'next'),
    previous: () => querySelectorEventReport<HTMLButtonElement>('(.player-controls__buttons button)[1]', (el) => el.click(), 'previous'),
    setPositionSeconds: null,
    setPositionPercentage: (positionPercentage: number) => {
      querySelectorEventReport<HTMLElement>('.playback-bar > div > div', (el) => {
        const loc = el.getBoundingClientRect()
        const position = positionPercentage * loc.width

        el.dispatchEvent(new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX: loc.left + position,
          clientY: loc.top + (loc.height / 2)
        }))
        el.dispatchEvent(new MouseEvent('mouseup', {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX: loc.left + position,
          clientY: loc.top + (loc.height / 2)
        }))
      }, 'setPositionPercentage')
    },
    setVolume: (volume: number) => {
      querySelectorEventReport<HTMLElement>('.volume-bar > div > div > div', (el) => {
        const loc = el.getBoundingClientRect()
        const vol = (volume / 100) * loc.width

        el.dispatchEvent(new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX: loc.left + vol,
          clientY: loc.top + (loc.height / 2)
        }))
        el.dispatchEvent(new MouseEvent('mouseup', {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX: loc.left + vol,
          clientY: loc.top + (loc.height / 2)
        }))
      }, 'setVolume')
    },
    toggleRepeat: () => querySelectorEventReport<HTMLButtonElement>('(.player-controls__buttons button)[4]', (el) => el.click(), 'toggleRepeat'),
    toggleShuffle: () => querySelectorEventReport<HTMLButtonElement>('.player-controls__buttons button', (el) => el.click(), 'toggleShuffle'),
    toggleThumbsUp: () => querySelectorEventReport<HTMLButtonElement>('(.Root__now-playing-bar button)[1]', (el) => el.click(), 'toggleThumbsUp'),
    toggleThumbsDown: null,
    setRating: (rating: number) => ratingUtils.like(site, rating)
  }
}

export default site