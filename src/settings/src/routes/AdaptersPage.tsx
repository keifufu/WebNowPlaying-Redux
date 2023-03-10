import clsx from 'clsx'
import { Component, createEffect, createSignal, For, Show } from 'solid-js'
import { isVersionOutdated } from '../../../utils/misc'
import { BuiltInAdapters } from '../../../utils/settings'
import Anchor from '../components/Anchor'
import Checkbox from '../components/Checkbox'
import Hyperlink from '../components/Hyperlink'
import { useSettings } from '../hooks/useSettings'
import { useBorderColorClass, useTheme } from '../hooks/useTheme'

const Adapter: Component<{ name: string, enabled: boolean, gh: string, port: number }> = (props) => {
  const githubLink = `https://github.com/${props.gh}`
  const releasesLink = `https://github.com/${props.gh}/releases`
  const [version, setVersion] = createSignal('')
  const [isLoading, setIsLoading] = createSignal(false)
  const [isOutdated, setIsOutdated] = createSignal(false)
  const [githubError, setGithubError] = createSignal(false)
  const { settings, saveSettings } = useSettings()
  const [githubVersion, setGithubVersion] = createSignal('')
  const { theme } = useTheme()
  const borderColorClass = useBorderColorClass()

  const checkVersion = () => {
    // TODO: this is disabled until spicetify is updated
    // We will display "Latest" for now
    setVersion('Error')
    return setVersion('2.0.0')
    /* setIsLoading(true)

    getVersionFromGithub(props.gh).then((v) => {
      console.log(v)
      if (v === 'Error') return setGithubError(true)
      setGithubVersion(v)
    })

    const ws = new WebSocket(`ws://localhost:${props.port}`)
    // Timeout that wil be executed if the websocket doesn't connect within 3.5s
    const connectionTimeout = setTimeout(() => {
      setVersion('Error')
      ws.close()
      setIsLoading(false)
    }, 3500)
    ws.onopen = () => {
      // Clear the timeout if the websocket connected
      clearTimeout(connectionTimeout)
      // If the version hasn't been set after 1s of being connected, it's probably WNP for Rainmeter < 0.5.0
      setTimeout(() => {
        if (!version()) setVersion('0.0.0')
        ws.close()
        setIsLoading(false)
      }, 1000)
    }
    ws.onmessage = (e) => {
      // 'version:' is for compatibility with WNP for Rainmeter 0.5.0
      if (e.data.toLowerCase().startsWith('version:')) setVersion(e.data.split(':')[1])
      // Any WNPRedux adapter will send 'ADAPTER_VERSION <version>;WNPRLIB_REVISION <revision>' after connecting
      else if (e.data.startsWith('ADAPTER_VERSION ')) setVersion(e.data.split(' ')[1].split(';')[0])
      // It send an event that isn't version related, so it's probably WNP for Rainmeter < 0.5.0
      else setVersion('0.0.0')
    } */
  }

  createEffect(() => {
    if (version() !== '' && version() !== 'Error' && githubVersion() !== '' && !isLoading()) {
      if (isVersionOutdated(version(), githubVersion())) setIsOutdated(true)
      else setIsOutdated(false)
    }
  })

  const onChange = () => {
    saveSettings(() => ({ ...settings(), enabledBuiltInAdapters: settings().enabledBuiltInAdapters.includes(props.name) ? settings().enabledBuiltInAdapters.filter((a) => a !== props.name) : [...settings().enabledBuiltInAdapters, props.name] }), true)
  }

  return (
    <div class={`mb-2 flex w-full flex-col items-center rounded-md border border-solid ${borderColorClass()} p-2`}>
      <div class='flex w-full items-center'>
        <Checkbox onChange={onChange} checked={props.enabled} />
        <Hyperlink text={props.name} link={githubLink} />
        <Show when={!isLoading() && !version() && !githubError()}>
          <div
            class={clsx(
              'ml-auto cursor-pointer hover:underline',
              [theme() === 'dark' && 'text-cyan-500'],
              [theme() === 'light' && 'text-cyan-700'],
              [theme() === 'konami' && 'text-cyan-300']
            )}
            onClick={checkVersion}
          >
          Check Version
          </div>
        </Show>
        <Show when={isLoading()}>
          <div class='ml-auto'>...</div>
        </Show>
        <Show when={!isLoading() && version() && !isOutdated() && !githubError()}>
          <div
            class={clsx(
              'ml-auto',
              [theme() === 'dark' && version() === 'Error' && 'text-red-400'],
              [theme() === 'light' && version() === 'Error' && 'text-red-600'],
              [theme() === 'konami' && version() === 'Error' && 'text-red-400'],
              [theme() === 'dark' && version() !== 'Error' && 'text-green-400'],
              [theme() === 'light' && version() !== 'Error' && 'text-green-600'],
              [theme() === 'konami' && version() !== 'Error' && 'text-green-400']
            )}
          >
            {version() === 'Error' ? 'Not installed' : 'Latest'}
          </div>
        </Show>
        <Show when={!isLoading() && githubError()}>
          <div
            class={clsx(
              'ml-auto',
              [theme() === 'dark' && 'text-red-400'],
              [theme() === 'light' && 'text-red-600'],
              [theme() === 'konami' && 'text-red-400']
            )}
          >
          Couldn't check for updates
          </div>
        </Show>
        <Show when={!isLoading() && isOutdated()}>
          <div
            class={clsx(
              'ml-auto',
              [theme() === 'dark' && 'text-red-400'],
              [theme() === 'light' && 'text-red-600'],
              [theme() === 'konami' && 'text-red-400']
            )}
          >
            <Hyperlink text='Outdated' link={releasesLink} />
          </div>
        </Show>
      </div>
    </div>
  )
}

