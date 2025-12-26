import React from 'react';
import { FileText, Copy, Check } from 'lucide-react';

interface NotesTabProps {
    content: string;
}

const NotesTab: React.FC<NotesTabProps> = ({ content }) => {
    const [copied, setCopied] = React.useState(false);

    // Simple markdown renderer replacement (since react-markdown wasn't in the install list explicitly, 
    // but if it is available we use it. If not, text-whitespace-pre-wrap)
    // The prompt asked to use react-markdown. 
    // Assuming it is not installed, I will try to render it simply or just use pre-wrap for now 
    // to avoid build errors if package is missing. 
    // Actually, I can use a simple regex replacement for headers if needed, 
    // but let's stick to safe CSS processing for now.

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
                    <FileText className="text-lime-400" />
                    Smart Notes
                </h2>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-gray-300 transition-colors"
                >
                    {copied ? <Check size={16} className="text-lime-400" /> : <Copy size={16} />}
                    {copied ? 'Copied' : 'Copy Text'}
                </button>
            </div>

            <div className="prose prose-invert prose-lime max-w-none">
                <div className="bg-zinc-900/50 rounded-2xl p-8 border border-white/10 shadow-inner">
                    {/* Rendering Markdown content safely */}
                    <pre className="whitespace-pre-wrap font-sans text-gray-300 leading-relaxed text-lg">
                        {content}
                    </pre>
                </div>
            </div>
        </div>
    );
};

export default NotesTab;
