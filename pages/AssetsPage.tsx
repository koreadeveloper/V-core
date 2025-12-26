import React, { useState } from 'react';
import {
    FileText,
    BookOpen,
    Download,
    Plus,
    Trash2,
    Copy,
    Check,
    Sparkles
} from 'lucide-react';
import { getTranslations, Language } from '../translations';

interface AssetsPageProps {
    language: Language;
}

interface Prompt {
    id: string;
    name: string;
    content: string;
    category: string;
}

interface GlossaryItem {
    id: string;
    term: string;
    definition: string;
}

const PROMPTS_KEY = 'vcore_prompts';
const GLOSSARY_KEY = 'vcore_glossary';

const AssetsPage: React.FC<AssetsPageProps> = ({ language }) => {
    const t = getTranslations(language);
    const [activeTab, setActiveTab] = useState<'prompts' | 'glossary' | 'downloads'>('prompts');
    const [prompts, setPrompts] = useState<Prompt[]>(() => {
        const saved = localStorage.getItem(PROMPTS_KEY);
        return saved ? JSON.parse(saved) : [];
    });
    const [glossary, setGlossary] = useState<GlossaryItem[]>(() => {
        const saved = localStorage.getItem(GLOSSARY_KEY);
        return saved ? JSON.parse(saved) : [];
    });
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const savePrompts = (newPrompts: Prompt[]) => {
        setPrompts(newPrompts);
        localStorage.setItem(PROMPTS_KEY, JSON.stringify(newPrompts));
    };

    const saveGlossary = (newGlossary: GlossaryItem[]) => {
        setGlossary(newGlossary);
        localStorage.setItem(GLOSSARY_KEY, JSON.stringify(newGlossary));
    };

    const handleAddPrompt = () => {
        const name = prompt(language === 'ko' ? '프롬프트 이름:' : 'Prompt name:');
        const content = prompt(language === 'ko' ? '프롬프트 내용:' : 'Prompt content:');
        if (name && content) {
            const newPrompt: Prompt = {
                id: Date.now().toString(),
                name,
                content,
                category: 'custom'
            };
            savePrompts([...prompts, newPrompt]);
        }
    };

    const handleAddTerm = () => {
        const term = prompt(language === 'ko' ? '용어:' : 'Term:');
        const definition = prompt(language === 'ko' ? '정의:' : 'Definition:');
        if (term && definition) {
            const newTerm: GlossaryItem = {
                id: Date.now().toString(),
                term,
                definition
            };
            saveGlossary([...glossary, newTerm]);
        }
    };

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const tabs = [
        { id: 'prompts', label: t.promptLibrary, icon: Sparkles },
        { id: 'glossary', label: t.glossary, icon: BookOpen },
        { id: 'downloads', label: t.downloadCenter, icon: Download },
    ];

    return (
        <div className="min-h-screen bg-zinc-950 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-extrabold mb-8">{t.assetsPageTitle}</h1>

                <div className="flex gap-2 mb-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === tab.id
                                    ? 'bg-lime-400 text-black'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'prompts' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <p className="text-gray-400">
                                {language === 'ko' ? '자주 사용하는 프롬프트를 저장하세요' : 'Save your frequently used prompts'}
                            </p>
                            <button
                                onClick={handleAddPrompt}
                                className="flex items-center gap-2 px-4 py-2 bg-lime-400 text-black rounded-lg font-bold hover:bg-lime-300"
                            >
                                <Plus size={18} />
                                {t.addPrompt}
                            </button>
                        </div>

                        {prompts.length === 0 ? (
                            <div className="text-center py-16 text-gray-500">
                                {language === 'ko' ? '저장된 프롬프트가 없습니다' : 'No saved prompts'}
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {prompts.map((p) => (
                                    <div key={p.id} className="glass-card rounded-xl p-4 border border-white/10">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-white">{p.name}</h3>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleCopy(p.content, p.id)}
                                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                                >
                                                    {copiedId === p.id ? <Check size={16} className="text-lime-400" /> : <Copy size={16} className="text-gray-400" />}
                                                </button>
                                                <button
                                                    onClick={() => savePrompts(prompts.filter(x => x.id !== p.id))}
                                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={16} className="text-red-400" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-400">{p.content}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'glossary' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <p className="text-gray-400">
                                {language === 'ko' ? '자주 사용하는 용어를 관리하세요' : 'Manage your frequently used terms'}
                            </p>
                            <button
                                onClick={handleAddTerm}
                                className="flex items-center gap-2 px-4 py-2 bg-lime-400 text-black rounded-lg font-bold hover:bg-lime-300"
                            >
                                <Plus size={18} />
                                {t.addTerm}
                            </button>
                        </div>

                        {glossary.length === 0 ? (
                            <div className="text-center py-16 text-gray-500">
                                {language === 'ko' ? '저장된 용어가 없습니다' : 'No saved terms'}
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {glossary.map((g) => (
                                    <div key={g.id} className="glass-card rounded-xl p-4 border border-white/10">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-lime-400">{g.term}</h3>
                                                <p className="text-sm text-gray-400 mt-1">{g.definition}</p>
                                            </div>
                                            <button
                                                onClick={() => saveGlossary(glossary.filter(x => x.id !== g.id))}
                                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} className="text-red-400" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'downloads' && (
                    <div className="text-center py-16 text-gray-500">
                        {language === 'ko' ? '다운로드 기능이 곧 출시됩니다' : 'Download feature coming soon'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssetsPage;
