import clsx from 'clsx'
import { Component, createSignal, Show } from 'solid-js'
import { getExtensionVersion } from '../../../utils/misc'
import Checkbox from '../components/Checkbox'
import Hyperlink from '../components/Hyperlink'
import { useSettings } from '../hooks/useSettings'
import { useBorderColorClass, useTheme } from '../hooks/useTheme'

const ReportIssuesPage: Component = () => {
  const { settings, saveSettings } = useSettings()
  const [text, setText] = createSignal('')
  const [submittingState, setSubmittingState] = createSignal<'none' | 'loading' | 'sent' | 'error'>('none')
  const { theme } = useTheme()
  const borderColorClass = useBorderColorClass()

  const onChange = () => {
    saveSettings(() => ({ ...settings(), useTelemetry: !settings().useTelemetry }), true)
  }

  const onInput = (e: InputEvent) => {
    setText((e.target as HTMLTextAreaElement).value)
  }

  const sendReport = () => {
    if (!text()) return
    setSubmittingState('loading')
    const data = {
      type: 'manual',
      message: text(),
      extVersion: getExtensionVersion()
    }
    fetch('https://keifufu.dev/report', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((e) => {
      if (e?.status === 200) setSubmittingState('sent')
      else setSubmittingState('error')
    }).catch(() => {
      setSubmittingState('error')
    })
  }

  return (
    <div class='ml-1 flex h-full w-full flex-col'>
      <div>
        Fill out the form below or open an issue on <Hyperlink highlight text='GitHub' link='https://github.com/keifufu/WebNowPlaying-Redux/issues' />.
      </div>
      <textarea
        value={text()}
        placeholder='Describe the issue here...\nAdd your discord tag if you want to hear back from us.'
        disabled={submittingState() !== 'none' && submittingState() !== 'error'}
        onInput={onInput}
        class={clsx(
          `mt-2 mb-1 h-full w-full resize-none rounded-md border border-solid ${borderColorClass()} bg-transparent p-2`,
          [submittingState() !== 'none' && submittingState() !== 'error' && 'opacity-50'],
          [theme() === 'konami' && 'placeholder:text-gray-400']
        )}
      />
      <button
        disabled={!text() || (submittingState() !== 'none' && submittingState() !== 'error')}
        class={clsx(
          `fixed top-[12.5rem] right-[1.6rem] rounded-md border border-solid ${borderColorClass()} bg-transparent p-2`,
          [(!text() || (submittingState() !== 'none' && submittingState() !== 'error')) && 'opacity-50']
        )}
        onClick={sendReport}
      >
        <Show when={submittingState() === 'none'}>
          Submit Report
        </Show>
        <Show when={submittingState() === 'loading'}>
          Loading...
        </Show>
        <Show when={submittingState() === 'sent'}>
          Sent Report!
        </Show>
        <Show when={submittingState() === 'error'}>
          Failed to send report. Retry?
        </Show>
      </button>
      <div class={`-mx-3 my-2 w-[111%] border-t border-solid ${borderColorClass()}`} />
      <Checkbox text='Automatically report when sites appear broken' checked={settings().useTelemetry} onChange={onChange} />
      <div class={clsx(
        'mt-2 text-sm text-gray-500',
        [theme() === 'konami' && 'text-gray-300']
      )}>
        This will help us improve the extension by sending information about sites that appear to not be working properly. This information will be sent anonymously and will not contain any personal information.
        <br />
        <br />
        The following information will be sent: What data type failed ("artist", "title", etc), the site ("YouTube", "Spotify", etc), and extension version
      </div>
    </div>
  )
}

export default ReportIssuesPage