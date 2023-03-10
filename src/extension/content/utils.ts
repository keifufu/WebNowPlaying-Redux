import { ContentUtils } from '../../utils/settings'
import { MediaInfo, Site, SiteInfo } from '../types'
import Applemusic from './sites/AppleMusic'
import Bandcamp from './sites/Bandcamp'
import Deezer from './sites/Deezer'
import Generic from './sites/Generic'
import Navidrome from './sites/Navidrome'
import Pandora from './sites/Pandora'
import Plex from './sites/Plex'
import Soundcloud from './sites/Soundcloud'
import Spotify from './sites/Spotify'
import Tidal from './sites/Tidal'
import Twitch from './sites/Twitch'
import Youtube from './sites/Youtube'
import YoutubeEmbed from './sites/YoutubeEmbed'
import YoutubeMusic from './sites/YoutubeMusic'

export function getCurrentSite() {
  const host = window.location.hostname
  const settings = ContentUtils.getSettings()

  // prioritize matching youtube.com/embed before youtube.com
  if (host === 'www.youtube.com' && window.location.pathname.startsWith('/embed') && !settings.disabledSites.includes('Youtube Embeds'))
    return YoutubeEmbed

  if (host === 'music.apple.com' && !settings.disabledSites.includes('Apple Music'))
    return Applemusic
  else if ((host.endsWith('bandcamp.com') || document.querySelector('[content="@bandcamp"]') !== null) && !settings.disabledSites.includes('Bandcamp'))
    return Bandcamp
  else if (host === 'www.deezer.com' && !settings.disabledSites.includes('Deezer'))
    return Deezer
  else if (document.querySelector('[content="Navidrome"]') !== null && !settings.disabledSites.includes('Navidrome'))
    return Navidrome
  else if (host === 'www.pandora.com' && !settings.disabledSites.includes('Pandora'))
    return Pandora
  else if (host === 'app.plex.tv' && !settings.disabledSites.includes('Plex'))
    return Plex
  else if (host === 'soundcloud.com' && !settings.disabledSites.includes('Soundcloud'))
    return Soundcloud
  else if (host === 'open.spotify.com' && !settings.disabledSites.includes('Spotify'))
    return Spotify
  else if (host === 'listen.tidal.com' && !settings.disabledSites.includes('Tidal'))
    return Tidal
  else if (host === 'www.twitch.tv' && !settings.disabledSites.includes('Twitch'))
    return Twitch
  else if (host === 'www.youtube.com' && !settings.disabledSites.includes('Youtube'))
    return Youtube
  else if (host === 'music.youtube.com' && !settings.disabledSites.includes('Youtube Music'))
    return YoutubeMusic

  if (settings.useGeneric) {
    if (settings.useGenericList) {
      if (settings.isListBlocked && settings.genericList.includes(host)) return null
      if (!settings.isListBlocked && !settings.genericList.includes(host)) return null
    }
    Generic.init?.()
    return Generic
  }

  return null
}

const mediaInfoCache = new Map<string, any>()
let sendFullMediaInfo = false
export const setSendFullMediaInfo = (value: boolean) => sendFullMediaInfo = value
export const getMediaInfo = (): Partial<MediaInfo> | null => {
  const site = getCurrentSite()
  const mediaInfo: Partial<MediaInfo> = {}
  let mediaInfoChanged = false

  if (!site || !site.ready()) return null

  const values: (keyof SiteInfo)[] = ['player', 'state', 'title', 'artist', 'album', 'cover', 'duration', 'position', 'volume', 'rating', 'repeat', 'shuffle']
  values.forEach((key) => {
    let value = site.info[key]?.()
    // For numbers, round it to an integer
    if (typeof value === 'number')
      value = Math.round(value)
    // Trim strings
    else if (typeof value === 'string')
      value = value.trim()
    if (value !== null && value !== undefined && mediaInfoCache.get(key) !== value) {
      (mediaInfo[key] as any) = value
      if (key === 'state' || key === 'title' || key === 'volume') {
        const timestamp = Date.now()
        mediaInfo.timestamp = timestamp
        mediaInfoCache.set('timestamp', timestamp)
      }
      mediaInfoCache.set(key, value)
      mediaInfoChanged = true
    }
  })

  if (sendFullMediaInfo) {
    sendFullMediaInfo = false
    return Object.fromEntries(mediaInfoCache)
  }

  if (mediaInfoChanged) return mediaInfo
  else return null
}

export const ratingUtils = {
  like: (site: Site, rating: number) => {
    if (rating >= 3 && site.info.rating?.() !== 5)
      site.events.toggleThumbsUp?.()
    else if (rating < 3 && site.info.rating?.() === 5)
      site.events.toggleThumbsUp?.()
  },
  likeDislike: (site: Site, rating: number) => {
    if (rating >= 3 && site.info.rating?.() !== 5)
      site.events.toggleThumbsUp?.()
    else if (rating < 3 && site.info.rating?.() !== 1)
      site.events.toggleThumbsDown?.()
  }
}