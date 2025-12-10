chrome.commands.onCommand.addListener((command) => {
  if (command === 'open-autocomplete') {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const tab = tabs[0]
      const tabId = tab?.id

      if (!tabId || !tab.url) return

      if (
        tab.url.startsWith('chrome://') ||
        tab.url.startsWith('chrome-extension://') ||
        tab.url.startsWith('about:')
      ) {
        console.log('Cannot run on this page:', tab.url)
        return
      }

      const message = { action: 'open_popup' }

      try {
        await chrome.tabs.sendMessage(tabId, message)
      } catch {
        console.log('Injecting content script...')

        await chrome.scripting.executeScript({
          target: { tabId },
          files: ['assets/content-script.ts.js'],
        })

        await chrome.scripting.insertCSS({
          target: { tabId },
          files: ['styles.css'],
        })

        setTimeout(() => {
          chrome.tabs.sendMessage(tabId, message)
        }, 100)
      }
    })
  }
})

export {}
