import { MessageHandler } from './messaging'
import { initPort } from './port'

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  MessageHandler(message, sendResponse)
  return true
})
initPort()