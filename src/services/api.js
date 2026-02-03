export const API_CONFIG = {
    AOF_ENDPOINT: 'http://65.1.52.12:8000/ocr/aof',
    PAN_ENDPOINT: 'http://65.1.52.12:8000/ocr/pan',
    AADHAR_ENDPOINT: 'http://65.1.52.12:8000/ocr/aadhaar',
    GST_ENDPOINT: 'http://65.1.52.12:8001/ocr/gst',
    CHEQUE_ENDPOINT: 'http://65.1.52.12:8001/ocr/cheque',
    TIMEOUT: 5 * 60 * 60 * 1000
};

export async function callOCRSpaceAPI(file, type) {
    if (!file || !(file instanceof Blob)) {
        throw new Error('Invalid file object provided to API.');
    }

    // ===================== ENDPOINT SELECTION =====================
    let endpoint = API_CONFIG.AOF_ENDPOINT;

    switch (type?.toLowerCase()) {
        case 'form':
            endpoint = API_CONFIG.AOF_ENDPOINT;
            break;
        case 'pan':
            endpoint = API_CONFIG.PAN_ENDPOINT;
            break;
        case 'aadhar':
            endpoint = API_CONFIG.AADHAR_ENDPOINT;
            break;
        case 'gst':
            endpoint = API_CONFIG.GST_ENDPOINT;
            break;
        case 'cheque':
            endpoint = API_CONFIG.CHEQUE_ENDPOINT;
            break;    
    }
    // =============================================================

    try {
        const formData = new FormData();
        formData.append('file', file); // 🔥 THIS MATCHES curl -F "file=@Aof.pdf"

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

        const response = await fetch(endpoint, {
            method: 'POST',
            body: formData, // ❗ NO Content-Type header
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error: ${response.status} ${errorText}`);
        }

        const result = await response.json();
        console.log('API Response:', result);

        if (result && result.data) {
            const rawData = result.data;
            const keys = Object.keys(rawData);

            if (keys.length > 0 && typeof rawData[keys[0]] !== 'object') {
                return { page1: rawData };
            }
            return rawData;
        }

        return result;

    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Request timed out after 5 hours.');
        } else if (error.message?.includes('Failed to fetch')) {
            throw new Error('Network error.');
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
