import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { ZoomIn, ZoomOut, Move, Download } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { generateMindMap } from '../../services/groqService';

// Initialize mermaid
mermaid.initialize({
    startOnLoad: true,
    theme: 'dark',
    securityLevel: 'loose',
    fontFamily: 'sans-serif'
});

interface MindMapProps {
    transcript: string;
    title: string;
}

const MindMap: React.FC<MindMapProps> = ({ transcript, title }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const { data, isLoading, error } = useQuery({
        queryKey: ['mindmap', title],
        queryFn: () => generateMindMap(transcript, title),
        enabled: !!transcript,
        staleTime: Infinity, // Cache forever for this session
    });

    useEffect(() => {
        if (data?.markdown_code && containerRef.current) {
            const renderMermaid = async () => {
                try {
                    // Clear previous render
                    containerRef.current!.innerHTML = '';
                    const id = `mermaid-${Date.now()}`;
                    const { svg } = await mermaid.render(id, data.markdown_code);
                    containerRef.current!.innerHTML = svg;
                } catch (err) {
                    console.error("Mermaid render error:", err);
                    containerRef.current!.innerHTML = '<div class="text-red-400">Failed to render graph</div>';
                }
            };
            renderMermaid();
        }
    }, [data]);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
        }
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <div className="w-12 h-12 border-4 border-lime-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 animate-pulse">Generating Mind Map...</p>
            </div>
        );
    }

    if (error) {
        return <div className="text-red-400 p-8 text-center">Failed to generate mind map. Please try again.</div>;
    }

    return (
        <div className="relative h-[600px] bg-zinc-900/50 rounded-2xl border border-white/10 overflow-hidden select-none">

            {/* Controls */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 bg-zinc-800/90 rounded-xl p-2 border border-white/10 backdrop-blur-md">
                <button onClick={() => setScale(s => Math.min(s + 0.1, 3))} className="p-2 hover:bg-white/10 rounded-lg text-white" title="Zoom In">
                    <ZoomIn size={20} />
                </button>
                <button onClick={() => setScale(s => Math.max(s - 0.1, 0.5))} className="p-2 hover:bg-white/10 rounded-lg text-white" title="Zoom Out">
                    <ZoomOut size={20} />
                </button>
                <button onClick={() => { setScale(1); setPosition({ x: 0, y: 0 }); }} className="p-2 hover:bg-white/10 rounded-lg text-white" title="Reset View">
                    <Move size={20} />
                </button>
            </div>

            {/* Graph Area */}
            <div
                className="w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <div
                    ref={containerRef}
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        transition: isDragging ? 'none' : 'transform 0.2s',
                        transformOrigin: 'center',
                    }}
                    className="mermaid-container"
                />
            </div>

            <div className="absolute bottom-4 left-4 text-xs text-gray-500">
                Tip: Drag to pan, use buttons to zoom
            </div>
        </div>
    );
};

export default MindMap;
