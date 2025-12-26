import React, { useState, useEffect } from 'react';
import {
    Search,
    Pin,
    Trash2,
    Clock,
    Play,
    CheckCircle2,
    XCircle,
    Star
} from 'lucide-react';
import { loadHistory, deleteFromHistory, togglePin, searchHistory, HistoryItem } from '../stores/historyStore';
import { getTranslations, Language } from '../translations';

interface RecentPageProps {
    language: Language;
    onViewAnalysis: (item: HistoryItem) => void;
}

const RecentPage: React.FC<RecentPageProps> = ({ language, onViewAnalysis }) => {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const t = getTranslations(language);

    useEffect(() => {
        loadHistoryData();
    }, []);

    const loadHistoryData = () => {
        const data = loadHistory();
        setHistory(data);
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query.trim()) {
            setHistory(searchHistory(query));
        } else {
            loadHistoryData();
        }
    };

    const handleDelete = (id: string) => {
        deleteFromHistory(id);
        loadHistoryData();
    };

    const handleTogglePin = (id: string) => {
        togglePin(id);
        loadHistoryData();
    };

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        if (language === 'ko') {
            return date.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        }
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="min-h-screen bg-zinc-950 p-12">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-extrabold mb-4">{t.recentTitle}</h1>
                    <p className="text-gray-500 text-lg">{t.recentDesc}</p>
                </div>

                {/* Search */}
                <div className="mb-8">
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder={t.searchHistory}
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-lime-400/50"
                        />
                    </div>
                </div>

                {/* History Cards */}
                {history.length === 0 ? (
                    <div className="text-center py-24">
                        <Clock size={64} className="mx-auto mb-6 text-gray-700" />
                        <p className="text-xl text-gray-500">{t.noHistory}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {history.map((item) => (
                            <div
                                key={item.id}
                                className="glass-card rounded-2xl overflow-hidden group hover:border-lime-400/30 transition-all cursor-pointer"
                                onClick={() => onViewAnalysis(item)}
                            >
                                {/* Thumbnail */}
                                <div className="relative aspect-video">
                                    <img
                                        src={item.metadata.thumbnail}
                                        alt={item.metadata.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="w-12 h-12 bg-lime-400 rounded-full flex items-center justify-center">
                                            <Play size={24} className="text-black ml-1" fill="currentColor" />
                                        </div>
                                    </div>
                                    <div className="absolute top-3 right-3 bg-black/80 px-2 py-1 rounded text-xs font-mono">
                                        {item.metadata.duration}
                                    </div>
                                    {item.isPinned && (
                                        <div className="absolute top-3 left-3 bg-lime-400 text-black px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                                            <Star size={10} fill="currentColor" />
                                            {t.pinned}
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    <h3 className="font-bold text-white mb-2 line-clamp-2 group-hover:text-lime-400 transition-colors">
                                        {item.metadata.title}
                                    </h3>
                                    <p className="text-xs text-gray-500 mb-3 flex items-center gap-2">
                                        <Clock size={12} />
                                        {formatDate(item.timestamp)}
                                    </p>
                                    <p className="text-sm text-gray-400 line-clamp-2 mb-4">
                                        {item.analysis.summary}
                                    </p>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleTogglePin(item.id);
                                            }}
                                            className={`p-2 rounded-lg transition-colors ${item.isPinned
                                                    ? 'bg-lime-400/20 text-lime-400'
                                                    : 'bg-white/5 text-gray-500 hover:text-white'
                                                }`}
                                        >
                                            <Pin size={16} />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(item.id);
                                            }}
                                            className="p-2 rounded-lg bg-white/5 text-gray-500 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <span className="ml-auto text-[10px] text-gray-600 flex items-center gap-1">
                                            <CheckCircle2 size={12} className="text-emerald-500" />
                                            {language === 'ko' ? '분석 완료' : 'Analyzed'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecentPage;
