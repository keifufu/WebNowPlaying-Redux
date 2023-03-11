import { RepeatMode, Site, StateMode } from '../../types'
import { querySelector, querySelectorEvent, querySelectorEventReport, querySelectorReport } from '../selectors'
import { ratingUtils } from '../utils'

let currentCoverUrl = ''
let lastCoverVideoId = ''

// I'm not using mediaSession here because of ads.
// Of course this isn't an issue with YouTube Premium or adblock, but still.
const site: Site = {
  ready: () =>
    querySelector<boolean, HTMLElement>('video', (el) => true, false)
    && querySelector<boolean, HTMLElement>('.title.ytmusic-player-bar', (el) => el.innerText.length > 0, false),
  info: {
    player: () => 'Youtube Music',
    state: () => querySelectorReport<StateMode, HTMLVideoElement>('video', (el) => (el.paused ? StateMode.PAUSED : StateMode.PLAYING), StateMode.PAUSED, 'state'),
    title: () => querySelectorReport<string, HTMLElement>('.title.ytmusic-player-bar', (el) => el.innerText, '', 'title'),
    artist: () => querySelectorReport<string, HTMLElement>('.byline.ytmusic-player-bar a', (el) => el.innerText, '', 'artist'),
    // There isn't always a album, so I'm not reporting it
    album: () => querySelector<string, HTMLElement>('(.byline.ytmusic-player-bar a)[1]', (el) => el.innerText, ''),
    cover: () => {
      let videoId = lastCoverVideoId

      let cover = querySelector<string, HTMLImageElement>('.thumbnail.ytmusic-player.no-transition .yt-img-shadow', (el) => el.src, '')
      if (cover.includes('googleusercontent')) return cover
      if (cover.includes('data:image'))
        cover = querySelector<string, HTMLImageElement>('.image.ytmusic-player-bar', (el) => el.src, '')

      videoId = cover.split('vi/')[1].split('/')[0]

      if (!videoId) {
        const v = new URLSearchParams(window.location.search).get('v')
        if (v) videoId = v
      }

      if (videoId && lastCoverVideoId !== videoId) {
        lastCoverVideoId = videoId
        const img = document.createElement('img')
        img.setAttribute('src', `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`)
        img.addEventListener('load', () => {
          if (img.height > 90)
            currentCoverUrl = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
          else
            currentCoverUrl = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`
        })
        img.addEventListener('error', () => {
          currentCoverUrl = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`
        })
      }

      return currentCoverUrl
    },
    duration: () => querySelectorReport<string, HTMLElement>('.time-info.ytmusic-player-bar', (el) => el.innerText.split(' / ')[1], '0:00', 'duration'),
    position: () => querySelectorReport<string, HTMLElement>('.time-info.ytmusic-player-bar', (el) => el.innerText.split(' / ')[0], '0:00', 'position'),
    volume: () => querySelectorReport<number, HTMLVideoElement>('video', (el) => (el.muted ? 0 : el.volume * 100), 100, 'volume'),
    rating: () => {
      const likeButtonPressed = querySelectorReport<boolean, HTMLButtonElement>('(.middle-controls-buttons yt-button-shape)[1]', (el) => el.getAttribute('aria-pressed') === 'true', false, 'rating')
      if (likeButtonPressed) return 5
      const dislikeButtonPressed = querySelectorReport<boolean, HTMLButtonElement>('.middle-controls-buttons yt-button-shape', (el) => el.getAttribute('aria-pressed') === 'true', false, 'rating')
      if (dislikeButtonPressed) return 1
      return 0
    },
    repeat: () => querySelectorReport<RepeatMode, HTMLElement>('ytmusic-player-bar', (el) => {
      const repeatMode = el.getAttribute('repeat-mode_')
      if (repeatMode === 'ALL') return RepeatMode.ALL
      if (repeatMode === 'ONE') return RepeatMode.ONE
      return RepeatMode.NONE
    }, RepeatMode.NONE, 'repeat'),
    // Youtube music doesn't do shuffling the traditional way, it just shuffles the current queue with no way of undoing it
    shuffle: () => false
  },
  events: {
    togglePlaying: () => querySelectorEventReport<HTMLButtonElement>('#play-pause-button', (el) => el.click(), 'togglePlaying'),
    next: () => querySelectorEventReport<HTMLButtonElement>('.next-button', (el) => el.click(), 'next'),
    previous: () => querySelectorEventReport<HTMLButtonElement>('.previous-button', (el) => el.click(), 'previous'),
    setPositionSeconds: null,
    setPositionPercentage: (positionPercentage: number) => {
      querySelectorEventReport<HTMLElement>('#progress-bar tp-yt-paper-progress', (el) => {
        const loc = el.getBoundingClientRect()
        const position = positionPercentage * loc.width

        el.dispatchEvent(new MouseEvent('mousedown', {
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: loc.left + position,
          clientY: loc.top + (loc.height / 2)
        }))
        el.dispatchEvent(new MouseEvent('mouseup', {
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: loc.left + position,
          clientY: loc.top + (loc.height / 2)
        }))
      }, 'setPositionPercentage')
    },
    setVolume: (volume: number) => {
      let vol = volume / 100
      querySelectorEvent<HTMLElement>('#sliderBar', (el) => {
        const loc = el.getBoundingClientRect()
        vol *= loc.width

        el.dispatchEvent(new MouseEvent('mousedown', {
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: loc.left + vol,
          clientY: loc.bottom + (loc.height / 2)
        }))
        el.dispatchEvent(new MouseEvent('mouseup', {
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: loc.left + vol,
          clientY: loc.bottom + (loc.height / 2)
        }))
      })
    },
    toggleRepeat: () => querySelectorEventReport<HTMLButtonElement>('.repeat', (el) => el.click(), 'toggleRepeat'),
    toggleShuffle: () => querySelectorEventReport<HTMLButtonElement>('.shuffle', (el) => el.click(), 'toggleShuffle'),
    toggleThumbsUp: () => querySelectorEventReport<HTMLButtonElement>('(.middle-controls-buttons button)[1]', (el) => el.click(), 'toggleThumbsUp'),
    toggleThumbsDown: () => querySelectorEventReport<HTMLButtonElement>('.middle-controls-buttons button', (el) => el.click(), 'toggleThumbsDown'),
    setRating: (rating: number) => ratingUtils.likeDislike(site, rating)
  }
}

export default site