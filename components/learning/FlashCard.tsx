import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { generateFlashcards } from '../../services/groqService';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

interface FlashCardProps {
    transcript: string;
    title: string;
}

const FlashCard: React.FC<FlashCardProps> = ({ transcript, title }) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['flashcards', title],
        queryFn: () => generateFlashcards(transcript, title),
        enabled: !!transcript,
        staleTime: Infinity,
    });

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <div className="w-12 h-12 border-4 border-lime-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 animate-pulse">Creating Flashcards...</p>
            </div>
        );
    }

    if (error || !data?.flashcards) {
        return <div className="text-red-400 text-center p-10">Failed to load flashcards.</div>;
    }

    const cards = data.flashcards;
    const currentCard = cards[currentIndex];

    const nextCard = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsFlipped(false);
        setTimeout(() => setCurrentIndex((prev) => (prev + 1) % cards.length), 200);
    };

    const prevCard = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsFlipped(false);
        setTimeout(() => setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length), 200);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[600px] perspective-1000">

            <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Flashcards</h2>
                <p className="text-gray-400">Click card to flip. Use arrows to navigate.</p>
            </div>

            <div className="relative w-full max-w-2xl aspect-[16/9] cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
                <motion.div
                    className="w-full h-full relative preserve-3d transition-all duration-500"
                    initial={false}
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {/* Front */}
                    <div className="absolute inset-0 backface-hidden bg-zinc-800 rounded-3xl border border-white/10 flex flex-col items-center justify-center p-12 shadow-2xl group-hover:border-lime-400/30 transition-colors">
                        <span className="text-lime-400 font-mono text-sm absolute top-8 left-8">TERM</span>
                        <h3 className="text-4xl font-black text-white text-center leading-tight">
                            {currentCard.term}
                        </h3>
                        <div className="absolute bottom-6 right-6 text-gray-500 text-xs flex items-center gap-2">
                            <RotateCcw size={14} /> Click to flip
                        </div>
                    </div>

                    {/* Back */}
                    <div
                        className="absolute inset-0 backface-hidden bg-lime-400 rounded-3xl flex flex-col items-center justify-center p-12 shadow-2xl text-black"
                        style={{ transform: 'rotateY(180deg)' }}
                    >
                        <span className="font-mono text-sm absolute top-8 left-8 opacity-50 font-bold">DEFINITION</span>
                        <p className="text-2xl font-bold text-center leading-relaxed">
                            {currentCard.definition}
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-8 mt-12 bg-white/5 px-6 py-3 rounded-2xl border border-white/5 backdrop-blur-sm">
                <button
                    onClick={prevCard}
                    className="p-4 hover:bg-white/10 rounded-xl text-white transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <span className="font-mono text-lime-400 font-bold text-lg min-w-[60px] text-center">
                    {currentIndex + 1} / {cards.length}
                </span>
                <button
                    onClick={nextCard}
                    className="p-4 hover:bg-white/10 rounded-xl text-white transition-colors"
                >
                    <ChevronRight size={24} />
                </button>
            </div>

        </div>
    );
};

export default FlashCard;
