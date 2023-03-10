import { getMediaSessionCover } from '../../../utils/misc'
import { RepeatMode, Site, StateMode } from '../../types'
import { querySelector, querySelectorEventReport, querySelectorReport } from '../selectors'

// Not reporting duration, position and rating as it seems they disappear once deezer annoys you with its ads

const site: Site = {
  ready: () =>
    navigator.mediaSession.metadata !== null && querySelector<boolean, HTMLElement>('.track-link', (el) => true, false),
  info: {
    player: () => 'Deezer',
    state: () => querySelectorReport<StateMode, HTMLElement>('(.player-controls svg)[1]', (el) => (el.getAttribute('data-testid') === 'PauseIcon' ? StateMode.PLAYING : StateMode.PAUSED), StateMode.PAUSED, 'state'),
    title: () => navigator.mediaSession.metadata?.title || '',
    artist: () => navigator.mediaSession.metadata?.artist || '',
    album: () => navigator.mediaSession.metadata?.album || '',
    cover: () => getMediaSessionCover(),
    duration: () => querySelector<string, HTMLElement>('.slider-counter-max', (el) => el.innerText, '0:00'),
    position: () => querySelector<string, HTMLElement>('.slider-counter-current', (el) => el.innerText, '0:00'),
    volume: () => 100,
    rating: () => querySelector<number, HTMLElement>('(.track-actions svg)[2]', (el) => (el.getAttribute('data-testid') === 'HeartIcon' ? 0 : 5), 0),
    repeat: () => querySelectorReport<RepeatMode, HTMLElement>('(.option-item svg)[1]', (el) => {
      const isActive = getComputedStyle(el).color === 'rgb(239, 84, 102)'
      if (el.getAttribute('data-testid') === 'RepeatIcon' && isActive) return RepeatMode.ALL
      if (el.getAttribute('data-testid') === 'RepeatOneIcon') return RepeatMode.ONE
      return RepeatMode.NONE
    }, RepeatMode.NONE, 'repeat'),
    shuffle: () => querySelectorReport<boolean, HTMLElement>('(.option-item svg)[2]', (el) => getComputedStyle(el).color === 'rgb(239, 84, 102)', false, 'shuffle')
  },
  events: {
    togglePlaying: () => querySelectorEventReport<HTMLButtonElement>('(.player-controls button)[1]', (el) => el.click(), 'togglePlaying'),
    next: () => querySelectorEventReport<HTMLButtonElement>('(.player-controls button)[2]', (el) => el.click(), 'next'),
    previous: () => querySelectorEventReport<HTMLButtonElement>('(.player-controls button)[0]', (el) => el.click(), 'previous'),
    setPositionSeconds: null,
    setPositionPercentage: (positionPercentage: number) => {
      querySelectorEventReport<HTMLInputElement>('.slider-track-input', (el) => {
        const loc = el.getBoundingClientRect()
        const position = positionPercentage * loc.width

        el.value = (positionPercentage * parseFloat(el.getAttribute('aria-valuemax') || '0')).toString()
        el.dispatchEvent(new MouseEvent('mouseup', {
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: loc.left + position,
          clientY: loc.top + (loc.height / 2)
        }))
      }, 'setPositionPercentage')
    },
    setVolume: null,
    toggleRepeat: () => querySelectorEventReport<HTMLButtonElement>('(.option-item button)[1]', (el) => el.click(), 'toggleRepeat'),
    toggleShuffle: () => querySelectorEventReport<HTMLButtonElement>('(.option-item button)[2]', (el) => el.click(), 'toggleShuffle'),
    toggleThumbsUp: () => querySelectorEventReport<HTMLButtonElement>('(.track-actions button)[2]', (el) => el.click(), 'toggleThumbsUp'),
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