import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_URL

interface SeparateVoiceResponse {
    status: 'success' | 'error';
    output?: { bass: string, drums: string, other: string, vocals: string };
    message?: string;
}
export const getVoice = async () => {
    const res = await fetch(`${BASE_URL}/ping`);
    return res.json();
}

export const separateVoice = async (formData: FormData, onProgress?: (percent: number) => void) => {
    const res = await axios.post<SeparateVoiceResponse>(`${import.meta.env.VITE_API_URL}/demucs/separate`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
                const percent = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                );
                onProgress?.(percent);
            }
        },
    })
    return res.data
}
