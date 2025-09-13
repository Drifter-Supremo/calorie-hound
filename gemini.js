// Gemini API Integration
// Handles AI vision analysis for meal calorie estimation

// API Key Management
function getAPIKey() {
    // Get API key from user settings
    const settings = UserSettings.load();

    if (!settings.geminiApiKey || settings.geminiApiKey.trim() === '') {
        throw new Error('API key not configured. Please set it in Settings.');
    }

    return settings.geminiApiKey;
}

// Configuration
const GEMINI_CONFIG = {
    get API_KEY() { return getAPIKey(); }, // Get API key from settings dynamically
    API_ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent',
    MAX_IMAGE_WIDTH: 800,
    MAX_IMAGE_HEIGHT: 800,
    TIMEOUT_MS: 10000, // 10 second timeout to meet requirements
    COMPRESSION_QUALITY: 0.8
};

// Calorie Analysis Prompt - Optimized for food recognition
const CALORIE_PROMPT = `Analyze this meal photo and provide a calorie estimate. Please respond in exactly this format:

FOOD: [Brief description of the food items you see]
CALORIES: [Total calorie estimate as a number only]
CONFIDENCE: [high/medium/low]
PORTIONS: [Brief note about portion sizes observed]

Instructions:
- Assume standard serving sizes unless portions look obviously large/small
- Be specific about what food items you can identify
- Consider typical restaurant/home portions
- Only estimate calories for food items, ignore drinks unless specifically asked
- If multiple items, provide total combined calories`;

// Image Compression Utility
class ImageCompressor {
    static async compressImage(file, maxWidth = GEMINI_CONFIG.MAX_IMAGE_WIDTH, maxHeight = GEMINI_CONFIG.MAX_IMAGE_HEIGHT, quality = GEMINI_CONFIG.COMPRESSION_QUALITY) {
        return new Promise((resolve, reject) => {
            // Create canvas and context
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                // Calculate new dimensions while maintaining aspect ratio
                let { width, height } = img;

                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                if (height > maxHeight) {
                    width = (width * maxHeight) / height;
                    height = maxHeight;
                }

                // Set canvas dimensions
                canvas.width = width;
                canvas.height = height;

                // Draw and compress image
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to blob
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Failed to compress image'));
                    }
                }, 'image/jpeg', quality);
            };

            img.onerror = () => reject(new Error('Failed to load image'));

            // Load image
            if (file instanceof File) {
                img.src = URL.createObjectURL(file);
            } else if (typeof file === 'string') {
                img.src = file;
            } else {
                reject(new Error('Invalid file type'));
            }
        });
    }

    static async blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(',')[1]; // Remove data:image/jpeg;base64, prefix
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }
}

// API Response Parser
class ResponseParser {
    static parseGeminiResponse(apiResponse) {
        try {
            const candidate = apiResponse.candidates?.[0];
            const text = candidate?.content?.parts?.[0]?.text;

            if (!text) {
                throw new Error('No response text from API');
            }

            // Parse structured response
            const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
            const result = {
                description: '',
                calories: 0,
                confidence: 'low',
                portions: ''
            };

            for (const line of lines) {
                if (line.startsWith('FOOD:')) {
                    result.description = line.replace('FOOD:', '').trim();
                } else if (line.startsWith('CALORIES:')) {
                    const calorieMatch = line.replace('CALORIES:', '').trim().match(/\d+/);
                    result.calories = calorieMatch ? parseInt(calorieMatch[0]) : 0;
                } else if (line.startsWith('CONFIDENCE:')) {
                    const confidence = line.replace('CONFIDENCE:', '').trim().toLowerCase();
                    if (['high', 'medium', 'low'].includes(confidence)) {
                        result.confidence = confidence;
                    }
                } else if (line.startsWith('PORTIONS:')) {
                    result.portions = line.replace('PORTIONS:', '').trim();
                }
            }

            // Fallback parsing if structured format not followed
            if (!result.description && text.length > 0) {
                result.description = text.substring(0, 100) + (text.length > 100 ? '...' : '');

                // Try to extract calories from any number in the text
                const calorieMatch = text.match(/(\d+)\s*calories?/i) || text.match(/\b(\d+)\b/);
                if (calorieMatch) {
                    const calories = parseInt(calorieMatch[1]);
                    if (calories > 10 && calories < 5000) { // Reasonable calorie range
                        result.calories = calories;
                    }
                }
            }

            // Validation
            if (!result.description) {
                result.description = 'Food item (description unavailable)';
            }
            if (!result.calories || result.calories < 1) {
                result.calories = 300; // Default reasonable estimate
                result.confidence = 'low';
            }

            return result;
        } catch (error) {
            console.error('Error parsing Gemini response:', error);
            throw new Error('Failed to parse AI response');
        }
    }
}

