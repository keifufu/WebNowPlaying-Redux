import { getMediaSessionCover, timeInSecondsToString } from '../../../utils/misc'
import { RepeatMode, Site, StateMode } from '../../types'
import { querySelector, querySelectorEvent, querySelectorEventReport, querySelectorReport } from '../selectors'
import { ratingUtils } from '../utils'

// Note: keep using mediaSession as it makes it easier to implement yt shorts
const site: Site = {
  ready: () => navigator.mediaSession.metadata !== null,
  info: {
    player: () => 'YouTube',
    state: () => querySelectorReport<StateMode, HTMLVideoElement>('.html5-main-video[src]', (el) => (el.paused ? StateMode.PAUSED : StateMode.PLAYING), StateMode.PAUSED, 'state'),
    title: () => navigator.mediaSession.metadata?.title || '',
    artist: () => navigator.mediaSession.metadata?.artist || '',
    album: () => navigator.mediaSession.metadata?.album || '',
    cover: () => getMediaSessionCover(),
    duration: () => querySelectorReport<string, HTMLVideoElement>('.html5-main-video[src]', (el) => timeInSecondsToString(el.duration), '0:00', 'duration'),
    position: () => querySelectorReport<string, HTMLVideoElement>('.html5-main-video[src]', (el) => timeInSecondsToString(el.currentTime), '0:00', 'position'),
    volume: () => querySelectorReport<number, HTMLVideoElement>('.html5-main-video[src]', (el) => (el.muted ? 0 : el.volume * 100), 100, 'volume'),
    rating: () => {
      const likeButtonPressed = querySelectorReport<boolean, HTMLButtonElement>('#segmented-like-button button, #like-button button', (el) => el.getAttribute('aria-pressed') === 'true', false, 'rating')
      if (likeButtonPressed) return 5
      const dislikeButtonPressed = querySelectorReport<boolean, HTMLButtonElement>('#segmented-dislike-button button, #dislike-button button', (el) => el.getAttribute('aria-pressed') === 'true', false, 'rating')
      if (dislikeButtonPressed) return 1
      return 0
    },
    repeat: () => {
      // If the playlist loop is set to video, it sets the video to loop
      if (querySelector<boolean, HTMLVideoElement>('.html5-main-video[src]', (el) => el.loop, false)) return RepeatMode.ONE
      const playlistRepeatButtonSvgPath = querySelector<string, HTMLElement>('#playlist-action-menu path', (el) => el.getAttribute('d'), '')
      const svgPathLoopPlaylist = 'M20,14h2v5L5.84,19.02l1.77,1.77l-1.41,1.41L1.99,18l4.21-4.21l1.41,1.41l-1.82,1.82L20,17V14z M4,7l14.21-0.02l-1.82,1.82 l1.41,1.41L22.01,6l-4.21-4.21l-1.41,1.41l1.77,1.77L2,5v6h2V7z'
      if (playlistRepeatButtonSvgPath === svgPathLoopPlaylist) return RepeatMode.ALL
      return RepeatMode.NONE
    },
    shuffle: () => querySelector<boolean, HTMLButtonElement>('(#playlist-action-menu button)[1]', (el) => el.getAttribute('aria-pressed') === 'true', false)
  },
  events: {
    togglePlaying: () => querySelectorEventReport<HTMLVideoElement>('.html5-main-video[src]', (el) => (el.paused ? el.play() : el.pause()), 'togglePlaying'),
    next: () => querySelectorEventReport<HTMLButtonElement>('.ytp-next-button, #navigation-button-down button', (el) => el.click(), 'next'),
    previous: () => {
      querySelectorEventReport<HTMLVideoElement>('.html5-main-video[src]', (el) => {
        if (el.currentTime > 5) el.currentTime = 0
        // Not reporting as up button is not always present
        else querySelectorEvent<HTMLButtonElement>('.ytp-prev-button, #navigation-button-up button', (el) => el.click())
      }, 'previous')
    },
    setPositionSeconds: (positionInSeconds: number) => querySelectorEventReport<HTMLVideoElement>('.html5-main-video[src]', (el) => el.currentTime = positionInSeconds, 'setPositionSeconds'),
    setPositionPercentage: null,
    setVolume: (volume: number) => {
      querySelectorEventReport<HTMLVideoElement>('.html5-main-video[src]', (el) => {
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
      if (!success) querySelectorEventReport<HTMLVideoElement>('.html5-main-video[src]', (el) => el.loop = !el.loop, 'toggleRepeat')
    },
    toggleShuffle: () => querySelectorEvent<HTMLButtonElement>('(#playlist-action-menu button)[1]', (el) => el.click()),
    toggleThumbsUp: () => querySelectorEventReport<HTMLButtonElement>('#segmented-like-button button, #like-button button', (el) => el.click(), 'toggleThumbsUp'),
    toggleThumbsDown: () => querySelectorEventReport<HTMLButtonElement>('#segmented-dislike-button button, #dislike-button button', (el) => el.click(), 'toggleThumbsDown'),
    setRating: (rating: number) => ratingUtils.likeDislike(site, rating)
  }
}

export default site