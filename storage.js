// Local Storage Management
// Handles saving/loading user settings and meal logs

const STORAGE_KEYS = {
    USER_SETTINGS: 'userSettings',
    MEAL_LOGS: 'mealLogs',
    LAST_SYNC: 'lastSync'
};

// User Settings Management
const UserSettings = {
    // Default settings
    getDefaults() {
        return {
            currentWeight: null,
            goalWeight: null,
            timeline: null,
            dailyCalorieTarget: 2000,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
    },

    // Load user settings from localStorage
    load() {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading user settings:', error);
        }
        return this.getDefaults();
    },

    // Save user settings to localStorage
    save(settings) {
        try {
            const toSave = {
                ...this.load(),
                ...settings,
                updatedAt: Date.now()
            };
            localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(toSave));
            Storage.updateLastSync();
            return toSave;
        } catch (error) {
            console.error('Error saving user settings:', error);
            return null;
        }
    },

    // Check if user has completed initial setup
    isSetupComplete() {
        const settings = this.load();
        return settings.currentWeight !== null &&
               settings.goalWeight !== null &&
               settings.timeline !== null;
    }
};

// Meal Logs Management
const MealLogs = {
    // Get today's date in YYYY-MM-DD format
    getTodayDate() {
        const today = new Date();
        return today.toISOString().split('T')[0];
    },

    // Load all meal logs
    loadAll() {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.MEAL_LOGS);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading meal logs:', error);
        }
        return [];
    },

    // Load logs for a specific date
    loadByDate(date = this.getTodayDate()) {
        const allLogs = this.loadAll();
        return allLogs.find(log => log.date === date) || this.createEmptyLog(date);
    },

    // Create empty log for a date
    createEmptyLog(date) {
        return {
            date: date,
            meals: [],
            totalCalories: 0
        };
    },

    // Save a new meal
    addMeal(meal) {
        try {
            const today = this.getTodayDate();
            const allLogs = this.loadAll();
            let todayLog = allLogs.find(log => log.date === today);

            if (!todayLog) {
                todayLog = this.createEmptyLog(today);
                allLogs.push(todayLog);
            }

            // Add meal with unique ID
            const newMeal = {
                id: Date.now().toString(),
                timestamp: Date.now(),
                ...meal
            };

            todayLog.meals.push(newMeal);
            todayLog.totalCalories = todayLog.meals.reduce((sum, m) => sum + (m.calories || 0), 0);

            // Sort logs by date (newest first)
            allLogs.sort((a, b) => b.date.localeCompare(a.date));

            localStorage.setItem(STORAGE_KEYS.MEAL_LOGS, JSON.stringify(allLogs));
            Storage.updateLastSync();

            return newMeal;
        } catch (error) {
            console.error('Error adding meal:', error);
            return null;
        }
    },

    // Update an existing meal
    updateMeal(mealId, updates) {
        try {
            const allLogs = this.loadAll();

            for (let log of allLogs) {
                const mealIndex = log.meals.findIndex(m => m.id === mealId);
                if (mealIndex !== -1) {
                    log.meals[mealIndex] = {
                        ...log.meals[mealIndex],
                        ...updates,
                        updatedAt: Date.now()
                    };
                    log.totalCalories = log.meals.reduce((sum, m) => sum + (m.calories || 0), 0);

                    localStorage.setItem(STORAGE_KEYS.MEAL_LOGS, JSON.stringify(allLogs));
                    Storage.updateLastSync();
                    return log.meals[mealIndex];
                }
            }
        } catch (error) {
            console.error('Error updating meal:', error);
        }
        return null;
    },

    // Delete a meal
    deleteMeal(mealId) {
        try {
            const allLogs = this.loadAll();

            for (let log of allLogs) {
                const mealIndex = log.meals.findIndex(m => m.id === mealId);
                if (mealIndex !== -1) {
                    log.meals.splice(mealIndex, 1);
                    log.totalCalories = log.meals.reduce((sum, m) => sum + (m.calories || 0), 0);

                    localStorage.setItem(STORAGE_KEYS.MEAL_LOGS, JSON.stringify(allLogs));
                    Storage.updateLastSync();
                    return true;
                }
            }
        } catch (error) {
            console.error('Error deleting meal:', error);
        }
        return false;
    },

    // Get logs for the last N days
    getRecentLogs(days = 7) {
        const allLogs = this.loadAll();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        const cutoff = cutoffDate.toISOString().split('T')[0];

        return allLogs.filter(log => log.date >= cutoff);
    },

    // Calculate weekly average
    getWeeklyAverage() {
        const weekLogs = this.getRecentLogs(7);
        if (weekLogs.length === 0) return 0;

        const totalCalories = weekLogs.reduce((sum, log) => sum + log.totalCalories, 0);
        return Math.round(totalCalories / weekLogs.length);
    }
};

// Export/Import functionality
const DataExport = {
    // Export all data as JSON
    exportToJSON() {
        const data = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            userSettings: UserSettings.load(),
            mealLogs: MealLogs.loadAll()
        };

        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `calorie-hound-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    // Import data from JSON file
    importFromJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);

                    // Validate data structure
                    if (!data.version || !data.userSettings || !data.mealLogs) {
                        throw new Error('Invalid data format');
                    }

                    // Confirm before overwriting
                    if (confirm('This will replace all existing data. Continue?')) {
                        // Import user settings
                        localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(data.userSettings));

                        // Import meal logs
                        localStorage.setItem(STORAGE_KEYS.MEAL_LOGS, JSON.stringify(data.mealLogs));

                        Storage.updateLastSync();
                        resolve({ success: true, message: 'Data imported successfully' });
                    } else {
                        resolve({ success: false, message: 'Import cancelled' });
                    }
                } catch (error) {
                    reject(new Error('Failed to import data: ' + error.message));
                }
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }
};

// Main Storage API
const Storage = {
    // Update last sync timestamp
    updateLastSync() {
        localStorage.setItem(STORAGE_KEYS.LAST_SYNC, Date.now().toString());
    },

    // Get last sync timestamp
    getLastSync() {
        const stored = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
        return stored ? parseInt(stored) : null;
    },

    // Clear all data
    clearAll() {
        if (confirm('This will delete all your data. Are you sure?')) {
            localStorage.removeItem(STORAGE_KEYS.USER_SETTINGS);
            localStorage.removeItem(STORAGE_KEYS.MEAL_LOGS);
            localStorage.removeItem(STORAGE_KEYS.LAST_SYNC);
            return true;
        }
        return false;
    },

    // Get storage size estimate
    async getStorageInfo() {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            const estimate = await navigator.storage.estimate();
            const percentUsed = (estimate.usage / estimate.quota) * 100;
            return {
                used: estimate.usage,
                quota: estimate.quota,
                percentUsed: percentUsed.toFixed(2)
            };
        }
        return null;
    },

    // Public API
    settings: UserSettings,
    meals: MealLogs,
    export: DataExport
};
