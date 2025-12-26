import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { generateQuiz } from '../../services/groqService';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface QuizProps {
    transcript: string;
    title: string;
}

const Quiz: React.FC<QuizProps> = ({ transcript, title }) => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['quiz', title],
        queryFn: () => generateQuiz(transcript, title),
        enabled: !!transcript,
        staleTime: Infinity,
    });

    const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
    const [showExplanation, setShowExplanation] = useState<{ [key: number]: boolean }>({});

    const handleSelect = (qIndex: number, optionIndex: number) => {
        if (selectedAnswers[qIndex] !== undefined) return; // Prevent changing answer
        setSelectedAnswers(prev => ({ ...prev, [qIndex]: optionIndex }));
        setShowExplanation(prev => ({ ...prev, [qIndex]: true }));
    };

    function cn(...inputs: (string | undefined | null | false)[]) {
        return twMerge(clsx(inputs));
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
                <div className="w-12 h-12 border-4 border-lime-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 animate-pulse">Generating Quiz...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-4 text-center">
                <AlertCircle className="text-red-400" size={48} />
                <p className="text-red-300">Failed to load quiz.</p>
                <button onClick={() => refetch()} className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 text-white">
                    Retry
                </button>
            </div>
        );
    }

    const quizzes = data?.quizzes || [];

    return (
        <div className="space-y-8 max-w-3xl mx-auto pb-20">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Knowledge Check</h2>
                    <p className="text-gray-400">Test your understanding of the video content.</p>
                </div>
                <div className="text-lime-400 font-mono text-sm border border-lime-400/30 px-3 py-1 rounded-full bg-lime-400/10">
                    {Object.keys(selectedAnswers).length} / {quizzes.length} Completed
                </div>
            </div>

            {quizzes.map((quiz, qIndex) => (
                <div key={qIndex} className="glass-card rounded-2xl p-8 border border-white/10 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${qIndex * 100}ms` }}>
                    <h3 className="text-xl font-bold text-white mb-6 flex gap-3">
                        <span className="text-lime-400 font-mono">Q{qIndex + 1}.</span>
                        {quiz.question}
                    </h3>

                    <div className="space-y-3">
                        {quiz.options.map((option, oIndex) => {
                            const isSelected = selectedAnswers[qIndex] === oIndex;
                            const isCorrect = oIndex === quiz.answer_index;
                            const isWrong = isSelected && !isCorrect;
                            const showResult = selectedAnswers[qIndex] !== undefined;

                            return (
                                <button
                                    key={oIndex}
                                    onClick={() => handleSelect(qIndex, oIndex)}
                                    disabled={showResult}
                                    className={cn(
                                        "w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between group",
                                        !showResult && "border-white/10 hover:bg-white/5 hover:border-lime-400/50",
                                        showResult && isCorrect && "bg-lime-400/20 border-lime-400 text-lime-400",
                                        showResult && isWrong && "bg-red-500/20 border-red-500 text-red-400",
                                        showResult && !isCorrect && !isWrong && "opacity-50 border-transparent"
                                    )}
                                >
                                    <span className="font-medium">{option}</span>
                                    {showResult && isCorrect && <CheckCircle size={20} />}
                                    {showResult && isWrong && <XCircle size={20} />}
                                </button>
                            );
                        })}
                    </div>

                    {showExplanation[qIndex] && (
                        <div className={cn(
                            "mt-6 p-4 rounded-xl text-sm border",
                            selectedAnswers[qIndex] === quiz.answer_index
                                ? "bg-lime-400/10 border-lime-400/20 text-lime-200"
                                : "bg-red-500/10 border-red-500/20 text-red-200"
                        )}>
                            <p className="font-bold mb-1 flex items-center gap-2">
                                {selectedAnswers[qIndex] === quiz.answer_index ? 'Correct!' : 'Incorrect'}
                            </p>
                            <p>{quiz.explanation}</p>
                        </div>
                    )}
                </div>
            ))}

            {Object.keys(selectedAnswers).length === quizzes.length && (
                <div className="text-center py-8 animate-in zoom-in duration-500">
                    <button
                        onClick={() => { setSelectedAnswers({}); setShowExplanation({}); }}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold transition-colors"
                    >
                        <RefreshCw size={20} />
                        Retake Quiz
                    </button>
                </div>
            )}
        </div>
    );
};

export default Quiz;
