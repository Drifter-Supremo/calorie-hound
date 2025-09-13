# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

\### Critical Rules - DO NOT VIOLATE

\- \*\*ALWAYS start every new task with reading the CLAUDE.md

\- \*\*NEVER create mock data or simplified components\*\* unless explicitly told to do so

\- \*\*NEVER replace existing complex components with simplified versions\*\* - always fix the actual problem

\- \*\*ALWAYS work with the existing codebase\*\* - do not create new simplified alternatives

\- \*\*ALWAYS find and fix the root cause\*\* of issues instead of creating workarounds

\- When debugging issues, focus on fixing the existing implementation, not replacing it

\- When something doesn't work, debug and fix it - don't start over with a simple version

\- \*\*ALWAYS check ALL /memory-bank DOCS before making changes\*\* 

\- NEVER complete multiple tasks in a row unless told to do so ALWAYS complete 1 task at a time then stop to regroup with me.

\- ALWAYS update ALL relevant/memory-bank docs after every successful task

\### CRITICAL: SAFETY AND TESTING RULES

\- \*\*SIMPLICITY FIRST\*\* - Use the simplest approach that works. Copy-paste existing working code rather than creating new complex solutions.

\- \*\*NEVER make changes without testing\*\* - Always run npm run dev to verify the app still works after ANY change

\- \*\*COPY-PASTE APPROACH\*\* - When creating similar components, copy existing working components and modify minimally

\- \*\*ONE CHANGE AT A TIME\*\* - Make the smallest possible change, test it works, then proceed to the next

\- \*\*VERIFY IMPORTS\*\* - When adding new components, double-check all import paths and component names match exactly

\- \*\*TEST BEFORE COMPLETING\*\* - Before marking any task complete, verify the app loads and functions properly

\### TypeScript and Linting

\- ALWAYS add explicit types to all function parameters, variables, and return types

\- ALWAYS run npm build\ or whichever appropriate linter command before considering any code changes complete

\- Fix all linter and TypeScript errors immediately - don't leave them for the user to fix

\- When making changes to multiple files, check each one for type errors

## Project Overview

Simple AI Calorie Tracker - A minimal web application that uses AI vision (Gemini 2.5 Flash-Lite) to automatically log meals and track daily calories from photos. Built as a static site with vanilla HTML/CSS/JavaScript and browser localStorage.

## Architecture

### Core Components
- **Frontend Only**: Static site with no backend required
- **AI Service**: Gemini 2.5 Flash-Lite API for image analysis
- **Storage**: Browser localStorage with JSON export/import
- **Progressive Web App**: Installable and works offline for viewing

### File Structure
```
├── index.html          # Main app interface
├── style.css           # Mobile-first minimal styling
├── app.js              # Core application logic & UI management
├── gemini.js           # Gemini API integration & image analysis
├── storage.js          # localStorage management & data persistence
├── utils.js            # Helper functions & calorie calculations
├── manifest.json       # PWA configuration
└── service-worker.js   # Offline caching (if implemented)
```

## Development Commands

Since this is a vanilla JavaScript project with no build process:

### Running the Application
```bash
# Use any static file server:
python3 -m http.server 8000
# or
npx serve .
# or open index.html directly in browser for development
```

### Testing
- Manual testing in browser developer console
- Test on mobile devices using local network access
- Verify localStorage persistence in Application tab of DevTools

## Key Implementation Details

### Gemini API Integration
- Use Gemini 2.5 Flash-Lite for cost efficiency (<$1/month per user target)
- Compress images to max 800px width before API calls
- Effective prompt template: "Analyze this meal photo. Estimate total calories assuming standard serving sizes. Provide: 1) Brief food description 2) Calorie estimate 3) Confidence level."

### Data Structure
```javascript
// Daily meal log structure
{
  date: 'YYYY-MM-DD',
  meals: [
    {
      id: 'timestamp',
      description: 'Food description from AI',
      calories: 450,
      timestamp: Date.now(),
      confidence: 'high|medium|low'
    }
  ],
  totalCalories: 450
}
```

### Local Storage Keys
- `userSettings`: Current weight, goal weight, daily calorie target
- `mealLogs`: Array of daily meal logs
- `lastSync`: Timestamp of last data modification

### Mobile-First Design Principles
- Large touch targets (minimum 44x44px)
- Camera input optimized for mobile
- Responsive cards that work on all screen sizes
- Viewport meta tag for proper mobile scaling

## Development Phases

Follow the phases in `development_tasks.md`:
1. **Phase 1**: Basic HTML/CSS structure (30-45 min)
2. **Phase 2**: Core photo-to-calories functionality (60-90 min)
3. **Phase 3**: Settings & onboarding (30-45 min)
4. **Phase 4**: Historical view & polish (45-60 min)
5. **Phase 5**: Testing & deployment (30-45 min)

## API Configuration

Gemini API setup required:
1. Get API key from Google AI Studio
2. Store in `gemini.js` or use environment variable approach
3. Never commit API keys to repository

## Critical Constraints

- **No image storage**: Photos are analyzed and discarded immediately
- **Offline viewing**: Core viewing works offline, photo analysis requires internet
- **Mobile-first**: Primary usage is via phone camera
- **Performance**: Photo to logged meal must complete in <10 seconds
- **Privacy**: All user data stays in browser localStorage