// Main Gemini API Class
class GeminiAPI {
    static async analyzeImage(imageFile) {
        const startTime = Date.now();

        try {
            console.log('Starting image analysis...');

            // Step 1: Compress image
            const compressedBlob = await ImageCompressor.compressImage(imageFile);
            const base64Image = await ImageCompressor.blobToBase64(compressedBlob);

            console.log('Image compressed successfully');

            // Step 2: Prepare API request
            const requestBody = {
                contents: [{
                    role: 'user',
                    parts: [
                        { text: CALORIE_PROMPT },
                        {
                            inline_data: {
                                mime_type: 'image/jpeg',
                                data: base64Image
                            }
                        }
                    ]
                }],
                generationConfig: {
                    temperature: 0.1, // Low temperature for consistent analysis
                    maxOutputTokens: 1000,
                    topP: 0.8,
                    topK: 10
                },
                safetySettings: [
                    {
                        category: 'HARM_CATEGORY_HARASSMENT',
                        threshold: 'BLOCK_ONLY_HIGH'
                    },
                    {
                        category: 'HARM_CATEGORY_HATE_SPEECH',
                        threshold: 'BLOCK_ONLY_HIGH'
                    }
                ]
            };

            // Step 3: Make API call with timeout
            const response = await this.makeAPICall(requestBody);

            // Step 4: Parse response
            const result = ResponseParser.parseGeminiResponse(response);

            // Add metadata
            result.timestamp = Date.now();
            result.processingTime = Date.now() - startTime;

            console.log('Analysis completed:', result);
            return result;

        } catch (error) {
            console.error('Error in analyzeImage:', error);

            // Return graceful fallback
            return {
                description: 'Food item (analysis failed)',
                calories: 300,
                confidence: 'low',
                portions: 'Standard serving',
                error: error.message,
                timestamp: Date.now(),
                processingTime: Date.now() - startTime
            };
        }
    }

    static async makeAPICall(requestBody) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), GEMINI_CONFIG.TIMEOUT_MS);

        try {
            const response = await fetch(`${GEMINI_CONFIG.API_ENDPOINT}?key=${GEMINI_CONFIG.API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response:', errorText);

                if (response.status === 429) {
                    throw new Error('API rate limit exceeded. Please try again later.');
                } else if (response.status === 403) {
                    throw new Error('API key invalid or quota exceeded.');
                } else if (response.status === 404) {
                    throw new Error('Model gemini-2.5-flash-lite not found or unavailable.');
                } else {
                    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
                }
            }

            const result = await response.json();

            // Check for API-level errors
            if (result.error) {
                throw new Error(result.error.message || 'API returned an error');
            }

            return result;

        } catch (error) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                throw new Error('Request timed out. Please try again.');
            }

            throw error;
        }
    }

    // Utility method to test API connection
    static async testConnection() {
        try {
            const testBody = {
                contents: [{
                    parts: [{ text: 'Hello, can you respond with just "OK"?' }]
                }]
            };

            const response = await this.makeAPICall(testBody);
            console.log('API Connection test successful:', response);
            return true;
        } catch (error) {
            console.error('API Connection test failed:', error);
            return false;
        }
    }
}

// Export for use in other files
window.GeminiAPI = GeminiAPI;