const CustomAdapter: Component<{ enabled: boolean, port: number }> = (props) => {
  const [confirmDelete, setConfirmDelete] = createSignal(false)
  const { settings, saveSettings } = useSettings()
  const { theme } = useTheme()
  const borderColorClass = useBorderColorClass()

  const removePort = () => {
    if (confirmDelete()) {
      saveSettings(() => ({ ...settings(), customAdapters: settings().customAdapters.filter((a) => a.port !== props.port) }), true)
    } else {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 2000)
    }
  }

  const onInput = (e: InputEvent) => {
    if (settings().customAdapters.some((a) => a.port === parseInt((e.target as HTMLInputElement).value))) return
    saveSettings(() => ({ ...settings(), customAdapters: settings().customAdapters.map((a) => (a.port === props.port ? { ...a, port: parseInt((e.target as HTMLInputElement).value || '0') } : a)) }))
  }

  const onChange = () => {
    saveSettings(() => ({ ...settings(), customAdapters: settings().customAdapters.map((a) => (a.port === props.port ? { ...a, enabled: !props.enabled } : a)) }), true)
  }

  return (
    <div class={`mb-2 flex w-full flex-col items-center rounded-md border border-solid ${borderColorClass()} p-2`}>
      <div class='flex w-full items-center'>
        <Checkbox text='Custom Adapter' bigText onChange={onChange} checked={props.enabled} />
        <input
          onInput={onInput}
          placeholder='Port'
          class={`form-input ml-2 h-6 w-14 rounded-md border border-solid ${borderColorClass()} bg-transparent px-2 text-sm focus:ring-offset-0`}
          value={props.port === 0 ? '' : props.port}
        />
        <div
          class={clsx(
            'ml-auto cursor-pointer hover:underline',
            [theme() === 'dark' && 'text-cyan-500'],
            [theme() === 'light' && 'text-cyan-700'],
            [theme() === 'konami' && 'text-cyan-300']
          )}
          onClick={removePort}
        >
          {confirmDelete() ? 'Press again to confirm' : 'Remove'}
        </div>
      </div>
    </div>
  )
}

const AdaptersPage: Component = () => {
  const { settings, saveSettings } = useSettings()
  const borderColorClass = useBorderColorClass()

  const onInputUpdateFrequency = (e: InputEvent) => {
    const updateFrequencyMs = parseInt((e.target as HTMLInputElement).value)
    if (isNaN(updateFrequencyMs)) return
    saveSettings(() => ({ ...settings(), updateFrequencyMs }))
  }

  return (
    <div class='flex h-full w-full flex-col items-center'>
      <div class='w-full overflow-y-scroll'>
        <For each={BuiltInAdapters}>
          {(adapter) => (
            <Adapter
              name={adapter.name}
              enabled={settings().enabledBuiltInAdapters.includes(adapter.name)}
              gh={adapter.gh}
              port={adapter.port}
            />
          )}
        </For>
        <For each={settings().customAdapters}>
          {(adapter) => (
            <CustomAdapter
              enabled={adapter.enabled}
              port={adapter.port}
            />
          )}
        </For>
        <div class='flex w-full justify-end pr-2'>
          <Anchor
            text='Add custom adapter'
            highlight
            onClick={() => {
              if (settings().customAdapters.find((a) => a.port === 0)) return
              saveSettings(() => ({ ...settings(), customAdapters: [...settings().customAdapters, { enabled: true, port: 0 }] }), true)
            }}
          />
        </div>
        <div class='ml-16 mt-3'>
        Want to create or submit your own adapter? Click <Hyperlink text='here' highlight link='https://github.com/keifufu/WebNowPlaying-Redux/blob/main/CreatingAdapters.md'/>!
        </div>
      </div>
      <div class='mt-auto w-full'>
        <div class={`-mx-3 w-[111%] border-t border-solid ${borderColorClass()}`} />
        <div class='flex'>
          <div class='mt-1.5'>Update Frequency (ms):</div>
          <input
            onInput={onInputUpdateFrequency}
            class={`form-input mt-2 ml-2 h-6 w-14 rounded-md border border-solid ${borderColorClass()} bg-transparent px-2 text-sm focus:ring-offset-0`}
            value={settings().updateFrequencyMs}
          />
        </div>
      </div>
    </div>
  )
}

export default AdaptersPage