# Simple AI Calorie Tracker - Product Requirements Document

## Overview
A minimal web app that uses AI vision to automatically log meals and track daily calories for weight loss, eliminating the friction of manual food tracking.

## Core Problem
Existing calorie trackers are too complex, expensive, or require tedious manual entry. Users need a dead-simple way to photograph food and get accurate calorie counts instantly.

## Target Users
- People trying to lose weight who want calorie awareness
- Users frustrated with complex tracking apps
- Anyone wanting accountability without manual data entry

## Core Features

### MVP Features
1. **Photo-to-Calories**: Snap photo → AI analyzes → instant calorie estimate with food description
2. **Quick Modifiers**: Adjust portion size (small/large) or correct food type after AI analysis
3. **Daily Dashboard**: Simple card view showing today's meals with running calorie total
4. **Goal Setting**: Set daily calorie target based on weight loss goals
5. **Historical View**: Chronological past days with collapsible older entries
6. **Local Storage**: All data stored locally with export/import functionality

### Nice-to-Have (Future)
- Weekly summaries
- Simple progress charts
- Meal categorization (breakfast/lunch/dinner)
- Basic nutritional insights

## Technical Requirements

### Architecture
- **Frontend**: Vanilla HTML/CSS/JS (6-8 files max)
- **AI Service**: Gemini 2.5 Flash-Lite API for image analysis
- **Storage**: Browser localStorage with JSON export/import
- **Deployment**: Static site (no backend required)

### File Structure
```
├── index.html          # Main app interface
├── style.css           # Clean, minimal styling
├── app.js              # Core application logic
├── gemini.js           # AI API integration
├── storage.js          # Local storage management
├── utils.js            # Helper functions
├── manifest.json       # PWA configuration
└── README.md           # Setup instructions
```

### Key Technical Decisions
- **No image storage** - only analyze and discard to save space
- **Progressive Web App** - works offline, installable
- **Mobile-first design** - optimized for phone camera usage
- **Compression** - reduce image size before API calls to minimize costs

## User Flow

### Initial Setup (30 seconds)
1. Enter current weight, goal weight, timeline
2. App calculates recommended daily calories
3. Start tracking immediately

### Daily Usage (10 seconds per meal)
1. Tap "Add Meal" button
2. Take photo or select from gallery
3. Review AI analysis and adjust if needed
4. Meal automatically logged to today's card

### Quick Corrections
- Tap any logged meal to adjust portion or food type
- Simple dropdown modifiers: "Small portion", "Large portion", "Different food"

## Success Metrics
- **Speed**: Photo to logged meal in <10 seconds
- **Accuracy**: AI calorie estimates within 20% of actual (user validation)
- **Retention**: Users track meals 5+ days per week
- **Simplicity**: New users successfully log first meal within 2 minutes

## Constraints & Limitations
- **API Costs**: Target <$1/month per active user (Gemini 2.5 Flash-Lite pricing)
- **Offline**: Core viewing works offline, photo analysis requires internet
- **Accuracy**: AI estimates, not medical-grade precision
- **Data**: User responsible for their own data backup/export

## Launch Strategy
1. **Phase 1**: Build MVP with core photo→calorie flow
2. **Phase 2**: Add historical view and goal tracking
3. **Phase 3**: Polish UI and add export functionality
4. **Phase 4**: Gather user feedback and iterate

## Key Differentiators
- **Instant**: No searching food databases or manual entry
- **Free**: No subscription or premium tiers
- **Private**: All data stays on user's device
- **Simple**: One primary action - take photo, get calories
- **Fast**: Optimized for quick daily usage, not detailed nutrition analysis