# Simple AI Calorie Tracker - Development Tasks

## Phase 1: Core Setup & Structure (30-45 min)

### Task 1: Project Setup
- [x] Create project folder structure
- [x] Create `index.html` with basic HTML5 boilerplate
- [x] Add viewport meta tag for mobile responsiveness
- [x] Create empty `style.css`, `app.js`, `gemini.js`, `storage.js`, `utils.js`
- [x] Link all files in index.html

### Task 2: Basic HTML Structure
- [x] Add main container div
- [x] Create header with app title and daily calorie counter
- [x] Add "Add Meal" button (large, prominent)
- [x] Create hidden camera input element
- [x] Add empty meals container for today's meals
- [x] Create simple modal/overlay for photo capture
- [x] Add settings button in header

### Task 3: Basic CSS Styling
- [x] Mobile-first responsive design
- [x] Simple card styling for meals
- [x] Large, accessible button styling
- [x] Clean, minimal color scheme (blue theme for professional look)
- [x] Basic modal/overlay styling
- [x] Ensure text is readable on all screen sizes

## Phase 2: Core Functionality (60-90 min)

### Task 4: Local Storage System
**File: `storage.js`**
- [x] Create functions to save/load user settings (weight, goal, daily calorie target)
- [x] Create functions to save/load daily meal logs
- [x] Implement data structure: `{ date: 'YYYY-MM-DD', meals: [], totalCalories: 0 }`
- [x] Add export/import JSON functionality
- [x] Test data persistence across browser sessions

### Task 5: Gemini API Integration
**File: `gemini.js`**
- [x] Set up Gemini 2.5 Flash-Lite API connection
- [x] Create image compression function (resize to max 800px width)
- [x] Write effective prompt for calorie analysis: "Analyze this meal photo. Estimate total calories assuming standard serving sizes. Provide: 1) Brief food description 2) Calorie estimate 3) Confidence level. Be specific about portions you see."
- [x] Handle API errors gracefully
- [x] Add loading states

### Task 6: Photo Capture & Analysis Flow
**File: `app.js`**
- [x] Implement camera access (mobile camera, file picker fallback)
- [x] Add image preview before analysis
- [x] Send image to Gemini API
- [x] Parse API response for calories and description
- [x] Show analysis results with edit options
- [x] Allow manual calorie and description adjustment
- [x] Add loading states and error handling

### Task 7: Meal Logging & Display
**File: `app.js`**
- [x] Create meal card component
- [x] Display meal description, calories, timestamp
- [x] Update daily total in header
- [x] Add delete meal functionality with confirmation
- [x] Add edit meal functionality with dedicated buttons
- [x] Auto-save all changes to localStorage
- [x] Show today's meals in reverse chronological order
- [x] Mobile-optimized touch targets and interactions

## Phase 3: Settings & Onboarding (30-45 min)

### Task 8: User Settings
- [x] Create simple onboarding modal (first-time users)
- [x] Collect: current weight, goal weight, timeline
- [x] Calculate daily calorie target using basic formula
- [x] Create settings panel to update goals
- [x] Validate user inputs

### Task 9: Daily Calorie Goal Logic
**File: `utils.js`**
- [x] Implement simplified calorie progress calculation
- [x] Add progress indicator (calories remaining/over)
- [x] Color-code daily total (green = under goal, red = over)
- [x] Simple visual feedback for staying on track
- [x] Simplified settings to just daily calorie target
- [x] Restored export/import functionality

## Phase 4: Historical View & Polish (45-60 min)

### Task 10: Historical Meal View
- [ ] Create past days view (last 7 days visible by default)
- [ ] Group meals by date
- [ ] Make older days collapsible
- [ ] Add simple date navigation
- [ ] Show weekly calorie average

### Task 11: UI Polish & UX Improvements
- [ ] Add loading spinners for API calls
- [ ] Improve error messaging
- [ ] Add confirmation dialogs for delete actions
- [ ] Ensure smooth animations/transitions
- [ ] Test on various screen sizes
- [ ] Add helpful empty states ("No meals today - add your first!")

### Task 12: PWA Setup
**File: `manifest.json`**
- [ ] Create web app manifest
- [ ] Add app icons (simple generated ones)
- [ ] Enable "Add to Home Screen"
- [ ] Basic offline functionality (view past meals)
- [ ] Service worker for caching static assets

## Phase 5: Testing & Launch Prep (30-45 min)

### Task 13: Testing & Bug Fixes
- [ ] Test photo capture on mobile devices
- [ ] Verify API calls work correctly
- [ ] Test data persistence and export
- [ ] Check responsive design on different screens
- [ ] Test edge cases (poor lighting, unclear food photos)
- [ ] Validate calorie calculations

### Task 14: Documentation & Deployment
- [ ] Create simple README with setup instructions
- [ ] Document Gemini API setup process
- [ ] Test deployment as static site
- [ ] Add basic error monitoring
- [ ] Create simple user guide (if needed)

## Quick Start Priority Order

For fastest MVP (if time is limited):
1. **Tasks 1-3**: Basic structure and styling
2. **Tasks 5-6**: Core photo analysis (hardcode settings for now)
3. **Task 7**: Basic meal display
4. **Task 4**: Add localStorage after core flow works

## Estimated Total Time: 4-6 hours

## API Setup Requirements
- Google AI Studio account
- Gemini API key
- Basic understanding of image processing

## Success Criteria
- [ ] User can take photo and get calorie estimate in <15 seconds
- [ ] Daily meals display correctly
- [ ] Data persists between sessions
- [ ] Works on mobile devices
- [ ] Total cost per user <$1/month at reasonable usage
