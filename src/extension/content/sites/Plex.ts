import { getMediaSessionCover, timeInSecondsToString } from '../../../utils/misc'
import { RepeatMode, Site, StateMode } from '../../types'
import { querySelector, querySelectorEvent, querySelectorEventReport, querySelectorReport } from '../selectors'

const site: Site = {
  ready: () => querySelector<boolean, HTMLVideoElement>('video', (el) => el !== null && el.duration > 0, false),
  info: {
    player: () => 'Plex',
    state: () => querySelectorReport<StateMode, HTMLVideoElement>('video', (el) => (el.paused ? StateMode.PAUSED : StateMode.PLAYING), StateMode.STOPPED, 'state'),
    // Not reporting because some views on Plex don't have a title (live TV)
    title: () => querySelector<string, HTMLElement>('[class*="MetadataPosterTitle-title"]', (el) => el.innerText, document.title),
    // Not reporting because some views on Plex don't have a artist (live TV)
    artist: () => querySelector<string, HTMLElement>('[data-testid="metadataYear"]', (el) => el.innerText, ''),
    album: () => '',
    cover: () => getMediaSessionCover(),
    duration: () => querySelectorReport<string, HTMLVideoElement>('video', (el) => timeInSecondsToString(el.duration), '0:00', 'duration'),
    position: () => querySelectorReport<string, HTMLVideoElement>('video', (el) => timeInSecondsToString(el.currentTime), '0:00', 'position'),
    volume: () => querySelectorReport<number, HTMLVideoElement>('video', (el) => (el.muted ? 0 : el.volume * 100), 100, 'volume'),
    rating: () => 0,
    // Not reporting because some views on Plex don't have a repeat button (live TV)
    repeat: () => querySelector<RepeatMode, HTMLButtonElement>('button[data-testid="repeatButton"], button[data-testid="repeatOneButton"]', (el) => {
      if (el.className.includes('Active')) {
        if (el.getAttribute('data-testid') === 'repeatButton') return RepeatMode.ALL
        else return RepeatMode.ONE
      }
      return RepeatMode.NONE
    }, RepeatMode.NONE),
    // Not reporting because some views on Plex don't have a shuffle button (live TV)
    shuffle: () => querySelector<boolean, HTMLButtonElement>('button[data-testid="shuffleButton"]', (el) => el.className.includes('Active'), false)
  },
  events: {
    togglePlaying: () => {
      querySelectorEventReport<HTMLButtonElement>('button[data-testid="pauseButton"], button[data-testid="resumeButton"], button[data-testid="closeButton"]', (el) => {
        el.dispatchEvent(new MouseEvent('mousedown', { view: window, bubbles: true, cancelable: true, clientX: 0, clientY: 0 }))
        el.dispatchEvent(new MouseEvent('mouseup', { view: window, bubbles: true, cancelable: true, clientX: 0, clientY: 0 }))
      }, 'togglePlaying')
    },
    next: () => {
      querySelectorEventReport<HTMLButtonElement>('button[data-testid="nextButton"]', (el) => {
        el.dispatchEvent(new MouseEvent('mousedown', { view: window, bubbles: true, cancelable: true, clientX: 0, clientY: 0 }))
        el.dispatchEvent(new MouseEvent('mouseup', { view: window, bubbles: true, cancelable: true, clientX: 0, clientY: 0 }))
      }, 'next')
    },
    previous: () => {
      querySelectorEventReport<HTMLButtonElement>('button[data-testid="previousButton"]', (el) => {
        el.dispatchEvent(new MouseEvent('mousedown', { view: window, bubbles: true, cancelable: true, clientX: 0, clientY: 0 }))
        el.dispatchEvent(new MouseEvent('mouseup', { view: window, bubbles: true, cancelable: true, clientX: 0, clientY: 0 }))
      }, 'previous')
    },
    setPositionSeconds: (positionInSeconds: number) => querySelectorEventReport<HTMLVideoElement>('video', (el) => el.currentTime = positionInSeconds, 'setPositionSeconds'),
    setPositionPercentage: null,
    setVolume: (volume: number) => {
      querySelectorEventReport<HTMLVideoElement>('video', (el) => {
        el.volume = volume / 100
        if (volume === 0) el.muted = true
        else el.muted = false
      }, 'setVolume')
    },
    toggleRepeat: () => {
      querySelectorEvent<HTMLButtonElement>('button[data-testid="repeatButton"], button[data-testid="repeatOneButton"]', (el) => {
        el.dispatchEvent(new MouseEvent('mousedown', { view: window, bubbles: true, cancelable: true, clientX: 0, clientY: 0 }))
        el.dispatchEvent(new MouseEvent('mouseup', { view: window, bubbles: true, cancelable: true, clientX: 0, clientY: 0 }))
      })
    },
    toggleShuffle: () => {
      querySelectorEvent<HTMLButtonElement>('button[data-testid="shuffleButton"]', (el) => {
        el.dispatchEvent(new MouseEvent('mousedown', { view: window, bubbles: true, cancelable: true, clientX: 0, clientY: 0 }))
        el.dispatchEvent(new MouseEvent('mouseup', { view: window, bubbles: true, cancelable: true, clientX: 0, clientY: 0 }))
      })
    },
    toggleThumbsUp: null,
    toggleThumbsDown: null,
    setRating: null
  }
}

export default site