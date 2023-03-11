import { BuiltInAdapters } from '../../utils/settings'
import { defaultMediaInfo, MediaInfo, StateMode } from '../types'
import { readSettings } from './shared'
import { WNPReduxWebSocket } from './socket'

type PortMessage = {
  event: 'mediaInfo',
  mediaInfo?: Partial<MediaInfo>
}

const caches = new Map<string, Map<string, any>>()
const sockets: WNPReduxWebSocket[] = []
const mediaInfoDictionary = new Map<string, MediaInfo>()
let mediaInfoId: string | null = null
const ports = new Map<string, chrome.runtime.Port>()
const disconnectTimeouts = new Map<string, NodeJS.Timeout>()

const updateAll = () => {
  sockets.forEach((socket) => {
    const mediaInfo = mediaInfoDictionary.get(mediaInfoId || '') || defaultMediaInfo
    socket.sendUpdate(mediaInfo)
  })
}

const executeEvent = (communicationRevision: string, mediaEventData: string) => {
  if (!mediaInfoId) return
  ports.get(mediaInfoId)?.postMessage({
    event: 'executeMediaEvent',
    communicationRevision,
    mediaEventData
  })
  ports.get(mediaInfoId)?.postMessage({ event: 'getMediaInfo' })
  updateAll()
}

const updateMediaInfo = () => {
  const sortedDictionary = new Map([...mediaInfoDictionary].sort((a, b) => b[1].timestamp - a[1].timestamp))
  let suitableMatch = false

  for (const [key, value] of sortedDictionary) {
    if (value.state === StateMode.PLAYING && value.volume !== 0) {
      mediaInfoId = key
      suitableMatch = true
      break
    }
  }

  if (!suitableMatch) {
    const fallback = sortedDictionary.size > 0 ? sortedDictionary.entries().next().value : null
    if (fallback) {
      mediaInfoId = fallback[0]
      return
    }
    mediaInfoId = null
  }
  updateAll()
}

interface Port extends chrome.runtime.Port {
  _timer: any
}

chrome.runtime.onConnect.addListener((_port) => {
  const port = _port as Port
  clearTimeout(disconnectTimeouts.get(port.name))
  disconnectTimeouts.delete(port.name)
  caches.set(port.name, new Map<string, any>())
  ports.set(port.name, port)
  port.onMessage.addListener((message) => onMessage(message, port))
  port.onDisconnect.addListener(() => {
    deleteTimer(port)
    ports.delete(port.name)
    disconnectTimeouts.set(port.name, setTimeout(() => {
      mediaInfoDictionary.delete(port.name)
      caches.delete(port.name)
      updateMediaInfo()
    }, 1000))
  })
  port._timer = setTimeout(() => {
    deleteTimer(port)
    port.disconnect()
  }, 250e3, port)
})

function onMessage(message: PortMessage, port: Port) {
  switch (message.event) {
    case 'mediaInfo': {
      const cache = caches.get(port.name)
      if (!message.mediaInfo || !cache) return

      const currentMediaInfo = mediaInfoDictionary.get(port.name) ?? defaultMediaInfo
      let timestamp = currentMediaInfo.timestamp
      for (const _key in message.mediaInfo) {
        const key = _key as keyof MediaInfo
        if (key === 'state' || key === 'title' || key === 'volume') {
          if (cache.get(key) !== message.mediaInfo[key]) {
            cache.set(key, message.mediaInfo[key])
            timestamp = Date.now()
          }
        }
      }
      mediaInfoDictionary.set(port.name, { ...currentMediaInfo, ...message.mediaInfo, timestamp })

      if (message.mediaInfo.position && message.mediaInfo.position !== cache.get('position')) {
        cache.set('position', message.mediaInfo.position)
        if (currentMediaInfo.title !== '')
          updateMediaInfo()
      }

      updateAll()
      break
    }
    default: break
  }
}

function deleteTimer(port: Port) {
  if (port._timer) {
    clearTimeout(port._timer)
    delete port._timer
  }
}

export const initPort = async () => {
  const settings = await readSettings()
  BuiltInAdapters.forEach((adapter) => {
    if (!settings.enabledBuiltInAdapters.includes(adapter.name)) return
    sockets.push(new WNPReduxWebSocket(adapter, executeEvent))
  })
  settings.customAdapters.forEach((adapter) => {
    if (!adapter.enabled || adapter.port === 0) return
    sockets.push(new WNPReduxWebSocket(adapter, executeEvent))
  })

  setInterval(() => {
    for (const port of ports.values())
      port.postMessage({ event: 'getMediaInfo' })
  }, settings.updateFrequencyMs)
}