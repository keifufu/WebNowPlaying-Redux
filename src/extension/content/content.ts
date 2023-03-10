import { ServiceWorkerUtils } from '../../utils/sw'
import { initPort } from './port'

initPort()
matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
  if (e.matches) ServiceWorkerUtils.setColorScheme('light')
  else ServiceWorkerUtils.setColorScheme('dark')
})