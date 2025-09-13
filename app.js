// Calorie Hound - Main Application Logic
// Handles UI management and user interactions

// DOM Elements
const elements = {
    settingsBtn: document.getElementById('settingsBtn'),
    settingsModal: document.getElementById('settingsModal'),
    closeSettings: document.getElementById('closeSettings'),
    dailyTarget: document.getElementById('dailyTarget'),
    saveSettings: document.getElementById('saveSettings'),
    exportData: document.getElementById('exportData'),
    importData: document.getElementById('importData'),
    importFile: document.getElementById('importFile'),
    dailyTotal: document.querySelector('.daily-total'),
    mealsContainer: document.getElementById('mealsContainer'),
    // Photo capture elements
    addMealBtn: document.getElementById('addMealBtn'),
    cameraInput: document.getElementById('cameraInput'),
    galleryInput: document.getElementById('galleryInput'),
    photoModal: document.getElementById('photoModal'),
    closeModal: document.getElementById('closeModal'),
    photoPreview: document.getElementById('photoPreview'),
    takePhotoBtn: document.getElementById('takePhotoBtn'),
    cameraBtn: document.getElementById('cameraBtn'),
    galleryBtn: document.getElementById('galleryBtn'),
    analyzeBtn: document.getElementById('analyzeBtn')
};

// Settings Management
class SettingsManager {
    constructor() {
        this.initializeEventListeners();
        this.checkFirstVisit();
    }

    initializeEventListeners() {
        // Settings button
        elements.settingsBtn?.addEventListener('click', () => this.openSettings());

        // Close button
        elements.closeSettings?.addEventListener('click', () => this.closeSettings());

        // Save settings
        elements.saveSettings?.addEventListener('click', () => this.saveSettings());

        // Export/Import
        elements.exportData?.addEventListener('click', () => this.exportData());
        elements.importData?.addEventListener('click', () => {
            elements.importFile?.click();
        });
        elements.importFile?.addEventListener('change', (e) => this.importData(e));

        // Close modal on background click
        elements.settingsModal?.addEventListener('click', (e) => {
            if (e.target === elements.settingsModal) {
                this.closeSettings();
            }
        });
    }

    checkFirstVisit() {
        // Load existing settings
        this.loadSettings();

        // Show settings on first visit if no daily target is set
        const settings = Storage.settings.load();
        if (!settings.dailyTarget) {
            setTimeout(() => {
                this.openSettings();
            }, 500);
        }
    }

    openSettings() {
        if (elements.settingsModal) {
            elements.settingsModal.style.display = 'flex';
            this.loadSettings();
        }
    }

    closeSettings() {
        if (elements.settingsModal) {
            elements.settingsModal.style.display = 'none';
        }
    }

    loadSettings() {
        const settings = Storage.settings.load();
        if (elements.dailyTarget) {
            elements.dailyTarget.value = settings.dailyTarget || 2000;
        }
    }

    saveSettings() {
        const dailyTarget = parseInt(elements.dailyTarget?.value) || 2000;

        // Simple validation
        if (dailyTarget < 1000 || dailyTarget > 5000) {
            alert('Please enter a daily target between 1000-5000 calories');
            return;
        }

        // Save settings
        const saved = Storage.settings.save({ dailyTarget });
        if (saved) {
            this.showSuccessMessage('Settings saved successfully!');
            this.closeSettings();
            this.updateDailyTotal();
        }
    }

    exportData() {
        try {
            Storage.export.exportToJSON();
            this.showSuccessMessage('Data exported successfully!');
        } catch (error) {
            alert('Failed to export data: ' + error.message);
        }
    }

    async importData(event) {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const result = await Storage.export.importFromJSON(file);
            if (result.success) {
                this.showSuccessMessage(result.message);
                this.loadSettings();
                this.updateDailyTotal();
                location.reload(); // Reload to show imported data
            }
        } catch (error) {
            alert('Failed to import data: ' + error.message);
        }

