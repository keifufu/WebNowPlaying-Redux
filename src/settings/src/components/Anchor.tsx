import clsx from 'clsx'
import { Component } from 'solid-js'
import { useTheme } from '../hooks/useTheme'

const Anchor: Component<{ text: string, highlight?: boolean, link?: string, onClick: (e: MouseEvent) => void, class?: string }> = (props) => {
  const { theme } = useTheme()

  return (
    <a
      // eslint-disable-next-line tailwindcss/no-custom-classname
      class={clsx(
        '-mt-0.5 cursor-pointer',
        props.class,
        [props.highlight && theme() === 'dark' && 'text-cyan-500'],
        [props.highlight && theme() === 'light' && 'text-cyan-700'],
        [props.highlight && theme() === 'konami' && 'text-cyan-300'],
      )}
      href={props.link}
      onClick={props.onClick}
    >
      {props.text}
    </a>
  )
}

export default Anchor