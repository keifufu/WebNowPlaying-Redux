import { timeInSecondsToString } from '../../../utils/misc'
import { RepeatMode, Site, StateMode } from '../../types'
import { querySelector, querySelectorEventReport, querySelectorReport } from '../selectors'

const site: Site = {
  ready: () =>
    querySelector<boolean, HTMLElement>('.video-player__default-player', (el) => true, false)
    && querySelector<boolean, HTMLVideoElement>('video', (el) => true, false)
    && querySelector<boolean, HTMLElement>('h2[data-a-target="stream-title"]', (el) => el.innerText.length > 0, false),
  info: {
    player: () => 'Twitch',
    state: () => querySelectorReport<StateMode, HTMLVideoElement>('video', (el) => (el.paused ? StateMode.PAUSED : StateMode.PLAYING), StateMode.PAUSED, 'state'),
    title: () => querySelectorReport<string, HTMLElement>('h2[data-a-target="stream-title"]', (el) => el.innerText, '', 'title'),
    artist: () => querySelectorReport<string, HTMLElement>('h1.tw-title', (el) => el.innerText, '', 'artist'),
    album: () => querySelectorReport<string, HTMLElement>('a[data-a-target="stream-game-link"] > span, [data-a-target="video-info-game-boxart-link"] p', (el) => el.innerText, '', 'album'),
    cover: () => querySelectorReport<string, HTMLImageElement>(`img[alt="${site.info.artist()}" i]`, (el) => el.src.replace('70x70', '600x600'), '', 'cover'),
    duration: () => {
      if (querySelector<boolean, HTMLVideoElement>('video', (el) => el.duration === 1073741824, false)) {
        return querySelectorReport<string, HTMLElement>('span.live-time', (el) => {
          const duration_read = el.innerText.split(':')
          duration_read.reverse()
          let duration = 0
          for (let i = duration_read.length - 1; i >= 0; i--)
            duration += Number(duration_read[i]) * (60 ** i)
          return timeInSecondsToString(duration)
        }, '0:00', 'duration')
      }
      return querySelectorReport<string, HTMLVideoElement>('video', (el) => timeInSecondsToString(el.duration), '0:00', 'duration')
    },
    position: () => {
      if (querySelector<boolean, HTMLVideoElement>('video', (el) => el.duration === 1073741824, false)) {
        return querySelectorReport<string, HTMLElement>('span.live-time', (el) => {
          const duration_read = el.innerText.split(':')
          duration_read.reverse()
          let duration = 0
          for (let i = duration_read.length - 1; i >= 0; i--)
            duration += Number(duration_read[i]) * (60 ** i)
          return timeInSecondsToString(duration)
        }, '0:00', 'position')
      }
      return querySelectorReport<string, HTMLVideoElement>('video', (el) => timeInSecondsToString(el.currentTime), '0:00', 'position')
    },
    volume: () => querySelectorReport<number, HTMLVideoElement>('video', (el) => (el.muted ? 0 : el.volume * 100), 0, 'volume'),
    // Rating could be following, but ffz and/or bttv fuck it up so I can't get it consistently
    rating: () => 0,
    repeat: () => RepeatMode.NONE,
    shuffle: () => false
  },
  events: {
    togglePlaying: () => querySelectorEventReport<HTMLVideoElement>('video', (el) => (el.paused ? el.play() : el.pause()), 'togglePlaying'),
    next: () => {
      querySelectorEventReport<HTMLVideoElement>('video', (el) => {
        if (el.duration !== 1073741824) return
        el.currentTime = el.duration
      }, 'next')
    },
    previous: () => {
      querySelectorEventReport<HTMLVideoElement>('video', (el) => {
        if (el.duration !== 1073741824) return
        el.currentTime = 0
      }, 'previous')
    },
    setPositionSeconds: (positionInSeconds: number) => {
      querySelectorEventReport<HTMLVideoElement>('video', (el) => {
        if (el.duration !== 1073741824) return
        el.currentTime = positionInSeconds
      }, 'setPositionSeconds')
    },
    setPositionPercentage: null,
    setVolume: (volume: number) => querySelectorEventReport<HTMLVideoElement>('video', (el) => el.volume = volume / 100, 'setVolume'),
    toggleRepeat: null,
    toggleShuffle: null,
    toggleThumbsUp: null,
    toggleThumbsDown: null,
    setRating: null
  }
}

export default site