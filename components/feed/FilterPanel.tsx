'use client';

import { useState } from 'react';
import { Filter, X, Check } from 'lucide-react';
import { FeedFilters } from '@/actions/feed';

interface FilterPanelProps {
    filters: FeedFilters;
    onFilterChange: (newFilters: FeedFilters) => void;
}

const DISCIPLINES = ['Visual Art', 'Writing', 'Music', 'Code', 'Design', 'Other'];
const PHASES = ['Idea', 'Blocked', 'Flow', 'Revision', 'Finished'];

export default function FilterPanel({ filters, onFilterChange }: FilterPanelProps) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleDiscipline = (d: string) => {
        const current = filters.disciplines || [];
        const next = current.includes(d)
            ? current.filter(item => item !== d)
            : [...current, d];
        onFilterChange({ ...filters, disciplines: next });
    };

    const togglePhase = (p: string) => {
        const current = filters.phases || [];
        const next = current.includes(p)
            ? current.filter(item => item !== p)
            : [...current, p];
        onFilterChange({ ...filters, phases: next });
    };

    const toggleFeedback = () => {
        onFilterChange({ ...filters, needsFeedback: !filters.needsFeedback });
    };

    const activeCount = (filters.disciplines?.length || 0) + (filters.phases?.length || 0) + (filters.needsFeedback ? 1 : 0);

    return (
        <div className="border-b border-ink/50 py-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-sm text-stone hover:text-foreground transition-colors"
            >
                <Filter size={16} />
                <span>Filters {activeCount > 0 && `(${activeCount})`}</span>
                {isOpen ? <X size={16} className="ml-2" /> : null}
            </button>

            {isOpen && (
                <div className="mt-6 space-y-8 animate-in slide-in-from-top-2 fade-in duration-200">
                    {/* Disciplines */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-medium text-stone uppercase tracking-wider">Discipline</h4>
                        <div className="flex flex-wrap gap-2">
                            {DISCIPLINES.map(d => {
                                const isActive = filters.disciplines?.includes(d);
                                return (
                                    <button
                                        key={d}
                                        onClick={() => toggleDiscipline(d)}
                                        className={`px-3 py-1.5 rounded text-sm transition-all border ${isActive
                                                ? 'bg-foreground text-background border-foreground'
                                                : 'bg-transparent text-stone border-ink hover:border-stone'
                                            }`}
                                    >
                                        {d}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Phases */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-medium text-stone uppercase tracking-wider">Phase</h4>
                        <div className="flex flex-wrap gap-2">
                            {PHASES.map(p => {
                                const isActive = filters.phases?.includes(p);
                                return (
                                    <button
                                        key={p}
                                        onClick={() => togglePhase(p)}
                                        className={`px-3 py-1.5 rounded text-sm transition-all border ${isActive
                                                ? 'bg-foreground text-background border-foreground'
                                                : 'bg-transparent text-stone border-ink hover:border-stone'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Needs Feedback */}
                    <div className="flex items-center gap-3 pt-2">
                        <button
                            onClick={toggleFeedback}
                            className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${filters.needsFeedback ? 'bg-accent border-accent text-white' : 'border-stone bg-transparent'
                                }`}
                        >
                            {filters.needsFeedback && <Check size={12} />}
                        </button>
                        <span className="text-sm text-foreground">Only show processes needing feedback</span>
                    </div>
                </div>
            )}
        </div>
    );
}
