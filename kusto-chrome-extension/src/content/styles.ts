export const tooltipStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid #E5E7EB;
    border-top-color: #4F46E5;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    flex-shrink: 0;
  }
  .step-item {
    padding: 8px 0;
    border-bottom: 1px solid #f0f0f0;
  }
  .step-item:last-child {
    border-bottom: none;
  }
  .step-header {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-weight: 500;
    color: #333;
    font-size: 13px;
  }
  .step-icon {
    flex-shrink: 0;
    width: 20px;
    text-align: center;
  }
  .step-content {
    flex: 1;
    min-width: 0;
  }
  .step-title {
    font-weight: 600;
    margin-bottom: 2px;
  }
  .step-desc {
    font-size: 12px;
    color: #666;
    word-wrap: break-word;
  }
  .step-data {
    margin-top: 6px;
    padding: 8px;
    background: #1e1e1e;
    border-radius: 4px;
    font-family: monospace;
    font-size: 11px;
    color: #9cdcfe;
    overflow-x: auto;
    max-height: 100px;
    white-space: pre-wrap;
    word-break: break-all;
  }
  .steps-toggle {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background: #1e1e1e;
    color: #fff;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    margin-bottom: 8px;
  }
  .steps-toggle:hover {
    background: #2d2d2d;
  }
  .steps-container {
    max-height: 300px;
    overflow-y: auto;
    background: #fafafa;
    border-radius: 6px;
    padding: 4px 12px;
    margin-bottom: 8px;
    display: none;
  }
  .steps-container.expanded {
    display: block;
  }
`

export function getUnhealthyTooltipHTML(message: string, dockerCommand: string): string {
  return `
    <style>${tooltipStyles}</style>
    <div style="margin-bottom: 10px; font-weight: 600; color: #333;">
      🤖 Assistant
    </div>
    <div style="
      padding: 12px;
      background: #FEF2F2;
      border: 1px solid #FECACA;
      border-radius: 6px;
      margin-bottom: 12px;
    ">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <span style="font-size: 18px;">⚠️</span>
        <span style="font-weight: 600; color: #DC2626;">Server Not Available</span>
      </div>
      <p style="color: #7F1D1D; font-size: 13px; margin: 0;">${message}</p>
    </div>
    <div style="
      padding: 12px;
      background: #F9FAFB;
      border: 1px solid #E5E7EB;
      border-radius: 6px;
      margin-bottom: 12px;
    ">
      <p style="font-size: 13px; color: #374151; margin: 0 0 8px 0;">Start the backend server with Docker:</p>
      <div style="
        display: flex;
        align-items: center;
        background: #1F2937;
        border-radius: 4px;
        padding: 8px 10px;
        gap: 8px;
      ">
        <code style="
          flex: 1;
          font-family: 'SF Mono', Monaco, monospace;
          font-size: 11px;
          color: #10B981;
          word-break: break-all;
        ">${dockerCommand}</code>
        <button id="copy-docker-btn" style="
          background: transparent;
          border: none;
          color: #9CA3AF;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        " title="Copy to clipboard">
          📋
        </button>
      </div>
    </div>
    <button id="retry-btn" style="
      width: 100%;
      padding: 10px;
      background: #4F46E5;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    ">
      🔄 Retry Connection
    </button>
    <button id="close-btn" style="
      width: 100%;
      padding: 8px;
      background: transparent;
      color: #666;
      border: 1px solid #ddd;
      border-radius: 6px;
      cursor: pointer;
    ">
      ✕ Close
    </button>
  `
}

export function getTooltipHTML(): string {
  return `
    <style>${tooltipStyles}</style>
    <div style="margin-bottom: 10px; font-weight: 600; color: #333;">
      🤖 Assistant
    </div>
    <div id="assistant-status" style="
      padding: 8px 12px;
      background: #EEF2FF;
      border-radius: 6px;
      margin-bottom: 8px;
      color: #4F46E5;
      font-size: 13px;
      display: flex;
      align-items: flex-start;
      gap: 10px;
      max-width: 100%;
      box-sizing: border-box;
    ">
      <div class="spinner"></div>
      <span id="status-text" style="
        word-wrap: break-word;
        overflow-wrap: break-word;
        word-break: break-word;
        flex: 1;
        min-width: 0;
      ">Connecting...</span>
    </div>
    <div id="assistant-result" style="
      padding: 10px;
      background: #f7f7f7;
      border-radius: 6px;
      min-height: 40px;
      max-height: 200px;
      overflow-y: auto;
      color: #555;
      white-space: pre-wrap;
      display: none;
    "></div>
    <div id="steps-section" style="display: none; margin-top: 12px;">
      <div id="steps-toggle" class="steps-toggle">
        <span id="steps-arrow">▶</span>
        <span id="steps-summary">Reasoned in 0 steps</span>
        <span style="margin-left: auto; font-size: 11px; color: #888;" id="expand-text">expand</span>
      </div>
      <div id="steps-container" class="steps-container"></div>
    </div>
    <div id="button-row" style="
      display: none;
      margin-top: 12px;
      gap: 8px;
    ">
      <button id="copy-btn" style="
        flex: 1;
        padding: 10px;
        background: #10B981;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        transition: background 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      ">
        📋 Copy to Clipboard
      </button>
    </div>
    <button id="close-btn" style="
      margin-top: 8px;
      width: 100%;
      padding: 8px;
      background: transparent;
      color: #666;
      border: 1px solid #ddd;
      border-radius: 6px;
      cursor: pointer;
    ">
      ✕ Close
    </button>
  `
}
