# 🎬 Kusto Assistant Demo Video Guide

This guide will help you create a professional demo video showcasing Kusto Assistant features.

## 📊 Sample Database

**Database:** ContosoSales (help cluster)  
**Connection:** `help/ContosoSales`

**Available Tables:**
- `SalesFact` - Sales transactions
- `Products` - Product catalog
- `Customers` - Customer data
- `Dates` - Date dimension

> ⚠️ **Note:** Data is from 2007, so avoid using `ago()` functions. Use queries without date filters or reference specific dates.

---

## Video Structure (2-3 minutes)

---

### Scene 1: Introduction (10-12 seconds)

**Timeline:**

| Time | Visual | Text on Screen |
|------|--------|----------------|
| 0:00 - 0:03 | Black/dark background | **Kusto Assistant** (fade in, centered) |
| 0:03 - 0:06 | Same | Subtitle appears: *AI-Powered KQL Query Generation* |
| 0:06 - 0:10 | Transition to ADE interface | "Turn plain English into powerful KQL queries" |
| 0:10 | ADE ready | *Start typing first query...* |

**Voiceover Option (if recording audio):**
> "Writing KQL queries can be complex and time-consuming. Meet Kusto Assistant — your AI copilot that turns plain English into powerful queries."

**Music:** Subtle tech/ambient background (10-20% volume)

---

### Scene 2: Basic Autocomplete (20 seconds)

**Show:** Type a comment in ADE

**On-screen keyboard hint:** `⌘+K` (Mac) / `Alt+K` (Windows) - shows automatically for ~1.5 seconds

**Query to type:**
```
// show me the top 10 products by total sales
```

**Action:**
1. Type the query comment
2. Press `Cmd+K`
3. Show tooltip appearing with pulsing dot animation
4. Show reasoning steps expanding
5. Show query being generated with syntax highlighting

**Subtitle:** "Natural Language → KQL Query"

---

### Scene 3: Query Execution with Charts (30 seconds)

**Show:** New query

**On-screen keyboard hint:** `⌘+K`

**Query to type:**
```
// show me monthly sales as a line chart
```

**Action:**
1. Type the query comment
2. Press `Cmd+K`
3. Show the agent working (steps collapsing/expanding)
4. Show line chart appearing with animation
5. Show query results table
6. Highlight the visualization

**Subtitle:** "Execute Queries & Visualize Results"

---

### Scene 4: Different Chart Types (20 seconds)

**Quick montage of chart types**

**Query for Pie Chart:**
```
// show me sales by product category as pie chart
```

**Query for Bar Chart:**
```
// show me customer count by country as bar chart
```

**Action:**
1. Show pie chart appearing
2. Show bar chart appearing

**Subtitle:** "Line Charts • Bar Charts • Pie Charts"

---

### Scene 5: Copy to Clipboard (10 seconds)

**Show:** Completed query

**Query to type:**
```
// find all customers from Australia
```

**Action:**
1. Click "Copy to Clipboard" button
2. Show button animation (success state)
3. Paste into ADE query window
4. Run the query

**Subtitle:** "One-Click Copy & Run"

---

### Scene 6: Hebrew Language Support (15 seconds)

**Show:** Extension popup

**Action:**
1. Open extension popup
2. Go to Settings tab
3. Switch language to Hebrew
4. Show UI updating to RTL
5. Show tooltip in Hebrew

**Subtitle:** "Multi-Language Support (RTL Ready)"

---

### Scene 7: Draggable Tooltip (10 seconds)

**Show:** Tooltip interaction

**Action:**
1. Drag tooltip by header to new position
2. Show it can be repositioned anywhere on screen

**Subtitle:** "Flexible Positioning"

---

### Scene 8: Closing (10 seconds)

**Show:** Final query result

**Subtitle:**
```
Kusto Assistant
AI-Powered KQL Query Generation
```

---

## 📝 Complete Query List for Demo

| Scene | Natural Language Query | Expected Result |
|-------|----------------------|-----------------|
| 2 | `// show me the top 10 products by total sales` | Table with products & sales |
| 3 | `// show me monthly sales as a line chart` | Line chart visualization |
| 4a | `// show me sales by product category as pie chart` | Pie chart |
| 4b | `// show me customer count by country as bar chart` | Bar chart |
| 5 | `// find all customers from Australia` | Filtered customer table |
| 6 | `// הצג לי את 5 המוצרים הכי נמכרים` | Hebrew query (optional) |

### Backup Queries (if needed):

```
// show me products grouped by manufacturer
```

```
// show me average sales by customer occupation
```

```
// show me product count by color as bar chart
```

```
// show me customers by education level as pie chart
```

