import React, { useState, useEffect } from 'react';
import {
    FolderPlus,
    MessageCircle,
    Search,
    Tag,
    StickyNote,
    Sparkles,
    Folder,
    Play
} from 'lucide-react';
import { loadHistory, getCategories, updateCategory, updateNotes, addCategory, HistoryItem } from '../stores/historyStore';
import { getTranslations, Language } from '../translations';
import ChatModal from '../components/ChatModal';

interface KnowledgePageProps {
    language: Language;
    onViewAnalysis: (item: HistoryItem) => void;
}

const KnowledgePage: React.FC<KnowledgePageProps> = ({ language, onViewAnalysis }) => {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [editingNotes, setEditingNotes] = useState<string | null>(null);
    const [noteText, setNoteText] = useState('');
    const t = getTranslations(language);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const data = loadHistory();
        setHistory(data);
        setCategories(getCategories());
    };

    const filteredHistory = history.filter((item) => {
        const matchesCategory = !selectedCategory || item.category === selectedCategory;
        const matchesSearch = !searchQuery ||
            item.metadata.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.analysis.summary.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleAddCategory = () => {
        const name = prompt(language === 'ko' ? '새 카테고리 이름:' : 'New category name:');
        if (name && !categories.includes(name)) {
            addCategory(name);
            setCategories([...categories, name]);
        }
    };

    const handleUpdateCategory = (id: string, category: string) => {
        updateCategory(id, category);
        loadData();
    };

    const handleSaveNotes = (id: string) => {
        updateNotes(id, noteText);
        setEditingNotes(null);
        loadData();
    };

    // Combine all video transcripts for RAG chat
    const combinedContext = filteredHistory
        .map((h) => `[${h.metadata.title}]\n${h.analysis.script}`)
        .join('\n\n---\n\n')
        .slice(0, 8000);

    return (
        <div className="min-h-screen bg-zinc-950 p-12">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-4xl font-extrabold mb-4">{t.knowledgeTitle}</h1>
                        <p className="text-gray-500 text-lg">{t.knowledgeDesc}</p>
                    </div>
                    <button
                        onClick={() => setIsChatOpen(true)}
                        className="ramp-button px-6 py-3 rounded-xl font-bold flex items-center gap-2"
                    >
                        <Sparkles size={20} />
                        {t.chatWithVideos}
                    </button>
                </div>

                <div className="grid grid-cols-12 gap-8">
                    {/* Sidebar - Categories */}
                    <div className="col-span-3">
                        <div className="glass-card rounded-2xl p-6">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                                {language === 'ko' ? '카테고리' : 'Categories'}
                            </h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${!selectedCategory ? 'bg-lime-400/20 text-lime-400' : 'text-gray-400 hover:bg-white/5'
                                        }`}
                                >
                                    <Folder size={18} />
                                    {t.allCategories}
                                    <span className="ml-auto text-sm">{history.length}</span>
                                </button>

                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${selectedCategory === cat ? 'bg-lime-400/20 text-lime-400' : 'text-gray-400 hover:bg-white/5'
                                            }`}
                                    >
                                        <Tag size={18} />
                                        {cat}
                                        <span className="ml-auto text-sm">
                                            {history.filter((h) => h.category === cat).length}
                                        </span>
                                    </button>
                                ))}

                                <button
                                    onClick={handleAddCategory}
                                    className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 text-gray-600 hover:text-lime-400 hover:bg-white/5 transition-colors"
                                >
                                    <FolderPlus size={18} />
                                    {t.addCategory}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="col-span-9">
                        {/* Search */}
                        <div className="mb-6">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={t.searchHistory}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-lime-400/50"
                                />
                            </div>
                        </div>

                        {/* Video List */}
                        <div className="space-y-4">
                            {filteredHistory.map((item) => (
                                <div
                                    key={item.id}
                                    className="glass-card rounded-2xl overflow-hidden group"
                                >
                                    <div className="flex gap-6 p-6">
                                        {/* Thumbnail */}
                                        <div
                                            className="w-48 h-28 rounded-xl overflow-hidden flex-shrink-0 relative cursor-pointer"
                                            onClick={() => onViewAnalysis(item)}
                                        >
                                            <img
                                                src={item.metadata.thumbnail}
                                                alt={item.metadata.title}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Play size={24} className="text-white" fill="currentColor" />
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3
                                                className="font-bold text-lg text-white mb-2 cursor-pointer hover:text-lime-400 transition-colors"
                                                onClick={() => onViewAnalysis(item)}
                                            >
                                                {item.metadata.title}
                                            </h3>
                                            <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                                                {item.analysis.summary}
                                            </p>
                                            <div className="flex items-center gap-4">
                                                <select
                                                    value={item.category || ''}
                                                    onChange={(e) => handleUpdateCategory(item.id, e.target.value)}
                                                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-gray-400 focus:outline-none"
                                                >
                                                    <option value="">{language === 'ko' ? '카테고리 선택' : 'Select category'}</option>
                                                    {categories.map((cat) => (
                                                        <option key={cat} value={cat}>{cat}</option>
                                                    ))}
                                                </select>
                                                <button
                                                    onClick={() => {
                                                        setEditingNotes(item.id);
                                                        setNoteText(item.notes || '');
                                                    }}
                                                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-lime-400"
                                                >
                                                    <StickyNote size={14} />
                                                    {t.addNote}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Notes Editor */}
                                    {editingNotes === item.id && (
                                        <div className="px-6 pb-6">
                                            <textarea
                                                value={noteText}
                                                onChange={(e) => setNoteText(e.target.value)}
                                                placeholder={language === 'ko' ? '메모를 입력하세요...' : 'Enter your notes...'}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-lime-400/50 min-h-[100px]"
                                            />
                                            <div className="flex justify-end gap-2 mt-2">
                                                <button
                                                    onClick={() => setEditingNotes(null)}
                                                    className="px-4 py-2 text-gray-400 hover:text-white"
                                                >
                                                    {language === 'ko' ? '취소' : 'Cancel'}
                                                </button>
                                                <button
                                                    onClick={() => handleSaveNotes(item.id)}
                                                    className="px-4 py-2 bg-lime-400 text-black rounded-lg font-bold"
                                                >
                                                    {language === 'ko' ? '저장' : 'Save'}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Existing Notes */}
                                    {item.notes && editingNotes !== item.id && (
                                        <div className="px-6 pb-6">
                                            <div className="bg-white/5 rounded-xl p-4 text-sm text-gray-400 italic">
                                                {item.notes}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* RAG Chat Modal */}
            <ChatModal
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                videoContext={combinedContext}
                videoTitle={language === 'ko' ? '저장된 모든 영상' : 'All Saved Videos'}
                language={language}
            />
        </div>
    );
};

export default KnowledgePage;
