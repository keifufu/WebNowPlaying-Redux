export const getMediaSessionCover = () => {
  // Find biggest album art
  if (!navigator.mediaSession.metadata?.artwork)
    return ''
  const [biggestImage] = Array.from(navigator.mediaSession.metadata.artwork).sort((a, b) => {
    const aSize = parseInt(a.sizes?.split('x')[1] || '0')
    const bSize = parseInt(b.sizes?.split('x')[1] || '0')

    return bSize - aSize
  })

  // Never remove the search from the url again
  return biggestImage.src
}

// Converts every word in a string to start with a capital letter
export const capitalize = (str: string) => str.toLowerCase().replace(/(?:^|\s)\S/g, (a) => a.toUpperCase())

// Convert seconds to a time string acceptable to Rainmeter
const pad = (num: number, size: number) => num.toString().padStart(size, '0')
export const timeInSecondsToString = (timeInSeconds: number) => {
  if (isNaN(timeInSeconds)) return '0:00'
  const timeInMinutes = Math.floor(timeInSeconds / 60)
  if (timeInMinutes < 60)
    return timeInMinutes + ':' + pad(Math.floor(timeInSeconds % 60), 2)

  return Math.floor(timeInMinutes / 60) + ':' + pad(Math.floor(timeInMinutes % 60), 2) + ':' + pad(Math.floor(timeInSeconds % 60), 2)
}

export const isVersionOutdated = (currentVersion: string, latestVersion: string) => {
  // The version is major.minor.patch, compare version against what the extension knows is the latest version
  // C# actually gives us a version with 4 numbers, but this just ignores the last one
  const [major, minor, patch] = latestVersion.split('.').map((v) => parseInt(v))
  const [major2, minor2, patch2] = currentVersion.split('.').map((v) => parseInt(v))
  if (major2 < major || (major2 === major && minor2 < minor) || (major2 === major && minor2 === minor && patch2 < patch))
    return true
  else
    return false
}

export const getVersionFromGithub = async (gh: string) => {
  try {
    const releaseApiLink = `https://api.github.com/repos/${gh}/releases?per_page=1`
    const response = await fetch(releaseApiLink)
    if (response.ok) {
      const json = await response.json()
      let tag = json[0].tag_name
      if (!tag) return 'Error'
      if (tag.startsWith('v')) tag = tag.slice(1)
      return tag
    }
    return 'Error'
  } catch {
    return 'Error'
  }
}

export const getExtensionVersion = () => {
  if (typeof chrome !== 'undefined' && typeof chrome.runtime?.getManifest === 'function') return chrome.runtime.getManifest().version
  else return '0.0.0'
}

export const getRandomToken = (length = 24) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++)
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  return result
}