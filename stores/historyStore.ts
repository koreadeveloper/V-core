// History Store - LocalStorage-based analysis history management

import { VideoMetadata, AnalysisResult, GeneratedContent } from '../types';

export interface HistoryItem {
    id: string;
    timestamp: number;
    metadata: VideoMetadata;
    analysis: AnalysisResult;
    assets: GeneratedContent;
    isPinned: boolean;
    category?: string;
    notes?: string;
}

const HISTORY_KEY = 'vcore_history';
const CATEGORIES_KEY = 'vcore_categories';
const MAX_HISTORY_ITEMS = 50;

export const loadHistory = (): HistoryItem[] => {
    try {
        const saved = localStorage.getItem(HISTORY_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.error('Failed to load history:', e);
    }
    return [];
};

export const saveHistory = (history: HistoryItem[]): void => {
    try {
        // Limit history size
        const trimmed = history.slice(0, MAX_HISTORY_ITEMS);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
    } catch (e) {
        console.error('Failed to save history:', e);
    }
};

export const addToHistory = (
    metadata: VideoMetadata,
    analysis: AnalysisResult,
    assets: GeneratedContent
): HistoryItem => {
    const history = loadHistory();

    // Check if already exists
    const existingIndex = history.findIndex((h) => h.metadata.id === metadata.id);

    const newItem: HistoryItem = {
        id: `${metadata.id}_${Date.now()}`,
        timestamp: Date.now(),
        metadata,
        analysis,
        assets,
        isPinned: false,
    };

    if (existingIndex >= 0) {
        // Update existing
        history[existingIndex] = { ...history[existingIndex], ...newItem, isPinned: history[existingIndex].isPinned };
    } else {
        // Add new at beginning
        history.unshift(newItem);
    }

    saveHistory(history);
    return newItem;
};

export const deleteFromHistory = (id: string): void => {
    const history = loadHistory();
    const filtered = history.filter((h) => h.id !== id);
    saveHistory(filtered);
};

export const togglePin = (id: string): void => {
    const history = loadHistory();
    const index = history.findIndex((h) => h.id === id);
    if (index >= 0) {
        history[index].isPinned = !history[index].isPinned;
        // Move pinned to top
        history.sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return b.timestamp - a.timestamp;
        });
        saveHistory(history);
    }
};

export const updateCategory = (id: string, category: string): void => {
    const history = loadHistory();
    const index = history.findIndex((h) => h.id === id);
    if (index >= 0) {
        history[index].category = category;
        saveHistory(history);
    }
};

export const updateNotes = (id: string, notes: string): void => {
    const history = loadHistory();
    const index = history.findIndex((h) => h.id === id);
    if (index >= 0) {
        history[index].notes = notes;
        saveHistory(history);
    }
};

export const searchHistory = (query: string): HistoryItem[] => {
    const history = loadHistory();
    const lowerQuery = query.toLowerCase();
    return history.filter((h) =>
        h.metadata.title.toLowerCase().includes(lowerQuery) ||
        h.analysis.summary.toLowerCase().includes(lowerQuery) ||
        h.analysis.keywords.some((k) => k.toLowerCase().includes(lowerQuery))
    );
};

// Load categories from dedicated storage
export const loadCategories = (): string[] => {
    try {
        const saved = localStorage.getItem(CATEGORIES_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.error('Failed to load categories:', e);
    }
    return [];
};

// Save categories to dedicated storage
export const saveCategories = (categories: string[]): void => {
    try {
        localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    } catch (e) {
        console.error('Failed to save categories:', e);
    }
};

// Add a new category
export const addCategory = (category: string): void => {
    const categories = loadCategories();
    if (!categories.includes(category)) {
        categories.push(category);
        saveCategories(categories);
    }
};

// Delete a category
export const deleteCategory = (category: string): void => {
    const categories = loadCategories();
    const filtered = categories.filter(c => c !== category);
    saveCategories(filtered);
};

// Get all categories (merged from storage and history items)
export const getCategories = (): string[] => {
    const storedCategories = loadCategories();
    const history = loadHistory();
    const historyCategories = new Set<string>();
    history.forEach((h) => {
        if (h.category) historyCategories.add(h.category);
    });

    // Merge both sources
    const allCategories = new Set([...storedCategories, ...historyCategories]);
    return Array.from(allCategories);
};
