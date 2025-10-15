# Game Drop Reset Timer

A simple web application that shows countdown timers for weekly game reset schedules. Currently supports CS2 and Valorant, with dynamic Open Graph meta tags that display the countdown when shared on Discord, Slack, and other platforms.

## Features

- **Multiple Game Support**: CS2 (default) and Valorant
- **Dynamic Open Graph Tags**: When you share the link, the embed shows the current countdown
- **Real-time Countdown**: Live updating timer showing days, hours, minutes, and seconds
- **Responsive Design**: Works on mobile and desktop
- **Easy to Extend**: Add more games by updating the configuration

## Game Reset Schedules

- **CS2**: Every Wednesday at 1:00 AM GMT
- **Valorant**: Every Tuesday at 12:00 AM GMT (example - adjust as needed)

## Routes

- `/` or `/cs2` - CS2 drop reset timer (default)
- `/valorant` - Valorant reset timer

## Deployment to Cloudflare Pages

### Prerequisites

- A Cloudflare account
- Git repository (GitHub, GitLab, etc.)

### Steps

1. **Push this repository to your Git provider** (GitHub, GitLab, etc.)

2. **Create a new Cloudflare Pages project**:
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Navigate to "Workers & Pages"
   - Click "Create application" > "Pages" > "Connect to Git"
   - Select your repository

3. **Configure build settings**:
   - **Build command**: Leave empty (no build needed)
   - **Build output directory**: `/`
   - **Root directory**: `/` (or leave empty)

4. **Deploy**:
   - Click "Save and Deploy"
   - Cloudflare will automatically deploy your site

5. **Access your site**:
   - Your site will be available at `https://your-project.pages.dev`
   - You can add a custom domain in the Cloudflare Pages settings

### Testing Open Graph Tags

To test if the Open Graph tags are working:

1. Share the link on Discord or Slack
2. The embed should show: "Next reset in: Xd Xh Xm"
3. The embed updates dynamically based on the current time

### How It Works

The Cloudflare Function (`functions/[[path]].js`) intercepts all requests and:
- Calculates the next reset time based on the game schedule
- Generates dynamic Open Graph meta tags with the countdown
- Serves the HTML with the embedded countdown timer
- Updates every second on the client side

## Adding More Games

To add a new game, edit `functions/[[path]].js` and add a new entry to the `gameConfigs` object:

```javascript
const gameConfigs = {
  // ... existing games
  newgame: {
    name: 'NewGame',
    fullName: 'New Game Name',
    resetDay: 4, // Thursday (0 = Sunday, 1 = Monday, etc.)
    resetHour: 2, // 2 AM GMT
    resetMinute: 0,
    color: '#ff6b6b',
    description: 'Weekly Reset Timer'
  }
};
```

Then add a button in the HTML:

```html
<a href="/newgame" class="game-btn ${game === 'newgame' ? 'active' : ''}">NewGame</a>
```

## Local Development

Since this uses Cloudflare Functions, you should use Wrangler for local testing:

```bash
# Install Wrangler
npm install -g wrangler

# Run local dev server
wrangler pages dev .
```

Or simply open the HTML files directly in a browser (but Open Graph tags won't work locally).

## Project Structure

```
game-drop-reset/
├── functions/
│   └── [[path]].js          # Cloudflare Function for dynamic OG tags
├── public/                   # (optional) Static assets
└── README.md
```

## License

MIT

## Notes

- The countdown is calculated in GMT timezone
- When the countdown reaches zero, the page automatically reloads
- The Open Graph tags are generated server-side for each request
- Cache is set to 0 to ensure fresh countdowns in embeds
