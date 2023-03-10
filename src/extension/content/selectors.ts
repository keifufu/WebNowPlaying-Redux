import { ServiceWorkerUtils } from '../../utils/sw'

const parseSelector = (_selector: string) => {
  let selector = _selector
  let index = 0
  if (_selector.startsWith('(')) {
    selector = _selector.substring(1, _selector.indexOf(')'))
    index = parseInt(_selector.substring(_selector.indexOf(')') + 2, _selector.length - 1))
  }
  return { selector, index }
}

type InfoType = 'state' | 'title' | 'artist' | 'album' | 'cover' | 'duration' | 'position' | 'volume' | 'rating' | 'repeat' | 'shuffle'
// Selector is either a normal selector, or: '(selector)[index]' for querySelectorAll
const _querySelector = <T, E extends Element>(selectorStr: string, exec: (el: E) => T | null, defaultValue: T, type?: InfoType): T => {
  try {
    const { selector, index } = parseSelector(selectorStr)
    const el = document.querySelectorAll<E>(selector)[index]
    if (!el) {
      if (type) {
        ServiceWorkerUtils.sendAutomaticReport({
          message: `[${document.location.hostname}] _querySelector could not find element for ${type}`
        })
      }
      return defaultValue
    }
    const result = exec(el)
    // Exclude 0 as volume can be 0
    // Exclude false as shuffle can be false
    // Empty strings however are not valid
    if (!result && result !== 0 && result !== false) {
      if (type) {
        ServiceWorkerUtils.sendAutomaticReport({
          message: `[${document.location.hostname}] _querySelector could not get result from exec for ${type}`
        })
      }
      return defaultValue
    }

    return result
  } catch {
    return defaultValue
  }
}
export const querySelector = <T, E extends Element>(selector: string, exec: (el: E) => T | null, defaultValue: T): T => _querySelector(selector, exec, defaultValue)
export const querySelectorReport = <T, E extends Element>(selector: string, exec: (el: E) => T | null, defaultValue: T, type: InfoType): T => _querySelector(selector, exec, defaultValue, type)

type EventType = 'togglePlaying' | 'next' | 'previous' | 'setPositionSeconds' | 'setPositionPercentage' | 'setVolume' | 'toggleRepeat' | 'toggleShuffle' | 'toggleThumbsUp' | 'toggleThumbsDown' | 'setRating'
export const _querySelectorEvent = <E extends Element>(selectorOrGetter: string | (() => E), action: (el: E) => any, type?: EventType): boolean => {
  try {
    let el
    if (typeof selectorOrGetter === 'string') {
      const { selector, index } = parseSelector(selectorOrGetter)
      el = document.querySelectorAll<E>(selector)[index]
    } else {
      el = selectorOrGetter()
    }
    if (!el) {
      if (type) {
        ServiceWorkerUtils.sendAutomaticReport({
          message: `[${document.location.hostname}] _querySelectorEvent could not find element for ${type}`
        })
      }
      return false
    }
    action(el)
    return true
  } catch {
    return false
  }
}
export const querySelectorEvent = <E extends Element>(selectorOrGetter: string | (() => E), action: (el: E) => any) => _querySelectorEvent(selectorOrGetter, action)
export const querySelectorEventReport = <E extends Element>(selectorOrGetter: string | (() => E), action: (el: E) => any, type: EventType) => _querySelectorEvent(selectorOrGetter, action, type)