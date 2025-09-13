# 🐕 Calorie Hound

A simple AI-powered calorie tracking app that analyzes food photos and automatically logs your meals. Built with vanilla JavaScript and Google's Gemini AI.

![App Demo](https://via.placeholder.com/600x400/60a5fa/ffffff?text=Calorie+Hound+Demo)

## ✨ Features

### 📸 Smart Photo Analysis
- Take photos of your meals or upload from gallery
- AI automatically identifies food and estimates calories
- Edit descriptions and calorie counts before saving
- High confidence ratings for accurate estimates

### 📊 Daily Tracking
- Real-time calorie counter with color-coded progress
- Visual progress bar showing goal completion
- Simple daily calorie target setting
- Green/blue/red status indicators (under/at/over goal)

### 📅 Historical View
- View past 7 days of meals in collapsible cards
- Smart date formatting ("Yesterday", weekdays, dates)
- 7-day calorie average calculation
- Color-coded daily totals based on your goals

### 💾 Data Management
- All data stored locally in your browser
- Export/import your meal data as JSON
- No account required - complete privacy
- Works offline for viewing past meals

### 📱 Mobile Optimized
- Mobile-first responsive design
- Camera access for instant photo capture
- Touch-friendly interface with large buttons
- Works great on phones, tablets, and desktop

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Google AI Studio API key for Gemini 2.5 Flash-Lite

### Setup

1. **Get API Key**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the key (starts with `AIza...`)

2. **Configure App**
   - Open `gemini.js` in a text editor
   - Replace `YOUR_API_KEY_HERE` with your actual API key
   - Save the file

3. **Run the App**
   ```bash
   # Option 1: Simple HTTP server
   python3 -m http.server 8000

   # Option 2: Using Node.js
   npx serve .

   # Option 3: Open directly
   # Simply open index.html in your browser
   ```

4. **Access the App**
   - Open browser to `http://localhost:8000`
   - Set your daily calorie goal in Settings
   - Start adding meals!

## 🛠️ Technical Details

### Architecture
- **Frontend**: Pure HTML5, CSS3, Vanilla JavaScript
- **AI Service**: Google Gemini 2.5 Flash-Lite API
- **Storage**: Browser localStorage (no backend required)
- **Deployment**: Static files (works on any web server)

### File Structure
```
calorie-hound/
├── index.html          # Main app interface
├── style.css           # Styling and responsive design
├── app.js              # Core app logic and UI management
├── gemini.js           # Gemini AI integration
├── storage.js          # localStorage data management
├── utils.js            # Utility functions and calculations
├── .env                # API key (not committed)
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📖 Usage Guide

### Adding Meals
1. Click the big "Add Meal" button
2. **Mobile**: Choose "Take Photo" or "Choose from Gallery"
3. **Desktop**: Click "Choose Image" to select a file
4. Wait for AI analysis (usually 2-3 seconds)
5. Review and edit the description and calories
6. Click "Save Meal"

### Managing Meals
- **Edit**: Click the pencil icon on any meal card
- **Delete**: Click the trash icon and confirm
- **View Time**: Each meal shows when it was logged

### Settings
- Click the gear icon in the header
- Set your daily calorie target (1000-5000 range)
- Export your data for backup
- Import data to restore from backup

### Historical Data
- Past days appear below today's meals
- Click any day header to expand/collapse meal details
- View 7-day average in the section header
- Only days with meals are shown

## 🔒 Privacy & Security

- **Local Storage**: All data stays in your browser
- **No Account**: No sign-up or personal info required
- **API Calls**: Only food images sent to Google AI (not stored by Google)
- **Offline Viewing**: Past meals viewable without internet
- **Export Control**: You own and control your data

## ⚡ Performance

- **Photo Analysis**: < 3 seconds typical response time
- **Image Compression**: Photos resized to 800px for faster uploads
- **Cost Efficient**: Designed for < $1/month per user at normal usage
- **Lightweight**: No frameworks, minimal JavaScript bundle

## 🛣️ Roadmap

- [ ] PWA support (installable app)
- [ ] Nutrition breakdown (protein, carbs, fat)
- [ ] Meal templates and favorites
- [ ] Weekly/monthly reporting
- [ ] Food database integration
- [ ] Multi-language support

## 🐛 Troubleshooting

### API Issues
- **"API key invalid"**: Check your Gemini API key in `gemini.js`
- **"Failed to analyze"**: Try compressing the image or check internet connection
- **"Quota exceeded"**: You've hit daily API limits, try again tomorrow

### Camera Issues
- **No camera button**: Try on a mobile device or enable camera permissions
- **Upload not working**: Check file size (< 10MB) and format (JPG, PNG)

### Data Issues
- **Calories not updating**: Refresh the page or check browser console for errors
- **Import failed**: Ensure JSON file is valid Calorie Hound export format

## 🤝 Contributing

This is a simple personal project, but feel free to:
- Report bugs by creating issues
- Suggest features
- Fork and modify for your needs
- Share improvements

## 📄 License

MIT License - feel free to use and modify as needed.

## 🙏 Acknowledgments

- Google Gemini AI for food recognition
- Modern browser APIs for camera access
- The community for feedback and testing

---

**Built with ❤️ and hunger for better calorie tracking**