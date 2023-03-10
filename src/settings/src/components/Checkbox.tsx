import clsx from 'clsx'
import { Component, Show } from 'solid-js'
import { useBorderColorClass, useTheme } from '../hooks/useTheme'

const Checkbox: Component<{ label?: string, children?: any, text?: string, bigText?: boolean, checked: boolean, disabled?: boolean, onChange: () => void }> = (props) => {
  const { theme } = useTheme()
  const borderColorClass = useBorderColorClass()

  return (
    <div class='flex items-center'>
      <input
        id={props.text || props.label}
        type='checkbox'
        checked={props.checked}
        onChange={props.onChange}
        disabled={props.disabled}
        class={clsx(
          `form-checkbox mr-2 h-4 w-4 rounded ${borderColorClass()} bg-transparent transition-all duration-200 ease-in-out focus:ring-offset-0`,
          [theme() === 'dark' && 'text-cyan-600'],
          [theme() === 'light' && 'text-cyan-700'],
          [theme() === 'konami' && 'text-cyan-500'],
          [props.disabled && 'opacity-50'],
          [!props.disabled && 'cursor-pointer']
        )}
      />
      <Show when={props.text}>
        <label
          for={props.text}
          class={clsx(
            '-mt-0.5',
            [!props.bigText && 'text-[0.9rem]'],
            [props.disabled && 'opacity-50'],
            [!props.disabled && 'cursor-pointer']
          )}
        >
          {props.text}
        </label>
      </Show>
      <Show when={props.children}>
        {props.children}
      </Show>
    </div>
  )
}

export default Checkbox