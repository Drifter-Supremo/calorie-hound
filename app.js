// Calorie Hound - Main Application Logic
// Handles UI management and user interactions

// DOM Elements
const elements = {
    settingsBtn: document.getElementById('settingsBtn'),
    settingsModal: document.getElementById('settingsModal'),
    closeSettings: document.getElementById('closeSettings'),
    currentWeight: document.getElementById('currentWeight'),
    goalWeight: document.getElementById('goalWeight'),
    timeline: document.getElementById('timeline'),
    dailyTarget: document.getElementById('dailyTarget'),
    saveSettings: document.getElementById('saveSettings'),
    exportData: document.getElementById('exportData'),
    importData: document.getElementById('importData'),
    importFile: document.getElementById('importFile'),
    clearData: document.getElementById('clearData'),
    dailyTotal: document.querySelector('.daily-total'),
    mealsContainer: document.getElementById('mealsContainer')
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

        // Export/Import/Clear
        elements.exportData?.addEventListener('click', () => this.exportData());
        elements.importData?.addEventListener('click', () => {
            elements.importFile?.click();
        });
        elements.importFile?.addEventListener('change', (e) => this.importData(e));
        elements.clearData?.addEventListener('click', () => this.clearAllData());

        // Close modal on background click
        elements.settingsModal?.addEventListener('click', (e) => {
            if (e.target === elements.settingsModal) {
                this.closeSettings();
            }
        });
    }

    checkFirstVisit() {
        // Check if user has completed setup
        if (!Storage.settings.isSetupComplete()) {
            // Show settings modal on first visit
            setTimeout(() => {
                this.openSettings();
                this.showWelcomeMessage();
            }, 500);
        } else {
            // Load existing settings
            this.loadSettings();
        }
    }

    showWelcomeMessage() {
        const header = elements.settingsModal?.querySelector('.modal-header h3');
        if (header) {
            header.textContent = 'Welcome! Let\'s set up your goals';
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

        if (elements.currentWeight) elements.currentWeight.value = settings.currentWeight || '';
        if (elements.goalWeight) elements.goalWeight.value = settings.goalWeight || '';
        if (elements.timeline) elements.timeline.value = settings.timeline || '3 months';
        if (elements.dailyTarget) elements.dailyTarget.value = settings.dailyCalorieTarget || 2000;
    }

    saveSettings() {
        const settings = {
            currentWeight: parseFloat(elements.currentWeight?.value) || null,
            goalWeight: parseFloat(elements.goalWeight?.value) || null,
            timeline: elements.timeline?.value || null,
            dailyCalorieTarget: parseInt(elements.dailyTarget?.value) || 2000
        };

        // Validate inputs
        if (!settings.currentWeight || !settings.goalWeight) {
            alert('Please enter both current and goal weight');
            return;
        }

        if (settings.currentWeight <= settings.goalWeight) {
            alert('Goal weight should be less than current weight for weight loss');
            return;
        }

        // Save settings
        const saved = Storage.settings.save(settings);
        if (saved) {
            this.showSuccessMessage('Settings saved successfully!');
            this.closeSettings();
            this.updateUI();
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
                this.updateUI();
                location.reload(); // Reload to show imported data
            }
        } catch (error) {
            alert('Failed to import data: ' + error.message);
        }

        // Clear file input
        event.target.value = '';
    }

    clearAllData() {
        if (Storage.clearAll()) {
            this.showSuccessMessage('All data cleared');
            location.reload();
        }
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

    updateUI() {
        // Update daily calorie display
        this.updateDailyTotal();
    }

    updateDailyTotal() {
        const todayLog = Storage.meals.loadByDate();
        if (elements.dailyTotal) {
            elements.dailyTotal.textContent = todayLog.totalCalories || 0;
        }
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
                <div class="meal-calories">${meal.calories}</div>
            </div>
            <div class="meal-time">
                ${time}
                ${meal.confidence ? `<span class="meal-confidence ${meal.confidence}">${meal.confidence}</span>` : ''}
            </div>
        `;

        elements.mealsContainer?.appendChild(mealCard);
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

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize managers
    window.settingsManager = new SettingsManager();
    window.mealManager = new MealManager();

    // Remove sample meal cards if storage has data
    const todayLog = Storage.meals.loadByDate();
    if (Storage.settings.isSetupComplete() || todayLog.meals.length > 0) {
        // Clear any sample data
        const sampleCards = document.querySelectorAll('.meal-card:not([data-meal-id])');
        sampleCards.forEach(card => card.remove());
    }

    // Update daily total
    window.settingsManager.updateDailyTotal();
});
