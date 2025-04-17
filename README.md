<p align="center"><img height="150" alt="Memi Chat Logo" src="https://github.com/user-attachments/assets/6afd4951-ae60-4f81-a664-1284927dbe22" /></p>
<p align="center">
  <strong>Memi Chat - Free AI Chat</strong><br />
  Prototype (Rough Version)<br />  
</p>

> _Memi_ is short for _Memini_ — _“Remember”_ in Latin.
<table border="0">
  <tr>
    <td>
      <img src="/images/sr.gif" alt="Memi Chat Demo" height="450" />
    </td>
    <td>
      <img src="/images/ss3.jpg" alt="Memi Chat Screenshot" height="450" />
    </td>
   <td>
      <img src="/images/ss1.jpg" alt="Memi Chat Screenshot" height="450" />
    </td>
  </tr>
</table>


## Description

Memi Chat is a free AI chat app built with Expo React Native. This prototype supports:

- **Multi-conversation support**: Juggle multiple chat threads seamlessly.
- **Memory feature**: Retain context and recall past conversations.
- **Group chat**: Chatting with multiple AI's at the same time.
- **Image generation**: On-demand AI-powered visuals.
- **Image analysis**: Analyze images for content.
- **Video analysis**: Extract insights and summarize video content up to 20MB.
- **Video analysis**: Document analysis up to 20MB.
- **Youtube Videos**: Chat about any Youtube video.

> 🚧 This is an early, rough prototype.

## Architecture

- **Frontend**: Expo (React Native)
- **Backend**: Hono.js running on Cloudflare Workers
- **Storage & Caching**: Postgres, KV, Hyperdrive

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/MemiChat/memi-chat.git
   cd memi-chat
   ```
2. **Install dependencies**
   ```bash
   cd server
   cd ios-android
   npm install
   ```
3. **Run the server**
   ```bash
   npm run dev
   ```
4. **Run the app**
   ```bash
   expo start
   ```

## Environment Variables

Check .env.example file in the each project root

## TODO

- Google and Apple Sign-In
- Show memory-updated indicator on chat
- Fix agents ordering logic
- File upload preview & loading indicator
- New chat avatar animation (smile & blink)
- Group chat: maintain both contact & user memory
- Group chat: add images, documents, live AI avatars
- Threaded replies & message branching
- Fade-in/blur animation for streaming text
- Integrate Google Gemini API grounding
- Image download button
- Scroll-to-bottom button above input
- Persist uploaded documents across messages
- Auto-create agents per user on signup
- Live multi-modal conversations
- User-set reminders (e.g., morning notifications)
- Offline AI auto-responses in group chats
- Source map upload fixes
- Microsoft Clarity integration
- CI/CD pipeline setup

### Chat Optimization

- Lazy-loading / pagination for chat history

## Tools & Resources

- [SVGR (React Native)](https://react-svgr.com/playground/?native=true)
- [Tabler Icons](https://tabler.io/icons)
- [Expo Icons](https://icons.expo.fyi/Index)
