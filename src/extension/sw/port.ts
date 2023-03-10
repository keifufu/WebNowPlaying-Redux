import { BuiltInAdapters } from '../../utils/settings'
import { defaultMediaInfo, MediaInfo, StateMode } from '../types'
import { readSettings } from './shared'
import { WNPReduxWebSocket } from './socket'

type PortMessage = {
  event: 'mediaInfo' | 'disconnect',
  mediaInfo?: Partial<MediaInfo>
}

const cache: Record<string, Record<string, any>> = {}
const sockets: WNPReduxWebSocket[] = []
const mediaInfoDictionary = new Map<string, MediaInfo>()
let mediaInfoId: string | null = null
const ports = new Map<string, chrome.runtime.Port>()

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
  const sortedDictionary = new Map([...mediaInfoDictionary.entries()].sort((a, b) => b[1].timestamp - a[1].timestamp))
  let suitableMatch = false

  for (const [key, value] of sortedDictionary.entries()) {
    if (value.state === StateMode.PLAYING && value.volume >= 1) {
      mediaInfoId = key
      suitableMatch = true
      break
    }
  }

  if (!suitableMatch) {
    const fallback = Array.from(sortedDictionary)[0]
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
  cache[port.name] = {}
  ports.set(port.name, port)
  port.onMessage.addListener((message) => onMessage(message, port))
  port.onDisconnect.addListener(() => {
    deleteTimer(port)
    ports.delete(port.name)
  })
  port._timer = setTimeout(() => {
    deleteTimer(port)
    port.disconnect()
  }, 250e3, port)
})

function onMessage(message: PortMessage, port: Port) {
  switch (message.event) {
    case 'mediaInfo': {
      if (!message.mediaInfo || !cache[port.name]) return

      let currentMediaInfo = defaultMediaInfo
      if (mediaInfoDictionary.get(port.name)) currentMediaInfo = mediaInfoDictionary.get(port.name) as MediaInfo

      let timestamp = currentMediaInfo.timestamp
      for (const _key in message.mediaInfo) {
        const key = _key as keyof MediaInfo
        if (['state', 'title', 'volume'].includes(key)) {
          if (cache[port.name][key] !== message.mediaInfo[key]) {
            cache[port.name][key] = message.mediaInfo[key]
            timestamp = Date.now()
          }
        }
      }
      mediaInfoDictionary.set(port.name, { ...currentMediaInfo, ...message.mediaInfo, timestamp })

      if (cache[port.name].position !== message.mediaInfo.position) {
        cache[port.name].position = message.mediaInfo.position
        if (currentMediaInfo.title !== '')
          updateMediaInfo()
      }

      updateAll()
      break
    }
    case 'disconnect':
      mediaInfoDictionary.delete(port.name)
      delete cache[port.name]
      updateMediaInfo()
      break
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
    Array.from(ports.entries()).forEach(([key, port]) => {
      port.postMessage({ event: 'getMediaInfo' })
    })
  }, settings.updateFrequencyMs)
}