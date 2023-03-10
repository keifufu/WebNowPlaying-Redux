import { ServiceWorkerUtils } from './sw'

export type CustomAdapter = {
  port: number
  enabled: boolean
}

export type TSupportedSites = 'Apple Music' | 'Bandcamp' | 'Deezer' | 'Navidrome' | 'Pandora' | 'Plex' | 'Soundcloud' | 'Spotify' | 'Tidal' | 'Twitch' | 'Youtube' | 'Youtube Embeds' | 'Youtube Music'
export const SupportedSites: TSupportedSites[] = ['Apple Music', 'Bandcamp', 'Deezer', 'Navidrome', 'Pandora', 'Plex', 'Soundcloud', 'Spotify', 'Tidal', 'Twitch', 'Youtube', 'Youtube Embeds', 'Youtube Music']

export type Settings = {
  updateFrequencyMs: number
  useGeneric: boolean
  useGenericList: boolean
  isListBlocked: boolean
  genericList: string[]
  customAdapters: CustomAdapter[]
  enabledBuiltInAdapters: string[]
  disabledSites: TSupportedSites[]
  useTelemetry: boolean
}

export const defaultSettings: Settings = {
  updateFrequencyMs: 250,
  useGeneric: false,
  useGenericList: false,
  isListBlocked: false,
  genericList: ['streamable.com', 'www.adultswim.com'],
  customAdapters: [],
  enabledBuiltInAdapters: ['Rainmeter Adapter'],
  disabledSites: [],
  useTelemetry: false
}

export type Adapter = {
  name: string,
  port: number,
  gh: string,
  authors: {
    name: string,
    link: string
  }[]
}

export const BuiltInAdapters: Adapter[] = [
  {
    name: 'Rainmeter Adapter',
    port: 8974,
    gh: 'keifufu/WebNowPlaying-Redux-Rainmeter',
    authors: [
      {
        name: 'keifufu',
        link: 'https://github.com/keifufu'
      },
      {
        name: 'tjhrulz',
        link: 'https://github.com/tjhrulz'
      }
    ]
  },
  {
    name: 'Macro Deck Adapter',
    port: 8698,
    gh: 'jbcarreon123/WebNowPlaying-Redux-Macro-Deck',
    authors: [
      {
        name: 'jbcarreon123',
        link: 'https://github.com/jbcarreon123'
      }
    ]
  }
]

// This is for use in any file that ends up compiled into content.js
// as instead of constantly requesting the settings from the service
// worker, we just store it in a variable
let _settings = defaultSettings
export const ContentUtils = {
  initSettings: async () => {
    _settings = await ServiceWorkerUtils.getSettings()
  },
  getSettings: () => _settings
}