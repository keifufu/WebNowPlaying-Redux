import { getRandomToken } from '../../utils/misc'
import { ContentUtils } from '../../utils/settings'
import { SiteInfo } from '../types'
import { clearMediaInfoCache, getCurrentSite, getMediaInfo } from './utils'

let port: chrome.runtime.Port
export const initPort = async () => {
  await ContentUtils.initSettings()
  const id = getRandomToken(24)
  if (getCurrentSite() !== null)
    connect(id)
}

function connect(id: string) {
  if (!chrome.runtime.id) return
  clearMediaInfoCache()
  port = chrome.runtime.connect({ name: id })
  port.onDisconnect.addListener(() => connect(id))
  port.onMessage.addListener(onMessage)
}

type PortMessage = {
  event: 'getMediaInfo' | 'executeMediaEvent',
  communicationRevision?: 'legacy' | '1',
  mediaEventData?: string,
}

function onMessage(message: PortMessage, port: chrome.runtime.Port) {
  switch (message.event) {
    case 'getMediaInfo': {
      const mediaInfo = getMediaInfo()
      if (!mediaInfo) return
      port.postMessage({
        event: 'mediaInfo',
        mediaInfo: mediaInfo
      })
      break
    }
    case 'executeMediaEvent':
      if (!message.communicationRevision || !message.mediaEventData) return
      switch (message.communicationRevision) {
        case 'legacy':
          OnMediaEventLegacy(message.mediaEventData)
          break
        case '1':
          OnMediaEventRev1(message.mediaEventData)
          break
        default: break
      }
      break
    default: break
  }
}

function OnMediaEventLegacy(message: string): keyof SiteInfo | null {
  const site = getCurrentSite()
  if (!site || !site.ready()) return null

  let updateInfo: keyof SiteInfo | null = null
  const [type, data] = message.toUpperCase().split(' ')
  switch (type) {
    case 'PLAYPAUSE': site.events.togglePlaying?.(); updateInfo = 'state'; break
    case 'NEXT': site.events.next?.(); updateInfo = 'title'; break
    case 'PREVIOUS': site.events.previous?.(); updateInfo = 'title'; break
    case 'SETPOSITION': {
      // Example string: SetPosition 34:SetProgress 0,100890207715134:
      const [positionInSeconds, positionPercentageStr] = data.split(':')
      const positionPercentage = positionPercentageStr.split('SETPROGRESS ')[1]
      site.events.setPositionSeconds?.(parseInt(positionInSeconds))
      // We replace(',', '.') because all of legacy versions didn't use InvariantCulture
      site.events.setPositionPercentage?.(parseFloat(positionPercentage.replace(',', '.')))
      updateInfo = 'position'
      break
    }
    case 'SETVOLUME': site.events.setVolume?.(parseInt(data)); updateInfo = 'volume'; break
    case 'REPEAT': site.events.toggleRepeat?.(); updateInfo = 'repeat'; break
    case 'SHUFFLE': site.events.toggleShuffle?.(); updateInfo = 'shuffle'; break
    case 'TOGGLETHUMBSUP': site.events.toggleThumbsUp?.(); updateInfo = 'rating'; break
    case 'TOGGLETHUMBSDOWN': site.events.toggleThumbsDown?.(); updateInfo = 'rating'; break
    case 'RATING': site.events.setRating?.(parseInt(data)); updateInfo = 'rating'; break
    default: break
  }

  return updateInfo
}

function OnMediaEventRev1(message: string): keyof SiteInfo | null {
  enum Events {
    TOGGLE_PLAYING,
    NEXT,
    PREVIOUS,
    SET_POSITION,
    SET_VOLUME,
    TOGGLE_REPEAT,
    TOGGLE_SHUFFLE,
    TOGGLE_THUMBS_UP,
    TOGGLE_THUMBS_DOWN,
    SET_RATING
  }

  const site = getCurrentSite()
  if (!site || !site.ready()) return null
  const [type, data] = message.split(' ')

  let updateInfo: keyof SiteInfo | null = null
  switch (Events[type as keyof typeof Events]) {
    case Events.TOGGLE_PLAYING: site.events.togglePlaying?.(); updateInfo = 'state'; break
    case Events.NEXT: site.events.next?.(); updateInfo = 'title'; break
    case Events.PREVIOUS: site.events.previous?.(); updateInfo = 'title'; break
    case Events.SET_POSITION: {
      const [positionInSeconds, positionPercentage] = data.split(':')
      site.events.setPositionSeconds?.(parseInt(positionInSeconds))
      // We still replace(',', '.') because v1.0.0 - v1.0.5 didn't use InvariantCulture
      site.events.setPositionPercentage?.(parseFloat(positionPercentage.replace(',', '.')))
      updateInfo = 'position'
      break
    }
    case Events.SET_VOLUME: site.events.setVolume?.(parseInt(data)); updateInfo = 'volume'; break
    case Events.TOGGLE_REPEAT: site.events.toggleRepeat?.(); updateInfo = 'repeat'; break
    case Events.TOGGLE_SHUFFLE: site.events.toggleShuffle?.(); updateInfo = 'shuffle'; break
    case Events.TOGGLE_THUMBS_UP: site.events.toggleThumbsUp?.(); updateInfo = 'rating'; break
    case Events.TOGGLE_THUMBS_DOWN: site.events.toggleThumbsDown?.(); updateInfo = 'rating'; break
    case Events.SET_RATING: site.events.setRating?.(parseInt(data)); updateInfo = 'rating'; break
    default: break
  }

  return updateInfo
}