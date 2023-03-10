import { getExtensionVersion } from '../../utils/misc'
import { Settings } from '../../utils/settings'
import { readSettings } from './shared'

export type ServiceWorkerMessage = {
  event: 'sendAutomaticReport' | 'resetOutdated' | 'getSettings' | 'saveSettings' | 'setColorScheme',
  settings?: Settings,
  report?: { message: string },
  colorScheme?: 'light' | 'dark'
}

let saveTimeout: NodeJS.Timeout
const reportCache = new Map<string, boolean>()
export const MessageHandler = async (request: ServiceWorkerMessage, sendResponse: (response?: any) => void) => {
  switch (request.event) {
    case 'sendAutomaticReport': {
      // We only send 'sendAutomaticReport' if telemetry is enabled, no need to check here
      if (!request.report || reportCache.get(request.report.message)) return
      reportCache.set(request.report.message, true)
      fetch('https://keifufu.dev/report', {
        method: 'POST',
        body: JSON.stringify({
          type: 'automatic',
          extVersion: getExtensionVersion(),
          message: request.report.message
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      break
    }
    case 'resetOutdated':
      chrome.action.setBadgeText({ text: '' })
      chrome.action.setTitle({ title: '' })
      break
    case 'getSettings':
      sendResponse(await readSettings())
      break
    case 'saveSettings':
      if (!request.settings) return
      clearTimeout(saveTimeout)
      saveTimeout = setTimeout(() => {
        chrome.storage.sync.set({ ...request.settings })
      }, 500)
      break
    case 'setColorScheme':
      if (!request.colorScheme) return
      chrome.action.setIcon({
        path: request.colorScheme === 'light' ? {
          128: 'icons/icon-lightmode-128.png',
          256: 'icons/icon-lightmode-256.png'
        } : {
          128: 'icons/icon-darkmode-128.png',
          256: 'icons/icon-darkmode-256.png'
        }
      })
      break
    default:
      break
  }
}