// Utility Functions
// Helper functions for calorie calculations and general utilities

// Calorie Calculation System
class CalorieCalculator {

    /**
     * Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor Equation
     * @param {Object} userSettings - User settings object
     * @param {number} userSettings.currentWeight - Weight in pounds
     * @param {string} userSettings.gender - 'male' or 'female'
     * @param {number} userSettings.age - Age in years
     * @param {number} userSettings.heightFeet - Height feet
     * @param {number} userSettings.heightInches - Height inches
     * @returns {number} BMR in calories per day
     */
    static calculateBMR(userSettings) {
        const { currentWeight, gender = 'female', age = 30, heightFeet = 5, heightInches = 6 } = userSettings;

        if (!currentWeight || currentWeight <= 0) {
            return 1500; // Default fallback BMR
        }

        // Convert weight from pounds to kg
        const weightKg = currentWeight * 0.453592;

        // Convert height to cm
        const totalHeightInches = (heightFeet * 12) + heightInches;
        const heightCm = totalHeightInches * 2.54;

        // Mifflin-St Jeor Equation
        let bmr;
        if (gender === 'male') {
            bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
        } else {
            bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
        }

        return Math.round(bmr);
    }

    /**
     * Calculate Total Daily Energy Expenditure (TDEE)
     * @param {number} bmr - Basal Metabolic Rate
     * @param {string} activityLevel - Activity level ('sedentary', 'light', 'moderate', 'very', 'extreme')
     * @returns {number} TDEE in calories
     */
    static calculateTDEE(bmr, activityLevel = 'sedentary') {
        const activityMultipliers = {
            'sedentary': 1.2,      // Little/no exercise
            'light': 1.375,        // Light exercise 1-3 days/week
            'moderate': 1.55,      // Moderate exercise 3-5 days/week
            'very': 1.725,         // Hard exercise 6-7 days/week
            'extreme': 1.9         // Very hard exercise, physical job
        };

        const multiplier = activityMultipliers[activityLevel] || 1.2;
        return Math.round(bmr * multiplier);
    }

    /**
     * Calculate daily calorie target based on goal
     * @param {Object} userSettings - User settings object
     * @returns {number} Daily calorie target
     */
    static calculateDailyTarget(userSettings) {
        const { currentWeight, goalWeight, timeline = 12, activityLevel = 'sedentary' } = userSettings;

        // If no goal weight set, maintain current weight
        if (!goalWeight || goalWeight === currentWeight) {
            const bmr = this.calculateBMR(userSettings);
            return this.calculateTDEE(bmr, activityLevel);
        }

        const bmr = this.calculateBMR(userSettings);
        const tdee = this.calculateTDEE(bmr, activityLevel);

        // Calculate weekly weight change needed
        const totalWeightChange = goalWeight - currentWeight;
        const weeksToGoal = timeline * 4.33; // Convert months to weeks
        const weeklyWeightChange = totalWeightChange / weeksToGoal;

        // 1 pound = ~3500 calories
        // Weekly calorie adjustment = weekly weight change * 3500
        const weeklyCalorieAdjustment = weeklyWeightChange * 3500;
        const dailyCalorieAdjustment = weeklyCalorieAdjustment / 7;

        // Apply calorie adjustment to TDEE
        let dailyTarget = tdee + dailyCalorieAdjustment;

        // Safety limits - don't go too extreme
        const minCalories = Math.max(1200, bmr * 0.8); // Never below 80% BMR or 1200
        const maxCalories = tdee * 1.2; // Never above 120% TDEE

        dailyTarget = Math.max(minCalories, Math.min(maxCalories, dailyTarget));

        return Math.round(dailyTarget);
    }

    /**
     * Get calorie progress information
     * @param {number} consumedCalories - Calories consumed today
     * @param {number} targetCalories - Daily calorie target
     * @returns {Object} Progress information
     */
    static getCalorieProgress(consumedCalories, targetCalories) {
        const remaining = targetCalories - consumedCalories;
        const percentComplete = Math.round((consumedCalories / targetCalories) * 100);

        let status = 'under'; // under, at, over
        let statusText = '';
        let statusColor = '#10b981'; // green

        if (consumedCalories < targetCalories * 0.9) {
            status = 'under';
            statusText = `${Math.abs(remaining)} calories remaining`;
            statusColor = '#10b981'; // green
        } else if (consumedCalories <= targetCalories * 1.1) {
            status = 'at';
            statusText = 'At target - great job!';
            statusColor = '#3b82f6'; // blue
        } else {
            status = 'over';
            statusText = `${Math.abs(remaining)} calories over`;
            statusColor = '#ef4444'; // red
        }

        return {
            consumed: consumedCalories,
            target: targetCalories,
            remaining,
            percentComplete,
            status,
            statusText,
            statusColor
        };
    }
}
