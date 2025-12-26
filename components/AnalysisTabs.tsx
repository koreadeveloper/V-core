import React, { useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BookOpen, BrainCircuit, GraduationCap, PenTool } from 'lucide-react';
import { VideoMetadata } from '../types';
import NotesTab from './NotesTab';
import MindMap from './visuals/MindMap';
import Quiz from './learning/Quiz';
import FlashCard from './learning/FlashCard';

interface AnalysisTabsProps {
    metadata: VideoMetadata;
    summary: string;
    transcript: string;
}

const AnalysisTabs: React.FC<AnalysisTabsProps> = ({ metadata, summary, transcript }) => {
    const [activeTab, setActiveTab] = useState<'notes' | 'visuals' | 'learning' | 'creative'>('notes');
    const [learningSubTab, setLearningSubTab] = useState<'flashcards' | 'quiz'>('flashcards');

    // Custom Tabs Implementation (Shadcn-style)
    const tabs = [
        { id: 'notes', label: 'Notes', icon: BookOpen },
        { id: 'visuals', label: 'Visuals', icon: BrainCircuit },
        { id: 'learning', label: 'Learning', icon: GraduationCap },
        { id: 'creative', label: 'Creative', icon: PenTool },
    ];

    return (
        <div className="w-full max-w-7xl mx-auto px-4 mt-8">
            {/* Tab Headers */}
            <div className="flex items-center justify-center mb-8">
                <div className="flex bg-zinc-900/50 p-1 rounded-2xl border border-white/10 backdrop-blur-sm">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={twMerge(
                                clsx(
                                    "flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 font-medium text-sm",
                                    activeTab === tab.id
                                        ? "bg-lime-400 text-black shadow-lg shadow-lime-400/20 scale-105"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                )
                            )}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[600px] animate-in slide-in-from-bottom-4 duration-500">

                {activeTab === 'notes' && (
                    <NotesTab content={summary} />
                )}

                {activeTab === 'visuals' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-white mb-4">Mental Map</h2>
                        <MindMap transcript={transcript} title={metadata.title} />
                    </div>
                )}

                {activeTab === 'learning' && (
                    <div className="w-full">
                        {/* Sub Tabs for Learning */}
                        <div className="flex justify-center mb-8 gap-4">
                            <button
                                onClick={() => setLearningSubTab('flashcards')}
                                className={twMerge(clsx("px-4 py-2 rounded-lg border text-sm font-bold transition-colors",
                                    learningSubTab === 'flashcards' ? "bg-white text-black border-white" : "border-white/20 text-gray-400 hover:border-white/50"
                                ))}
                            >
                                Flashcards
                            </button>
                            <button
                                onClick={() => setLearningSubTab('quiz')}
                                className={twMerge(clsx("px-4 py-2 rounded-lg border text-sm font-bold transition-colors",
                                    learningSubTab === 'quiz' ? "bg-white text-black border-white" : "border-white/20 text-gray-400 hover:border-white/50"
                                ))}
                            >
                                Quiz
                            </button>
                        </div>

                        {learningSubTab === 'flashcards' && <FlashCard transcript={transcript} title={metadata.title} />}
                        {learningSubTab === 'quiz' && <Quiz transcript={transcript} title={metadata.title} />}
                    </div>
                )}

                {activeTab === 'creative' && (
                    <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                        <PenTool size={48} className="mb-4 opacity-50" />
                        <p>Blog post generation coming soon...</p>
                    </div>
                )}

            </div>
        </div>
    );
};

export default AnalysisTabs;