---

## 🎙️ Recording on Mac with Audio

### QuickTime Player (Built-in)

**Yes, you can record your voice with QuickTime!** Here's how:

1. Open **QuickTime Player**
2. Go to **File → New Screen Recording**
3. Click the dropdown arrow (▼) next to the record button
4. **Select your microphone** (Built-in Microphone or external mic)
5. Optionally enable "Show Mouse Clicks in Recording"
6. Click Record and select the area to capture
7. Press `Cmd+Control+Esc` to stop recording

> ⚠️ **Important:** QuickTime records system audio poorly. For system sounds, use an app like **BlackHole** (free) or **Loopback** (paid).

### Better Options for Mac

| Tool | Audio Support | Pros | Cons |
|------|--------------|------|------|
| **QuickTime** | Mic only | Free, built-in | No system audio |
| **OBS Studio** | Mic + System | Free, powerful | Learning curve |
| **ScreenFlow** | Mic + System | Easy, professional | Paid ($169) |
| **Loom** | Mic + System | Free tier, easy | Watermark on free |

### Recommended: OBS Studio (Free)

1. Download from [obsproject.com](https://obsproject.com)
2. Add **Display Capture** source
3. Add **Audio Input Capture** (microphone)
4. Add **Audio Output Capture** (for system sounds, needs BlackHole)
5. Click "Start Recording"

---

## 🛠️ Video Editing Tools

### For Adding Subtitles & Effects

| Tool | Price | Best For |
|------|-------|----------|
| **DaVinci Resolve** | Free | Professional editing |
| **CapCut** | Free | Quick, easy edits |
| **iMovie** | Free (Mac) | Simple projects |
| **Canva** | Free tier | Text & graphics |

### Adding Subtitles in DaVinci Resolve

1. Import your screen recording
2. Go to **Effects → Titles → Text+**
3. Drag to timeline
4. Customize font, size, position
5. Add background box for readability

### Recommended Subtitle Style

```
Font: SF Pro Display or Helvetica Neue
Size: 48-64px
Color: White
Background: Semi-transparent black (60% opacity)
Position: Bottom center, 10% from edge
```

---

## 📋 Pre-Recording Checklist

### Browser Setup
- [ ] Clear browser history/bookmarks for clean UI
- [ ] Close unnecessary tabs
- [ ] Set browser zoom to 100%
- [ ] Pin only the Kusto Assistant extension
- [ ] Hide other extensions

### Environment
- [ ] Use a sample database with interesting data
- [ ] Test all features work before recording
- [ ] Prepare your example queries in a text file
- [ ] Close notifications (Do Not Disturb mode)

### Recording Settings
- [ ] Record in **1080p (1920x1080)** or higher
- [ ] Use a clean desktop background
- [ ] Consider a cursor highlighter (e.g., Cursor Pro)
- [ ] Test microphone levels before starting

### Content Preparation
- [ ] Practice the demo flow 2-3 times
- [ ] Have your script visible (second monitor or phone)
- [ ] Prepare backup queries in case of errors

---

## 🎨 Visual Tips

### Cursor Highlighting

Make your cursor more visible:

**Mac:** Use Cursor Pro or enable Accessibility zoom
```
System Preferences → Accessibility → Zoom → Enable "Show pointer"
```

**Alternative:** Add a yellow circle effect in post-production

### Clean Desktop

```bash
# Hide desktop icons temporarily (Mac)
defaults write com.apple.finder CreateDesktop false
killall Finder

# Restore after recording
defaults write com.apple.finder CreateDesktop true
killall Finder
```

### Browser Full Screen

Press `Cmd+Shift+F` in Chrome for distraction-free mode

---

## 🎵 Background Music (Optional)

Free music sources:
- [YouTube Audio Library](https://studio.youtube.com/channel/audio)
- [Pixabay Music](https://pixabay.com/music/)
- [Bensound](https://www.bensound.com)

Keep music at 10-20% volume so voiceover is clear.

---

## 📤 Export Settings

### For YouTube/Social Media

```
Format: MP4 (H.264)
Resolution: 1920x1080 (1080p)
Frame Rate: 30fps
Audio: AAC, 48kHz
Bitrate: 10-15 Mbps
```

### File Naming

```
kusto-assistant-demo-v1.mp4
kusto-assistant-demo-final.mp4
```

---

## 🚀 Quick Start Recording (Mac)

1. **Open QuickTime Player**
2. **File → New Screen Recording**
3. **Click ▼ → Select microphone**
4. **Click Record → Select area**
5. **Do your demo**
6. **Cmd+Control+Esc to stop**
7. **File → Save**

Good luck with your video! 🎬
