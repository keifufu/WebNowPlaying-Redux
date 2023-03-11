import { timeInSecondsToString } from '../../../utils/misc'
import { RepeatMode, Site, StateMode } from '../../types'
import { querySelector, querySelectorEvent, querySelectorEventReport, querySelectorReport } from '../selectors'
import { ratingUtils } from '../utils'

// TODO: support the tiny player it sometimes gives you in the bottom right corner

let currentCoverUrl = ''
let lastCoverVideoId = ''

// I'm not using mediaSession here because of ads.
// Of course this isn't an issue with YouTube Premium or adblock, but still.
const site: Site = {
  ready: () => querySelector<boolean, HTMLElement>('.ytd-video-primary-info-renderer.title', (el) => el.innerText.length > 0, false),
  info: {
    player: () => 'YouTube',
    state: () => {
      let state = querySelectorReport<StateMode, HTMLVideoElement>('.html5-main-video', (el) => (el.paused ? StateMode.PAUSED : StateMode.PLAYING), StateMode.PAUSED, 'state')
      // It is possible for the video to be "playing" but not started
      if (state === StateMode.PLAYING && querySelector<boolean, HTMLVideoElement>('.html5-main-video', (el) => el.played.length <= 0, false))
        state = StateMode.PAUSED
      return state
    },
    title: () => querySelectorReport<string, HTMLElement>('.ytd-video-primary-info-renderer.title', (el) => el.innerText, '', 'title'),
    artist: () => querySelectorReport<string, HTMLElement>('.ytd-video-secondary-info-renderer .ytd-channel-name a', (el) => el.innerText, '', 'artist'),
    album: () => querySelector<string, HTMLElement>('#header-description a', (el) => el.innerText, ''),
    cover: () => {
      const videoId = new URLSearchParams(window.location.search).get('v')

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
    duration: () => querySelectorReport<string, HTMLVideoElement>('.html5-main-video', (el) => timeInSecondsToString(el.duration), '0:00', 'duration'),
    position: () => querySelectorReport<string, HTMLVideoElement>('.html5-main-video', (el) => timeInSecondsToString(el.currentTime), '0:00', 'position'),
    volume: () => querySelectorReport<number, HTMLVideoElement>('.html5-main-video', (el) => (el.muted ? 0 : el.volume * 100), 100, 'volume'),
    rating: () => {
      const likeButtonPressed = querySelectorReport<boolean, HTMLButtonElement>('#segmented-like-button button', (el) => el.getAttribute('aria-pressed') === 'true', false, 'rating')
      if (likeButtonPressed) return 5
      const dislikeButtonPressed = querySelectorReport<boolean, HTMLButtonElement>('#segmented-dislike-button button', (el) => el.getAttribute('aria-pressed') === 'true', false, 'rating')
      if (dislikeButtonPressed) return 1
      return 0
    },
    repeat: () => {
      // If the playlist loop is set to video, it sets the video to loop
      if (querySelector<boolean, HTMLVideoElement>('.html5-main-video', (el) => el.loop, false)) return RepeatMode.ONE
      const playlistRepeatButtonSvgPath = querySelector<string, HTMLElement>('#playlist-action-menu path', (el) => el.getAttribute('d'), '')
      const svgPathLoopPlaylist = 'M20,14h2v5L5.84,19.02l1.77,1.77l-1.41,1.41L1.99,18l4.21-4.21l1.41,1.41l-1.82,1.82L20,17V14z M4,7l14.21-0.02l-1.82,1.82 l1.41,1.41L22.01,6l-4.21-4.21l-1.41,1.41l1.77,1.77L2,5v6h2V7z'
      if (playlistRepeatButtonSvgPath === svgPathLoopPlaylist) return RepeatMode.ALL
      return RepeatMode.NONE
    },
    shuffle: () => querySelector<boolean, HTMLButtonElement>('(#playlist-action-menu button)[1]', (el) => el.getAttribute('aria-pressed') === 'true', false)
  },
  events: {
    togglePlaying: () => querySelectorEventReport<HTMLButtonElement>('.ytp-play-button', (el) => el.click(), 'togglePlaying'),
    next: () => querySelectorEventReport<HTMLButtonElement>('.ytp-next-button', (el) => el.click(), 'next'),
    previous: () => {
      querySelectorEventReport<HTMLVideoElement>('.html5-main-video', (el) => {
        if (el.currentTime > 5) el.currentTime = 0
        else querySelectorEventReport<HTMLButtonElement>('.ytp-prev-button', (el) => el.click(), 'previous')
      }, 'previous')
    },
    setPositionSeconds: (positionInSeconds: number) => querySelectorEventReport<HTMLVideoElement>('.html5-main-video', (el) => el.currentTime = positionInSeconds, 'setPositionSeconds'),
    setPositionPercentage: null,
    setVolume: (volume: number) => {
      querySelectorEventReport<HTMLVideoElement>('.html5-main-video', (el) => {
        el.volume = volume / 100
        if (volume === 0) el.muted = true
        else el.muted = false
      }, 'setVolume')
    },
    toggleRepeat: () => {
      // If no playlist repeat button exists, set the video to loop, otherwise click the playlist loop button
      // The playlist buttons remain after switching to a regular video, so we check if there is a playlist in the URI
      const list = new URLSearchParams(window.location.search).get('list')
      let success = false
      if (list) success = querySelectorEvent<HTMLButtonElement>('#playlist-action-menu button', (el) => el.click())
      if (!success) querySelectorEventReport<HTMLVideoElement>('.html5-main-video', (el) => el.loop = !el.loop, 'toggleRepeat')
    },
    toggleShuffle: () => querySelectorEvent<HTMLButtonElement>('(#playlist-action-menu button)[1]', (el) => el.click()),
    toggleThumbsUp: () => querySelectorEventReport<HTMLButtonElement>('#segmented-like-button button', (el) => el.click(), 'toggleThumbsUp'),
    toggleThumbsDown: () => querySelectorEventReport<HTMLButtonElement>('#segmented-dislike-button button', (el) => el.click(), 'toggleThumbsDown'),
    setRating: (rating: number) => ratingUtils.likeDislike(site, rating)
  }
}

export default site