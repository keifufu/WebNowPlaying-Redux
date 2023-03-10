import { RepeatMode, Site, StateMode } from '../../types'

const site: Site = {
  ready: () => false,
  info: {
    player: () => '', // The name of the player
    state: () => StateMode.STOPPED,
    title: () => '', // The title of the current song
    artist: () => '', // The artist of the current song
    album: () => '', // The album of the current song
    cover: () => '', // A link to the cover image of the current song
    duration: () => '0:00', // The duration of the current song (mm:ss)
    position: () => '0:00', // The current position of the song (mm:ss)
    volume: () => 100, // The volume of the player (1-100)
    rating: () => 0, // The rating of the current song (1-5)
    repeat: () => RepeatMode.NONE,
    shuffle: () => false
  },
  events: {
    togglePlaying: null,
    next: null,
    previous: null,
    setPositionSeconds: null,
    setPositionPercentage: null,
    setVolume: null, // Volume is 1-100
    toggleRepeat: null,
    toggleShuffle: null,
    toggleThumbsUp: null,
    toggleThumbsDown: null,
    setRating: null
  }
}

export default site