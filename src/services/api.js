export const API_CONFIG = {
    OCR_ENDPOINT: 'http://localhost/atlas-mock-api/eq.php',
    // OCR_ENDPOINT: 'http://65.1.52.12:8000/ocr',
    TIMEOUT: 5 * 60 * 60 * 1000 // 5 hours in milliseconds
};

const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // Remove data URL prefix to get just the base64 string
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
        };
        reader.onerror = (error) => reject(error);
    });
};

export async function callOCRSpaceAPI(file, type) {
    if (!file || !(file instanceof Blob)) {
        throw new Error('Invalid file object provided to API.');
    }

    try {
        const base64File = await fileToBase64(file);

        const payload = {
            filename: type, // User requested mapping type to 'filename'
            file: base64File
        };
        console.log(payload);

        console.log(`Preparing to send JSON payload with filename (type): ${type}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

        const response = await fetch(API_CONFIG.OCR_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error: ${response.status} ${errorText}`);
        }

        const result = await response.json();
        console.log('API Response:', result);

        // Check if the response follows the structure { status: 'success', data: { ... } }
        if (result && result.data) {
            const rawData = result.data;
            const keys = Object.keys(rawData);

            // Check if the data is flat (not paginated)
            // If the first value is not an object, assume it's a flat list of fields and wrap it
            if (keys.length > 0 && typeof rawData[keys[0]] !== 'object') {
                console.log('Detected flat data structure, wrapping in page1');
                return { page1: rawData };
            }

            return rawData;
        }
        return result;

    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Request timed out after 5 hours. Please try again.');
        } else if (error.message && error.message.includes('Failed to fetch')) {
            throw new Error('Network error. Please check your connection and try again.');
        } else {
            console.error('API call error:', error);
            throw error;
        }
    }
}

export function getMockDataForGrid(gridIndex) {
    switch (gridIndex) {
        case 0: return {
            "page1": {
                "full_name": "RAMASAMY RAJULU",
                "address": "DUBAI KURUKU SANDHU, DUBAI",
                "email": "ramasamy@example.com",
                "phone": "+91 9876543210"
            },
            "page2": {
                "date_of_birth": "15-08-1985",
                "gender": "Male",
                "occupation": "Software Developer"
            }
        };
        case 1: return {
            "page1": {
                "pan_number": "DCZPS123TS",
                "full_name": "RAMASAMY RAJULU",
                "father_name": "RAJULU KUMAR",
                "date_of_birth": "15-08-1985"
            }
        };
        case 2: return {
            "page1": {
                "gst_number": "27AADCS1234T1ZZ",
                "legal_name": "RAJULU ENTERPRISES",
                "trade_name": "RAJULU TRADERS",
                "registration_date": "01-07-2017"
            }
        };
        case 3: return {
            "page1": {
                "aadhar_number": "1234 5678 9012",
                "full_name": "RAMASAMY RAJULU",
                "dob": "15-08-1985",
                "gender": "Male",
                "address": "No 123, Some Street, Some City, Some State, 123456"
            }
        };
        default: return { page1: {} };
    }
}
