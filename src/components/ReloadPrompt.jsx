import React from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import './ReloadPrompt.css'

function ReloadPrompt() {
  const swUpdateValues = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r)
    },
    onRegisterError(error) {
      console.log('SW registration error', error)
    },
  })

  if (!swUpdateValues) return null;

  // Use safer access if properties are missing in dev mode
  const [offlineReady, setOfflineReady] = swUpdateValues.offlineReady || [false, () => {}]
  const [needUpdate, setNeedUpdate] = swUpdateValues.needUpdate || [false, () => {}]
  const updateServiceWorker = swUpdateValues.updateServiceWorker

  const close = () => {
    if (setOfflineReady) setOfflineReady(false)
    if (setNeedUpdate) setNeedUpdate(false)
  }

  return (
    <div className="ReloadPrompt-container">
      { (offlineReady || needUpdate) &&
        <div className="ReloadPrompt-toast glass smooth-all">
          <div className="ReloadPrompt-message">
            { offlineReady
              ? <span>App ready to work offline</span>
              : <span>New version available, click on reload button to update.</span>
            }
          </div>
          <div className="ReloadPrompt-buttons">
            { needUpdate && <button className="ReloadPrompt-toast-button primary" onClick={() => updateServiceWorker(true)}>Reload</button> }
            <button className="ReloadPrompt-toast-button" onClick={() => close()}>Close</button>
          </div>
        </div>
      }
    </div>
  )
}

export default ReloadPrompt
