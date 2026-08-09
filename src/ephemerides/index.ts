import { compileBundles } from './compiler'
import { updateAll } from './updater'

;(async () => {
  switch (process.argv[2]) {
    case '--ephemerides':
      await updateAll()
      break
    case '--build':
      compileBundles()
      break
    default:
      console.log('No valid argument provided. Use --ephemerides or --build.')
  }
})()
