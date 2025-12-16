import axios from 'axios';
import { authenticatedAxios } from '@/helpers/api';

const API_URL = "https://barberdev-microservice.onrender.com";

// --- Interfaces based on your Java DTOs ---

export interface ChatRequestDto {
    userMessage: string;
    recommendationContext?: string;
}

export interface ChatResponseDto {
    reply: string;
}

export interface HaircutAnalysisResponseDto {
    recommendedStyle: string;
    confidenceLevel: string;
    analysisReport: string;
}

// --- Chat Service ---

export const chatWithAi = async (message: string, context?: string): Promise<string> => {
    try {
        const { data } = await axios.post<ChatResponseDto>(`${API_URL}/api/chat/ask`, {
            userMessage: message,
            recommendationContext: context
        });
        return data.reply;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Error al comunicarse con la IA');
        }
        throw error;
    }
};

// --- Image Analysis Service ---

export const analyzeHaircutImage = async (file: File, userId: string = 'anonymous'): Promise<HaircutAnalysisResponseDto> => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', userId);

        const { data } = await axios.post<HaircutAnalysisResponseDto>(
            `${API_URL}/api/haircut/analyze`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            }
        );
        return data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Error al analizar la imagen');
        }
        throw error;
    }
};
