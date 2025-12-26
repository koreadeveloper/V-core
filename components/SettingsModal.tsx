import React, { useState, useEffect } from 'react';
import { X, Globe, Cpu, MessageSquare, Sliders } from 'lucide-react';
import { getTranslations, Language } from '../translations';

export interface AppSettings {
    serviceLanguage: Language;
    aiOutputLanguage: Language;
    selectedModel: string;
    sttHintLanguage: string;
    maxTokens: number;
}

export const defaultSettings: AppSettings = {
    serviceLanguage: 'ko',
    aiOutputLanguage: 'ko',
    selectedModel: 'llama-3.3-70b-versatile',
    sttHintLanguage: 'ko',
    maxTokens: 4096,
};

const SETTINGS_KEY = 'vcore_settings';

export const loadSettings = (): AppSettings => {
    try {
        const saved = localStorage.getItem(SETTINGS_KEY);
        if (saved) {
            return { ...defaultSettings, ...JSON.parse(saved) };
        }
    } catch (e) {
        console.error('Failed to load settings:', e);
    }
    return defaultSettings;
};

export const saveSettings = (settings: AppSettings): void => {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
        console.error('Failed to save settings:', e);
    }
};

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: AppSettings;
    onSave: (settings: AppSettings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
    const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
    const t = getTranslations(localSettings.serviceLanguage);

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        saveSettings(localSettings);
        onSave(localSettings);
        onClose();
    };

    const models = [
        { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B Versatile' },
        { value: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B Instant' },
        { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B' },
        { value: 'gemma2-9b-it', label: 'Gemma 2 9B' },
    ];

    const languages = [
        { value: 'ko', label: localSettings.serviceLanguage === 'ko' ? '한국어' : 'Korean' },
        { value: 'en', label: localSettings.serviceLanguage === 'ko' ? '영어' : 'English' },
    ];

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="bg-zinc-900 rounded-2xl border border-white/10 max-w-md w-full">
                <div className="border-b border-white/10 p-6 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Sliders size={20} />
                        {t.settingsTitle}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                            <Globe size={16} />
                            {t.settingsServiceLanguage}
                        </label>
                        <select
                            value={localSettings.serviceLanguage}
                            onChange={(e) => setLocalSettings({ ...localSettings, serviceLanguage: e.target.value as Language })}
                            className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-400/50"
                        >
                            {languages.map((lang) => (
                                <option key={lang.value} value={lang.value}>{lang.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                            <MessageSquare size={16} />
                            {t.settingsAILanguage}
                        </label>
                        <select
                            value={localSettings.aiOutputLanguage}
                            onChange={(e) => setLocalSettings({ ...localSettings, aiOutputLanguage: e.target.value as Language })}
                            className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-400/50"
                        >
                            {languages.map((lang) => (
                                <option key={lang.value} value={lang.value}>{lang.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                            <Cpu size={16} />
                            {t.settingsModelSelection}
                        </label>
                        <select
                            value={localSettings.selectedModel}
                            onChange={(e) => setLocalSettings({ ...localSettings, selectedModel: e.target.value })}
                            className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-400/50"
                        >
                            {models.map((model) => (
                                <option key={model.value} value={model.value}>{model.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">
                            {t.settingsMaxTokens}: {localSettings.maxTokens}
                        </label>
                        <input
                            type="range"
                            min="1024"
                            max="8192"
                            step="512"
                            value={localSettings.maxTokens}
                            onChange={(e) => setLocalSettings({ ...localSettings, maxTokens: parseInt(e.target.value) })}
                            className="w-full accent-lime-400"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>1024</span>
                            <span>8192</span>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 p-4 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-zinc-800 text-white rounded-xl font-medium hover:bg-zinc-700 transition-colors"
                    >
                        {t.settingsCancel}
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 px-4 py-3 bg-lime-400 text-black rounded-xl font-bold hover:bg-lime-300 transition-colors"
                    >
                        {t.settingsSave}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