        // Clear file input
        event.target.value = '';
    }

    showSuccessMessage(message) {
        // Create a temporary success notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--accent-primary);
            color: var(--bg-primary);
            padding: 12px 20px;
            border-radius: var(--radius);
            font-weight: 500;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }


    updateDailyTotal() {
        const todayLog = Storage.meals.loadByDate();
        const consumedCalories = todayLog.totalCalories || 0;

        if (!elements.dailyTotal) return;

        // Update the calorie number
        elements.dailyTotal.textContent = consumedCalories;

        // Get user settings for daily target
        const userSettings = Storage.settings.load();
        const targetCalories = userSettings.dailyTarget || 2000;

        // Simple progress calculation
        const remaining = targetCalories - consumedCalories;
        const percentComplete = Math.round((consumedCalories / targetCalories) * 100);

        // Determine status
        let status = 'under';
        let statusText = '';

        if (consumedCalories < targetCalories) {
            status = 'under';
            statusText = `${remaining} calories remaining`;
        } else if (consumedCalories === targetCalories) {
            status = 'at';
            statusText = 'Perfect! At your daily goal';
        } else {
            status = 'over';
            statusText = `${Math.abs(remaining)} calories over goal`;
        }

        // Update progress bar
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');

        if (progressFill && progressText) {
            // Update progress bar width (max 100% to avoid overflow)
            const progressWidth = Math.min(percentComplete, 100);
            progressFill.style.width = `${progressWidth}%`;

            // Update progress bar color
            progressFill.className = 'progress-fill';
            if (status === 'over') {
                progressFill.classList.add('over-goal');
            } else if (status === 'at') {
                progressFill.classList.add('at-goal');
            }

            // Update progress text
            progressText.textContent = statusText;
        }

        // Update daily total color coding
        elements.dailyTotal.className = 'daily-total';
        elements.dailyTotal.classList.add(`${status}-goal`);
    }
}

// Meal Display Management
class MealManager {
    constructor() {
        this.loadTodaysMeals();
    }

    loadTodaysMeals() {
        const todayLog = Storage.meals.loadByDate();

        if (!todayLog.meals || todayLog.meals.length === 0) {
            this.showEmptyState();
            return;
        }

        // Clear container
        if (elements.mealsContainer) {
            elements.mealsContainer.innerHTML = '';

            // Sort meals by timestamp (newest first)
            const sortedMeals = [...todayLog.meals].sort((a, b) => b.timestamp - a.timestamp);

            // Display each meal
            sortedMeals.forEach(meal => {
                this.displayMealCard(meal);
            });
        }
    }

