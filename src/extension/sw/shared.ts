import { getVersionFromGithub } from '../../utils/misc'
import { defaultSettings, Settings } from '../../utils/settings'

export const readSettings = (): Promise<Settings> => new Promise((resolve) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (typeof browser === 'undefined') {
    chrome.storage.sync.get({
      ...defaultSettings
    }, (items) => {
      resolve(items as Settings)
    })
  } else {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line no-undef
    browser.storage.sync.get({
      ...defaultSettings
    }).then((items: Settings) => {
      resolve(items)
    }).catch(() => {
      resolve(defaultSettings)
    })
  }
})

const ghCache: Record<string, string> = {}
export const getGithubVersion = (gh: string): Promise<string> => new Promise(async (resolve) => {
  if (ghCache[gh]) {
    resolve(ghCache[gh])
  } else {
    const version = await getVersionFromGithub(gh)
    if (version !== 'Error') ghCache[gh] = version
    resolve(version)
  }
})

export const setOutdated = () => {
  // TODO: enable this again once spicetify is updated
  // chrome.action.setBadgeText({ text: '!' })
  // chrome.action.setBadgeBackgroundColor({ color: [255, 0, 0, 255] })
  // chrome.action.setTitle({ title: 'One of the adapters is outdated. Click to check.' })
}