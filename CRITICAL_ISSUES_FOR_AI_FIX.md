# CRITICAL ISSUES - CALORIE HOUND APP
**Date:** September 13, 2025
**GitHub Repo:** https://github.com/Drifter-Supremo/calorie-hound
**GitHub Pages:** https://drifter-supremo.github.io/calorie-hound/

## PROJECT CONTEXT
- **Mobile-first calorie tracking app** using vanilla JavaScript
- **AI photo analysis** via Google Gemini 2.5 Flash-Lite API
- **Simple workflow:** Take photo → AI analyzes → Save meal
- **Current status:** Core functionality is broken due to UI button logic issues

## CRITICAL PROBLEM SUMMARY
The photo capture and analysis workflow is completely broken. Based on mobile screenshots provided:

### ISSUE 1: DUPLICATE BUTTONS SHOWING
**Problem:** Both desktop "Choose Image" AND mobile "Take Photo"/"Choose from Gallery" buttons appear simultaneously on mobile devices.

**Expected:** Only 2 mobile buttons should show:
- "Take Photo" (camera)
- "Choose from Gallery" (file picker)

**Current Screenshots Show:** 3 buttons total (wrong!)

### ISSUE 2: ANALYZE BUTTON WORKFLOW BROKEN
**Problem:** After selecting a photo, ALL buttons remain visible instead of hiding photo buttons and showing only "Analyze Meal" button.

**Expected Workflow:**
1. Show: "Take Photo" + "Choose from Gallery" buttons
2. User selects photo → Photo preview appears
3. Hide: Photo capture buttons
4. Show: ONLY "Analyze Meal" button
5. User taps "Analyze Meal" → AI processes → Show results

**Current Broken Behavior:** All buttons stay visible, creating confusion

### ISSUE 3: DESKTOP/MOBILE COMPLEXITY
**Root Cause:** The app has unnecessary desktop/mobile CSS classes and logic that conflict:
- `.desktop-only` / `.mobile-only` CSS classes
- Complex media queries
- JavaScript trying to manage both desktop and mobile button states
- Inline `style="display: none"` overriding CSS media queries

**This should be MOBILE-ONLY** - no desktop complexity needed.

## TECHNICAL ROOT CAUSES

### HTML Structure Issues (index.html ~line 89-119)
```html
<!-- PROBLEM: Both desktop AND mobile buttons exist -->
<button id="takePhotoBtn" class="take-photo-btn desktop-only">Choose Image</button>
<div id="mobileButtons" class="mobile-buttons mobile-only">
    <button id="cameraBtn">Take Photo</button>
    <button id="galleryBtn">Choose from Gallery</button>
</div>
<button id="analyzeBtn" style="display: none;">Analyze Meal</button>
```

### CSS Conflicts (style.css ~line 531-547)
```css
/* PROBLEM: Complex desktop/mobile visibility rules */
.desktop-only { display: block; }
.mobile-only { display: none; }
@media (max-width: 768px) {
    .desktop-only { display: none; }
    .mobile-only { display: block; }
}
```

### JavaScript Logic Issues (app.js)
**Problem areas:**
1. **Element references:** Both `takePhotoBtn` and mobile buttons referenced
2. **Event listeners:** Desktop button has different handler than mobile buttons
3. **UI state management:** `onPhotoSelected()` only hides desktop button, not mobile buttons
4. **Reset logic:** `resetModal()` shows desktop button but may not properly handle mobile buttons

**Key problematic functions:**
- `onPhotoSelected()` - Doesn't hide mobile buttons
- `resetModal()` - Doesn't properly reset mobile button state
- Event listeners for both desktop and mobile buttons

## API FUNCTIONALITY STATUS
**MAJOR PROBLEM:** The Gemini AI integration is **COMPLETELY BROKEN** based on screenshots showing:
- User uploaded: Photo of scrambled eggs and bacon
- AI returned: "Food item (analysis failed)"
- Expected: "Scrambled eggs and bacon" or similar food identification
- Result: **TOTAL FAILURE** - AI is not analyzing food at all

**BOTH the UI buttons AND the AI analysis are broken.**

## SOLUTION REQUIREMENTS

### SIMPLIFIED MOBILE-ONLY APPROACH NEEDED
1. **Remove ALL desktop button code** - HTML, CSS, JavaScript
2. **Remove ALL `.desktop-only` / `.mobile-only` classes and CSS**
3. **Single button container** with just 2 buttons:
   - "Take Photo" (triggers camera input)
   - "Choose from Gallery" (triggers file input)
4. **Simple state management:**
   - Show photo buttons by default
   - Hide photo buttons when photo selected
   - Show analyze button when photo selected
   - Reset to photo buttons when modal closes/resets

### EXACT WORKFLOW REQUIRED
```
INITIAL STATE:
- Show: [Take Photo] [Choose from Gallery] buttons
- Hide: [Analyze Meal] button

AFTER PHOTO SELECTED:
- Hide: Photo capture buttons
- Show: Photo preview + [Analyze Meal] button

AFTER ANALYSIS:
- Show: Results + [Save Meal] [Retake Photo] buttons

WHEN MODAL CLOSES/RESETS:
- Back to INITIAL STATE
```

## FILES THAT NEED FIXING
1. **index.html** - Remove desktop button, simplify mobile buttons
2. **style.css** - Remove desktop/mobile CSS classes and media queries
3. **app.js** - Remove desktop button references, fix mobile button show/hide logic

## CURRENT GIT STATUS
- **Last working commit:** Before mobile button fixes were attempted
- **Current HEAD:** 68997db (surgical fix that didn't work)
- **Recommendation:** May need to revert to earlier working state and rebuild mobile buttons properly

## SUCCESS CRITERIA
- [ ] Only 2 buttons show initially: "Take Photo" + "Choose from Gallery"
- [ ] After photo selection: Only "Analyze Meal" button visible
- [ ] Photo analysis works (already confirmed working)
- [ ] Modal reset returns to initial 2-button state
- [ ] No desktop/mobile complexity - simple mobile-first design
- [ ] Works on all mobile browsers

## ADDITIONAL NOTES
- **User tested on mobile Chrome browser**
- **API key management working correctly** (separate from UI issues)
- **Settings modal working correctly** (separate from UI issues)
- **This is purely a photo capture UI workflow problem**
- **The core app functionality is solid - just needs simplified button management**

---

## CRITICAL API ISSUES TO INVESTIGATE
1. **Gemini API calls failing** - Check API key, endpoint, request format
2. **Image processing broken** - Check image compression, base64 encoding
3. **Response parsing broken** - Check how AI responses are parsed
4. **Error handling masking real issues** - "analysis failed" suggests catch-all error

**For the AI fixing this:**
1. **FIRST:** Fix the Gemini AI integration - it should identify "scrambled eggs and bacon" not "analysis failed"
2. **SECOND:** Fix the mobile button show/hide state management
3. **Both are critical failures** - this is not just a UI issue
