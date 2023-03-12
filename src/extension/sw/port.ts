import { BuiltInAdapters } from '../../utils/settings'
import { defaultMediaInfo, MediaInfo, StateMode } from '../types'
import { readSettings } from './shared'
import { WNPReduxWebSocket } from './socket'

type PortMessage = {
  event: 'mediaInfo',
  mediaInfo: Partial<MediaInfo>
}

const disconnectTimeouts = new Map<string, NodeJS.Timeout>()
const mediaInfoDictionary = new Map<string, MediaInfo>()
const ports = new Map<string, chrome.runtime.Port>()
const sockets: WNPReduxWebSocket[] = []
let mediaInfoId: string | null = null

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
    if (fallback)
      mediaInfoId = fallback[0]
    else
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
  ports.set(port.name, port)
  port.onMessage.addListener((message) => onMessage(message, port))
  port.onDisconnect.addListener(() => {
    // This only gets fired if the other side disconnects, not if we disconnect from here.
    deleteTimer(port)
    ports.delete(port.name)
    // It should reconnect immediately, 500ms is more than enough.
    disconnectTimeouts.set(port.name, setTimeout(() => {
      mediaInfoDictionary.delete(port.name)
      updateMediaInfo()
    }, 500))
  })
  port._timer = setTimeout(() => {
    deleteTimer(port)
    ports.delete(port.name)
    port.disconnect()
  }, 250e3, port)
})

function onMessage(message: PortMessage, port: Port) {
  switch (message.event) {
    case 'mediaInfo': {
      const currentMediaInfo = mediaInfoDictionary.get(port.name) ?? defaultMediaInfo
      mediaInfoDictionary.set(port.name, { ...currentMediaInfo, ...message.mediaInfo })

      if (message.mediaInfo?.position && currentMediaInfo.title !== '')
        updateMediaInfo()

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
  }, settings.updateFrequencyMs2)
}