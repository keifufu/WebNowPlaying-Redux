import { getMediaSessionCover, timeInSecondsToString } from '../../../utils/misc'
import { RepeatMode, Site, StateMode } from '../../types'
import { querySelector, querySelectorEventReport, querySelectorReport } from '../selectors'

// Repeat and shuffle on Apple Music don't update instantly, we click the button but it takes a few ms for info.repeat() to return the correct value

const site: Site = {
  ready: () => navigator.mediaSession.metadata !== null && querySelector<boolean, HTMLAudioElement>('audio', (el) => el !== null, false),
  info: {
    player: () => 'Apple Music',
    // Supports mediaSession.metadata, but not mediaSession.playbackState
    state: () => querySelectorReport<StateMode, HTMLAudioElement>('audio', (el) => (el.paused ? StateMode.PAUSED : StateMode.PLAYING), StateMode.PAUSED, 'state'),
    title: () => navigator.mediaSession.metadata?.title || '',
    artist: () => navigator.mediaSession.metadata?.artist || '',
    album: () => navigator.mediaSession.metadata?.album || '',
    cover: () => getMediaSessionCover(),
    duration: () => querySelectorReport<string, HTMLAudioElement>('audio', (el) => timeInSecondsToString(el.duration), '0:00', 'duration'),
    position: () => querySelectorReport<string, HTMLAudioElement>('audio', (el) => timeInSecondsToString(el.currentTime), '0:00', 'position'),
    volume: () => querySelectorReport<number, HTMLAudioElement>('audio', (el) => (el.muted ? 0 : el.volume * 100), 100, 'volume'),
    rating: null,
    repeat: () => {
      const repeatButton = document.querySelector('amp-chrome-player')?.shadowRoot?.querySelector('apple-music-playback-controls')?.shadowRoot?.querySelector('amp-playback-controls-repeat')?.shadowRoot?.querySelector('.button--repeat')
      return repeatButton?.classList.contains('mode--0') ? RepeatMode.NONE : repeatButton?.classList.contains('mode--1') ? RepeatMode.ONE : RepeatMode.ALL
    },
    shuffle: () => {
      const shuffleButton = document.querySelector('amp-chrome-player')?.shadowRoot?.querySelector('apple-music-playback-controls')?.shadowRoot?.querySelector('amp-playback-controls-shuffle')?.shadowRoot?.querySelector('.button--shuffle')
      return shuffleButton?.classList.contains('shuffled') || false
    }
  },
  events: {
    togglePlaying: () => querySelectorEventReport<HTMLAudioElement>('audio', (el) => (el.paused ? el.play() : el.pause()), 'togglePlaying'),
    next: () => document.querySelector('amp-chrome-player')?.shadowRoot?.querySelector('apple-music-playback-controls')?.shadowRoot?.querySelector('amp-playback-controls-item-skip[class="next"]')?.shadowRoot?.querySelector<HTMLButtonElement>('.button--next')?.click(),
    // Apple Music's previous button already skips to the beginning of the song if the song is less than a few seconds in
    previous: () => document.querySelector('amp-chrome-player')?.shadowRoot?.querySelector('apple-music-playback-controls')?.shadowRoot?.querySelector('amp-playback-controls-item-skip[class="previous"]')?.shadowRoot?.querySelector<HTMLButtonElement>('.button--previous')?.click(),
    setPositionSeconds: (positionInSeconds: number) => querySelectorEventReport<HTMLAudioElement>('audio', (el) => (el.currentTime = positionInSeconds), 'setPositionSeconds'),
    setPositionPercentage: null,
    setVolume: (volume: number) => querySelectorEventReport<HTMLAudioElement>('audio', (el) => (el.volume = volume / 100), 'setVolume'),
    toggleRepeat: () => document.querySelector('amp-chrome-player')?.shadowRoot?.querySelector('apple-music-playback-controls')?.shadowRoot?.querySelector('amp-playback-controls-repeat')?.shadowRoot?.querySelector<HTMLButtonElement>('.button--repeat')?.click(),
    toggleShuffle: () => document.querySelector('amp-chrome-player')?.shadowRoot?.querySelector('apple-music-playback-controls')?.shadowRoot?.querySelector('amp-playback-controls-shuffle')?.shadowRoot?.querySelector<HTMLButtonElement>('.button--shuffle')?.click(),
    toggleThumbsUp: null,
    toggleThumbsDown: null,
    setRating: null
  }
}

export default site