chrome.commands.onCommand.addListener((command) => {
  if (command === 'open-autocomplete') {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const tab = tabs[0]
      const tabId = tab?.id

      if (!tabId || !tab.url) return

      // Skip chrome:// and other restricted URLs
      if (
        tab.url.startsWith('chrome://') ||
        tab.url.startsWith('chrome-extension://') ||
        tab.url.startsWith('about:')
      ) {
        console.log('Cannot run on this page:', tab.url)
        return
      }

      try {
        // Try to send message to content script
        await chrome.tabs.sendMessage(tabId, { action: 'open_popup' })
      } catch {
        // Content script not loaded - inject it first
        console.log('Injecting content script...')

        await chrome.scripting.executeScript({
          target: { tabId },
          files: ['assets/content-script.ts.js'],
        })

        await chrome.scripting.insertCSS({
          target: { tabId },
          files: ['styles.css'],
        })

        // Wait a moment for script to initialize, then send message
        setTimeout(() => {
          chrome.tabs.sendMessage(tabId, { action: 'open_popup' })
        }, 100)
      }
    })
  }
})

export {}
