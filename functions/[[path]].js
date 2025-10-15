// Cloudflare Function to handle dynamic Open Graph meta tags
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const path = url.pathname;

  // Determine which game based on path
  let game = 'cs2'; // default
  if (path.includes('/valorant')) {
    game = 'valorant';
  } else if (path.includes('/cs2')) {
    game = 'cs2';
  }

  // Game configurations
  const gameConfigs = {
    cs2: {
      name: 'CS2',
      fullName: 'Counter-Strike 2',
      resetDay: 3, // Wednesday (0 = Sunday, 3 = Wednesday)
      resetHour: 1, // 1 AM GMT
      resetMinute: 0,
      color: '#ce8c2c',
      description: 'Weekly Drop Reset Timer'
    },
    valorant: {
      name: 'Valorant',
      fullName: 'Valorant',
      resetDay: 2, // Tuesday (example - adjust as needed)
      resetHour: 0, // 12 AM GMT
      resetMinute: 0,
      color: '#ff4655',
      description: 'Weekly Reset Timer'
    }
  };

  const config = gameConfigs[game];

  // Calculate next reset time
  function getNextReset(resetDay, resetHour, resetMinute) {
    const now = new Date();
    const next = new Date();

    // Set to GMT timezone
    next.setUTCHours(resetHour, resetMinute, 0, 0);

    // Get current day of week (0 = Sunday)
    const currentDay = next.getUTCDay();

    // Calculate days until next reset day
    let daysUntilReset = resetDay - currentDay;

    // If reset day has passed this week, or it's today but time has passed
    if (daysUntilReset < 0 || (daysUntilReset === 0 && now >= next)) {
      daysUntilReset += 7;
    }

    next.setUTCDate(next.getUTCDate() + daysUntilReset);

    return next;
  }

  const nextReset = getNextReset(config.resetDay, config.resetHour, config.resetMinute);
  const now = new Date();
  const diff = nextReset - now;

  // Calculate time remaining
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  // Format countdown text for OG tags
  let countdownText = '';
  if (days > 0) {
    countdownText = `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    countdownText = `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    countdownText = `${minutes}m ${seconds}s`;
  } else {
    countdownText = `${seconds}s`;
  }

  const ogTitle = `${config.name} ${config.description}`;
  const ogDescription = `Next reset in: ${countdownText}`;

  // Check if request is from a bot/crawler (Discord, Slack, etc.)
  const userAgent = context.request.headers.get('user-agent') || '';
  const isBot = /bot|crawler|spider|crawling|discord|slack|twitter|facebook|whatsapp|telegram/i.test(userAgent);

  // Serve HTML with dynamic meta tags
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.name} ${config.description}</title>

    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="${ogTitle}">
    <meta property="og:description" content="${ogDescription}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${url.href}">
    <meta name="theme-color" content="${config.color}">

    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="${ogTitle}">
    <meta name="twitter:description" content="${ogDescription}">

    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: #ffffff;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .container {
            text-align: center;
            max-width: 800px;
            width: 100%;
        }

        .game-selector {
            margin-bottom: 30px;
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
        }

        .game-btn {
            padding: 10px 25px;
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            color: white;
            text-decoration: none;
            font-size: 16px;
            font-weight: 600;
            transition: all 0.3s ease;
            cursor: pointer;
        }

        .game-btn:hover {
            background: rgba(255, 255, 255, 0.2);
            border-color: rgba(255, 255, 255, 0.4);
            transform: translateY(-2px);
        }

        .game-btn.active {
            background: ${config.color};
            border-color: ${config.color};
        }

        h1 {
            font-size: clamp(2rem, 5vw, 3.5rem);
            margin-bottom: 15px;
            background: linear-gradient(45deg, ${config.color}, #ffffff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .subtitle {
            font-size: clamp(1rem, 2.5vw, 1.5rem);
            margin-bottom: 50px;
            color: rgba(255, 255, 255, 0.7);
        }

        .countdown {
            display: flex;
            gap: 20px;
            justify-content: center;
            flex-wrap: wrap;
            margin-bottom: 40px;
        }

        .time-unit {
            background: rgba(255, 255, 255, 0.05);
            border: 2px solid rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 25px 30px;
            min-width: 120px;
            backdrop-filter: blur(10px);
        }

        .time-value {
            font-size: clamp(2.5rem, 5vw, 4rem);
            font-weight: bold;
            color: ${config.color};
            line-height: 1;
        }

        .time-label {
            font-size: clamp(0.8rem, 1.5vw, 1rem);
            color: rgba(255, 255, 255, 0.6);
            margin-top: 10px;
            text-transform: uppercase;
            letter-spacing: 2px;
        }

        .reset-info {
            background: rgba(255, 255, 255, 0.05);
            border-left: 4px solid ${config.color};
            padding: 20px;
            border-radius: 8px;
            margin-top: 40px;
            text-align: left;
        }

        .reset-info p {
            margin: 10px 0;
            color: rgba(255, 255, 255, 0.8);
        }

        .reset-info strong {
            color: ${config.color};
        }

        @media (max-width: 768px) {
            .time-unit {
                min-width: 90px;
                padding: 20px 15px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="game-selector">
            <a href="/cs2" class="game-btn ${game === 'cs2' ? 'active' : ''}">CS2</a>
            <a href="/valorant" class="game-btn ${game === 'valorant' ? 'active' : ''}">Valorant</a>
        </div>

        <h1>${config.fullName}</h1>
        <p class="subtitle">${config.description}</p>

        <div class="countdown" id="countdown">
            <div class="time-unit">
                <div class="time-value" id="days">0</div>
                <div class="time-label">Days</div>
            </div>
            <div class="time-unit">
                <div class="time-value" id="hours">0</div>
                <div class="time-label">Hours</div>
            </div>
            <div class="time-unit">
                <div class="time-value" id="minutes">0</div>
                <div class="time-label">Minutes</div>
            </div>
            <div class="time-unit">
                <div class="time-value" id="seconds">0</div>
                <div class="time-label">Seconds</div>
            </div>
        </div>

        <div class="reset-info">
            <p><strong>Reset Schedule:</strong> Every ${getDayName(config.resetDay)} at ${formatTime(config.resetHour, config.resetMinute)} GMT</p>
            <p><strong>Next Reset:</strong> <span id="nextResetDate"></span></p>
        </div>
    </div>

    <script>
        const gameConfig = ${JSON.stringify(config)};

        function getDayName(day) {
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            return days[day];
        }

        function getNextReset(resetDay, resetHour, resetMinute) {
            const now = new Date();
            const next = new Date();

            next.setUTCHours(resetHour, resetMinute, 0, 0);

            const currentDay = next.getUTCDay();
            let daysUntilReset = resetDay - currentDay;

            if (daysUntilReset < 0 || (daysUntilReset === 0 && now >= next)) {
                daysUntilReset += 7;
            }

            next.setUTCDate(next.getUTCDate() + daysUntilReset);

            return next;
        }

        function updateCountdown() {
            const nextReset = getNextReset(gameConfig.resetDay, gameConfig.resetHour, gameConfig.resetMinute);
            const now = new Date();
            const diff = nextReset - now;

            if (diff <= 0) {
                location.reload();
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            document.getElementById('days').textContent = days;
            document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
            document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
            document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');

            // Update next reset date
            const options = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'UTC',
                timeZoneName: 'short'
            };
            document.getElementById('nextResetDate').textContent = nextReset.toLocaleString('en-US', options);
        }

        updateCountdown();
        setInterval(updateCountdown, 1000);
    </script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html;charset=UTF-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}

function getDayName(day) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[day];
}

function formatTime(hour, minute) {
  const h = hour.toString().padStart(2, '0');
  const m = minute.toString().padStart(2, '0');
  return `${h}:${m}`;
}
