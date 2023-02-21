import { Site } from '../content'
import { timeInSecondsToString } from '../utils'

// I'm not using mediaSession here because of ads.
// Of course this isn't an issue with YouTube Premium or adblock, but still.
const site: Site = {
  ready: () => (document.querySelector<HTMLElement>('.ytd-video-primary-info-renderer.title')?.innerText.length || 0) > 0,
  info: {
    player: () => 'Youtube',
    state: () => {
      let state = document.querySelector<HTMLVideoElement>('.html5-main-video')?.paused ? 2 : 1
      // I copied this from the original, documentation says 3 isn't used, but apparently it is?
      if (document.querySelector('.ytp-play-button')?.getAttribute('aria-label') === null)
        state = 3

      // It is possible for the video to be "playing" but not started
      if (state === 1 && (document.querySelector<HTMLVideoElement>('.html5-main-video')?.played.length || 0) <= 0)
        state = 2

      return state
    },
    title: () => document.querySelector<HTMLElement>('.ytd-video-primary-info-renderer.title')?.innerText || '',
    artist: () => document.querySelector<HTMLElement>('.ytd-video-secondary-info-renderer .ytd-channel-name a')?.innerText || '',
    album: () => {
      const playlistTitle = document.querySelector<HTMLElement>('#header-description a')
      if (playlistTitle !== null) return playlistTitle.innerText

      return ''
    },
    cover: () => {
      const [videoId] = window.location.href.split('v=')[1].split('&')
      return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
    },
    duration: () => document.querySelector<HTMLElement>('.ytp-time-duration')?.innerText || '0:00',
    position: () => timeInSecondsToString(document.querySelector<HTMLVideoElement>('.html5-main-video')?.currentTime || 0),
    volume: () => document.querySelector<HTMLVideoElement>('.html5-main-video')?.volume || 0,
    rating: () => {
      const likeButtonPressed = document.querySelector('#segmented-like-button button')?.getAttribute('aria-pressed')
      const dislikeButtonPressed = document.querySelector('#segmented-dislike-button button')?.getAttribute('aria-pressed')
      if (likeButtonPressed === 'true') return 5
      if (dislikeButtonPressed === 'true') return 1
      return 0
    },
    repeat: () => {
      const playlistRepeatButtonSvgPath = document.querySelector('#playlist-action-menu path')?.getAttribute('d')
      const svgPathLoopPlaylist = 'M20,14h2v5L5.84,19.02l1.77,1.77l-1.41,1.41L1.99,18l4.21-4.21l1.41,1.41l-1.82,1.82L20,17V14z M4,7l14.21-0.02l-1.82,1.82 l1.41,1.41L22.01,6l-4.21-4.21l-1.41,1.41l1.77,1.77L2,5v6h2V7z'

      // If the playlist loop is set to video, it sets the video to loop
      if (document.querySelector<HTMLVideoElement>('.html5-main-video')?.loop)
        return 2
      if (playlistRepeatButtonSvgPath === svgPathLoopPlaylist)
        return 1
      return 0
    },
    shuffle: () => {
      // eslint-disable-next-line prefer-destructuring
      const shuffleButtonInPlaylists = document.querySelectorAll('#playlist-action-menu button')[1]
      if (shuffleButtonInPlaylists?.getAttribute('aria-pressed') === 'true')
        return 1
      return 0
    }
  },
  events: {
    playpause: () => document.querySelector<HTMLButtonElement>('.ytp-play-button')?.click(),
    next: () => document.querySelector<HTMLButtonElement>('.ytp-next-button')?.click(),
    previous: () => document.querySelector<HTMLButtonElement>('.ytp-prev-button')?.click(),
    setPositionSeconds: (positionInSeconds: number) => {
      const video = document.querySelector<HTMLVideoElement>('.html5-main-video')
      if (video) video.currentTime = positionInSeconds
    },
    setPositionPercentage: null,
    setVolume: (volume: number) => {
      const video = document.querySelector<HTMLVideoElement>('.html5-main-video')
      if (!video) return
      if (video.muted && volume > 0)
        video.muted = false
      if (volume === 0)
        video.muted = true
      video.volume = volume
    },
    repeat: () => {
      // If no playlist repeat button exists, set the video to loop, otherwise click the playlist loop button
      const playlistLoopButton = document.querySelector<HTMLButtonElement>('#playlist-action-menu button')
      if (playlistLoopButton !== null)
        return playlistLoopButton.click()

      const video = document.querySelector<HTMLVideoElement>('.html5-main-video')
      if (video) video.loop = !video.loop
    },
    shuffle: () => document.querySelectorAll<HTMLButtonElement>('#playlist-action-menu button')[1]?.click(),
    toggleThumbsUp: () => document.querySelector<HTMLButtonElement>('#segmented-like-button button')?.click(),
    toggleThumbsDown: () => document.querySelector<HTMLButtonElement>('#segmented-dislike-button button')?.click(),
    rating: (rating: number) => {
      if (rating >= 3 && site.info.rating?.() !== 5)
        site.events.toggleThumbsUp?.()
      else if (rating < 3 && site.info.rating?.() !== 1)
        site.events.toggleThumbsDown?.()
    }
  }
}

export default site