    displayMealCard(meal) {
        const mealCard = document.createElement('div');
        mealCard.className = 'meal-card';
        mealCard.dataset.mealId = meal.id;

        const time = new Date(meal.timestamp).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });

        mealCard.innerHTML = `
            <div class="meal-header">
                <div class="meal-description">${meal.description}</div>
                <div class="meal-actions">
                    <div class="meal-calories">${meal.calories}</div>
                    <button class="edit-meal-btn" data-meal-id="${meal.id}" aria-label="Edit meal description">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="m18.5 2.5 a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="delete-meal-btn" data-meal-id="${meal.id}" aria-label="Delete meal">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3,6 5,6 21,6"></polyline>
                            <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="meal-time">
                ${time}
                ${meal.confidence ? `<span class="meal-confidence ${meal.confidence}">${meal.confidence}</span>` : ''}
            </div>
        `;

        // Add event listeners
        const editBtn = mealCard.querySelector('.edit-meal-btn');
        const deleteBtn = mealCard.querySelector('.delete-meal-btn');

        editBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.editMealDescription(meal.id, meal.description);
        });

        deleteBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteMeal(meal.id);
        });

        elements.mealsContainer?.appendChild(mealCard);
    }

    async deleteMeal(mealId) {
        // Show confirmation dialog
        const confirmed = confirm('Delete this meal? This action cannot be undone.');

        if (!confirmed) return;

        try {
            // Delete from storage
            const success = Storage.meals.deleteMeal(mealId);

            if (success) {
                // Update UI
                this.loadTodaysMeals();
                window.settingsManager?.updateDailyTotal();
                window.settingsManager?.showSuccessMessage('Meal deleted');
            } else {
                throw new Error('Failed to delete meal');
            }
        } catch (error) {
            console.error('Error deleting meal:', error);
            alert('Failed to delete meal. Please try again.');
        }
    }

    async editMealDescription(mealId, currentDescription) {
        const newDescription = prompt('Edit meal description:', currentDescription);

        if (!newDescription || newDescription.trim() === '') return;
        if (newDescription.trim() === currentDescription) return;

        try {
            // Update in storage
            const success = Storage.meals.updateMeal(mealId, {
                description: newDescription.trim()
            });

            if (success) {
                // Update UI
                this.loadTodaysMeals();
                window.settingsManager?.showSuccessMessage('Meal updated');
            } else {
                throw new Error('Failed to update meal');
            }
        } catch (error) {
            console.error('Error updating meal:', error);
            alert('Failed to update meal. Please try again.');
        }
    }

    showEmptyState() {
        if (elements.mealsContainer) {
            elements.mealsContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📷</div>
                    <div class="empty-state-text">No meals logged today</div>
                    <div class="empty-state-subtext">Tap "Add Meal" to get started</div>
                </div>
            `;
        }
    }
}

// Photo Management Class
class PhotoManager {
    constructor() {
        this.currentFile = null;
        this.isAnalyzing = false;
        this.hasCamera = false;
        this.initializeEventListeners();
        this.detectCameraCapability();
    }

    async detectCameraCapability() {
        try {
            // Check if getUserMedia is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                this.hasCamera = false;
                return;
            }

            // Try to get camera permissions (will prompt user)
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            this.hasCamera = true;
            // Stop the stream immediately
            stream.getTracks().forEach(track => track.stop());
        } catch (error) {
            this.hasCamera = false;
            console.log('Camera not available:', error.message);
        }
    }

    initializeEventListeners() {
        // Add Meal button
        elements.addMealBtn?.addEventListener('click', () => this.openPhotoCapture());

        // Camera inputs
        elements.cameraInput?.addEventListener('change', (e) => this.handlePhotoSelected(e));
        elements.galleryInput?.addEventListener('change', (e) => this.handlePhotoSelected(e));

        // Desktop take photo button
        elements.takePhotoBtn?.addEventListener('click', () => this.triggerGalleryInput());

        // Mobile buttons
        elements.cameraBtn?.addEventListener('click', () => this.triggerCameraInput());
        elements.galleryBtn?.addEventListener('click', () => this.triggerGalleryInput());

        // Analyze button
        elements.analyzeBtn?.addEventListener('click', () => this.analyzePhoto());

        // Close modal buttons
        elements.closeModal?.addEventListener('click', () => this.closePhotoModal());

        // Close modal on background click
        elements.photoModal?.addEventListener('click', (e) => {
            if (e.target === elements.photoModal) {
                this.closePhotoModal();
            }
        });
    }

    openPhotoCapture() {
        if (elements.photoModal) {
            elements.photoModal.style.display = 'flex';
            this.resetModal();
            this.updateModalForDevice();
        }
    }

    updateModalForDevice() {
        // Simple title update based on context
        const modalTitle = elements.photoModal?.querySelector('.modal-header h3');
        if (modalTitle) {
            modalTitle.textContent = 'Add Meal Photo';
        }
    }

    closePhotoModal() {
        if (elements.photoModal) {
            elements.photoModal.style.display = 'none';
            this.resetModal();
        }
    }

    resetModal() {
        this.currentFile = null;
        this.isAnalyzing = false;

        if (elements.photoPreview) {
            elements.photoPreview.style.display = 'none';
            elements.photoPreview.src = '';
        }

        if (elements.takePhotoBtn) {
            elements.takePhotoBtn.style.display = 'block';
            elements.takePhotoBtn.disabled = false;
        }

        if (elements.analyzeBtn) {
            elements.analyzeBtn.style.display = 'none';
            elements.analyzeBtn.textContent = 'Analyze Meal';
            elements.analyzeBtn.disabled = false;
        }

        // Reset modal title
        const modalTitle = elements.photoModal?.querySelector('.modal-header h3');
        if (modalTitle) {
            modalTitle.textContent = 'Take Photo';
        }
    }

    triggerCameraInput() {
        elements.cameraInput?.click();
    }

    triggerGalleryInput() {
        elements.galleryInput?.click();
    }

    async handlePhotoSelected(event) {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file.');
            return;
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            alert('Image file too large. Please select an image under 10MB.');
            return;
        }

        this.currentFile = file;
        await this.displayPhotoPreview(file);

        // Update UI
        if (elements.takePhotoBtn) {
            elements.takePhotoBtn.style.display = 'none';
        }

        if (elements.analyzeBtn) {
            elements.analyzeBtn.style.display = 'block';
        }
    }

    async displayPhotoPreview(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                if (elements.photoPreview) {
                    elements.photoPreview.src = e.target.result;
                    elements.photoPreview.style.display = 'block';
                }
                resolve();
            };

            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async analyzePhoto() {
        if (!this.currentFile || this.isAnalyzing) return;

        this.isAnalyzing = true;
        this.showAnalyzing();

        try {
            // Check if Gemini API is available
            if (!window.GeminiAPI) {
                throw new Error('Gemini API not loaded');
            }

            // Analyze the image
            const result = await window.GeminiAPI.analyzeImage(this.currentFile);

            // Show results to user
            await this.showAnalysisResult(result);

        } catch (error) {
            console.error('Photo analysis failed:', error);
            this.showAnalysisError(error.message);
        } finally {
            this.isAnalyzing = false;
        }
    }

    showAnalyzing() {
        if (elements.analyzeBtn) {
            elements.analyzeBtn.disabled = true;
            elements.analyzeBtn.innerHTML = `
                <div class="loading"></div>
                Analyzing...
            `;
        }
    }

    async showAnalysisResult(result) {
        // Create analysis result modal content
        const modalBody = elements.photoModal?.querySelector('.modal-body');
        if (!modalBody) return;

        modalBody.innerHTML = `
            <div class="analysis-result">
                <h4>Analysis Complete</h4>
                <div class="result-card">
                    <div class="result-header">
                        <input type="text" id="descriptionInput" class="description-input" value="${result.description}" placeholder="Meal description">
                        <span class="result-confidence ${result.confidence}">${result.confidence}</span>
                    </div>
                    <div class="result-calories">
                        <input type="number" id="calorieInput" value="${result.calories}" min="1" max="5000">
                        <span class="calories-label">calories</span>
                    </div>
                    ${result.portions ? `<div class="result-portions">${result.portions}</div>` : ''}
                    ${result.processingTime ? `<div class="processing-time">Analyzed in ${(result.processingTime / 1000).toFixed(1)}s</div>` : ''}
                </div>
                <div class="result-actions">
                    <button id="saveMeal" class="save-meal-btn">Save Meal</button>
                    <button id="retakePhoto" class="secondary-btn">Retake Photo</button>
                </div>
            </div>
        `;

        // Add event listeners for result actions
        const saveMealBtn = document.getElementById('saveMeal');
        const retakePhotoBtn = document.getElementById('retakePhoto');
        const calorieInput = document.getElementById('calorieInput');
        const descriptionInput = document.getElementById('descriptionInput');

        saveMealBtn?.addEventListener('click', () => this.saveMeal(result, calorieInput?.value, descriptionInput?.value));
        retakePhotoBtn?.addEventListener('click', () => this.resetModal());

        // Auto-focus on description input for quick editing
        descriptionInput?.focus();
        descriptionInput?.select();
    }

    showAnalysisError(message) {
        const modalBody = elements.photoModal?.querySelector('.modal-body');
        if (!modalBody) return;

        modalBody.innerHTML = `
            <div class="analysis-error">
                <h4>Analysis Failed</h4>
                <p class="error-message">${message}</p>
                <p class="error-help">Please check your internet connection and try again.</p>
                <div class="error-actions">
                    <button id="retryAnalysis" class="analyze-btn">Try Again</button>
                    <button id="retakePhoto" class="secondary-btn">Retake Photo</button>
                </div>
            </div>
        `;

        // Add event listeners
        const retryBtn = document.getElementById('retryAnalysis');
        const retakePhotoBtn = document.getElementById('retakePhoto');

        retryBtn?.addEventListener('click', () => this.analyzePhoto());
        retakePhotoBtn?.addEventListener('click', () => this.resetModal());
    }

    async saveMeal(originalResult, calories, description) {
        try {
            const calorieValue = parseInt(calories) || originalResult.calories;
            const descriptionValue = (description && description.trim()) || originalResult.description;

            const meal = {
                description: descriptionValue,
                calories: calorieValue,
                confidence: originalResult.confidence,
                portions: originalResult.portions || 'Standard serving'
            };

            // Save to storage
            const savedMeal = Storage.meals.addMeal(meal);

            if (savedMeal) {
                // Update UI
                window.settingsManager?.updateDailyTotal();
                window.mealManager?.loadTodaysMeals();

                // Show success message
                window.settingsManager?.showSuccessMessage('Meal saved successfully!');

                // Close modal
                this.closePhotoModal();
            } else {
                throw new Error('Failed to save meal to storage');
            }

        } catch (error) {
            console.error('Error saving meal:', error);
            alert('Failed to save meal. Please try again.');
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize managers
    window.settingsManager = new SettingsManager();
    window.mealManager = new MealManager();
    window.photoManager = new PhotoManager();

    // Remove sample meal cards if storage has data
    const todayLog = Storage.meals.loadByDate();
    if (Storage.settings.isSetupComplete() || todayLog.meals.length > 0) {
        // Clear any sample data
        const sampleCards = document.querySelectorAll('.meal-card:not([data-meal-id])');
        sampleCards.forEach(card => card.remove());
    }

    // Update daily total
    window.settingsManager.updateDailyTotal();

    // Test API connection on startup (optional)
    if (window.GeminiAPI && Storage.settings.isSetupComplete()) {
        window.GeminiAPI.testConnection().then(connected => {
            if (connected) {
                console.log('✅ Gemini API connection verified');
            } else {
                console.warn('⚠️ Gemini API connection failed - photo analysis may not work');
            }
        });
    }
});
