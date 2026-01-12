export const STORAGE_KEYS = {
    FORM_DATA: 'ocr_form_extraction',
    PAN_DATA: 'ocr_pan_extraction',
    GST_DATA: 'ocr_gst_extraction',
    AADHAR_DATA: 'ocr_aadhar_extraction',
    FORM_FILE: 'ocr_form_file',
    PAN_FILE: 'ocr_pan_file',
    GST_FILE: 'ocr_gst_file',
    AADHAR_FILE: 'ocr_aadhar_file'
};

export const getKeysForType = (type) => {
    switch (type) {
        case 'form': return { data: STORAGE_KEYS.FORM_DATA, file: STORAGE_KEYS.FORM_FILE };
        case 'pan': return { data: STORAGE_KEYS.PAN_DATA, file: STORAGE_KEYS.PAN_FILE };
        case 'gst': return { data: STORAGE_KEYS.GST_DATA, file: STORAGE_KEYS.GST_FILE };
        case 'aadhar': return { data: STORAGE_KEYS.AADHAR_DATA, file: STORAGE_KEYS.AADHAR_FILE };
        default: return { data: null, file: null };
    }
};

export function saveFileToStorage(file, storageKey) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const fileData = {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    data: e.target.result,
                    lastModified: file.lastModified
                };
                localStorage.setItem(storageKey, JSON.stringify(fileData));
                resolve(true);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export function loadFileFromStorage(storageKey) {
    try {
        const fileDataStr = localStorage.getItem(storageKey);
        if (!fileDataStr) return null;

        const fileData = JSON.parse(fileDataStr);

        // Convert base64 back to blob
        const byteString = atob(fileData.data.split(',')[1]);
        const mimeString = fileData.data.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);

        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        const blob = new Blob([ab], { type: mimeString });
        return new File([blob], fileData.name, {
            type: fileData.type,
            lastModified: fileData.lastModified
        });
    } catch (error) {
        console.error('Error loading file from storage:', error);
        return null;
    }
}

export function clearGridStorage(type) {
    const { data: dataKey, file: fileKey } = getKeysForType(type);
    if (dataKey) localStorage.removeItem(dataKey);
    if (fileKey) localStorage.removeItem(fileKey);
}
