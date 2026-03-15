import * as React from 'react';
import { BookOpen, Download, ExternalLink, Search as SearchIcon, ChevronDown, Notebook } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/src/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { Input } from '@/src/components/ui/Input';
import { rawData } from '@/src/firebase/data';

interface Subject {
    credits?: number;
    subjectcode?: string;
    [key: string]: any;
}

export function ClassMaterial() {
    const navigate = useNavigate();
    const [selectedSemester, setSelectedSemester] = React.useState<string>('first');
    const [selectedSubject, setSelectedSubject] = React.useState<string>('');
    const [searchTerm, setSearchTerm] = React.useState('');
    const [subjectSearchTerm, setSubjectSearchTerm] = React.useState('');
    const [expandedCategory, setExpandedCategory] = React.useState<string | null>(null);

    // Get subjects from data
    const subjects = React.useMemo(() => {
        const semesterData = (rawData.home as any)?.[selectedSemester];
        if (!semesterData) return {};

        const subjectsObj: { [key: string]: Subject } = {};
        Object.entries(semesterData).forEach(([key, value]) => {
            if (value && typeof value === 'object' && 'credits' in value) {
                subjectsObj[key] = value as Subject;
            }
        });
        return subjectsObj;
    }, [selectedSemester]);

    // Get available semesters
    const semesters = React.useMemo(() => {
        return Object.keys(rawData.home || {});
    }, []);

    // Filter subjects based on search
    const filteredSubjects = React.useMemo(() => {
        if (!subjectSearchTerm) return subjects;
        const filtered: { [key: string]: Subject } = {};
        Object.entries(subjects).forEach(([key, value]) => {
            if (key.toLowerCase().includes(subjectSearchTerm.toLowerCase())) {
                filtered[key] = value;
            }
        });
        return filtered;
    }, [subjects, subjectSearchTerm]);

    // Get current subject data
    const currentSubject = selectedSubject && subjects[selectedSubject]
        ? subjects[selectedSubject]
        : null;

    // Get categories for current subject (Notes, Videos, Assignments, PYQs, etc.)
    const categories = React.useMemo(() => {
        if (!currentSubject) return [];
        return Object.keys(currentSubject).filter(
            key => key !== 'credits' && key !== 'subjectcode' && typeof currentSubject[key] === 'object'
        );
    }, [currentSubject]);

    // Filter categories based on search
    const filteredCategories = React.useMemo(() => {
        if (!searchTerm) return categories;
        return categories.filter(cat =>
            cat.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [categories, searchTerm]);

    // Get items for a category
    const getCategoryItems = (category: string) => {
        if (!currentSubject) return {};
        const categoryData = currentSubject[category];
        if (typeof categoryData === 'object') {
            return categoryData;
        }
        return {};
    };

    // Get all items for a category (handles nested structures)
    const flattenCategoryItems = (items: any): { [key: string]: string }[] => {
        const result: { [key: string]: string }[] = [];

        Object.entries(items).forEach(([key, value]) => {
            if (typeof value === 'string') {
                result.push({ [key]: value });
            } else if (typeof value === 'object' && value !== null) {
                const nested = flattenCategoryItems(value);
                result.push(...nested);
            }
        });

        return result;
    };

    return (
        <div className="space-y-6 p-3 max-w-7xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Class Materials</h1>
                <p className="text-slate-600">Access organized study materials for your subjects</p>
            </div>

            {/* Top Search Bar */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    Search Subjects
                </label>
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by subject name..."
                        value={subjectSearchTerm}
                        onChange={e => setSubjectSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
                    />
                </div>
            </div>

            {/* Semester Selection */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Select Semester</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {semesters.map(semester => (
                            <button
                                key={semester}
                                onClick={() => {
                                    setSelectedSemester(semester);
                                    setSelectedSubject('');
                                    setExpandedCategory(null);
                                }}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${selectedSemester === semester
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                            >
                                {semester.charAt(0).toUpperCase() + semester.slice(1)}
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Subject Selection */}
            {Object.keys(subjects).length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Select Subject</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {Object.entries(subjects).map(([key, subject]) => (
                                <button
                                    key={key}
                                    onClick={() => {
                                        setSelectedSubject(key);
                                        setExpandedCategory(null);
                                    }}
                                    className={`p-4 rounded-lg text-left transition-all ${selectedSubject === key
                                        ? 'bg-indigo-50 border-2 border-indigo-600'
                                        : 'bg-slate-50 border-2 border-slate-200 hover:border-indigo-400'
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-slate-900 truncate">{key}</p>
                                            <p className="text-xs text-slate-600 mt-1">Code: {(subject as any).subjectcode}</p>
                                            <p className="text-xs text-slate-600">Credits: {(subject as any).credits}</p>
                                        </div>
                                        <BookOpen className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-1" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Materials Display */}
            {currentSubject && (
                <>

                    {/* Categories */}
                    <div className="space-y-3">
                        {filteredCategories.length === 0 ? (
                            <Card>
                                <CardContent className="pt-12 pb-12 text-center">
                                    <p className="text-slate-600">No materials found matching your search</p>
                                </CardContent>
                            </Card>
                        ) : (
                            filteredCategories.map(category => {
                                const items = getCategoryItems(category);
                                const flatItems = flattenCategoryItems(items);
                                const isExpanded = expandedCategory === category;

                                return (
                                    <Card key={category} className="overflow-hidden">
                                        <button
                                            onClick={() => setExpandedCategory(isExpanded ? null : category)}
                                            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Notebook className="w-5 h-5 text-indigo-600" />
                                                <div className="text-left">
                                                    <h3 className="font-semibold text-slate-900">{category}</h3>
                                                    <p className="text-xs text-slate-500 mt-0.5">{flatItems.length} items</p>
                                                </div>
                                            </div>
                                            <ChevronDown
                                                className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''
                                                    }`}
                                            />
                                        </button>

                                        {isExpanded && (
                                            <CardContent className="border-t border-slate-200 p-4">
                                                <div className="space-y-2">
                                                    {flatItems.length === 0 ? (
                                                        <p className="text-sm text-slate-500 text-center py-4">No items in this category</p>
                                                    ) : (
                                                        flatItems.map((item, idx) => {
                                                            const [name, url] = Object.entries(item)[0];
                                                            return (
                                                                <a
                                                                    key={idx}
                                                                    href={url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-indigo-50 transition-colors group"
                                                                >
                                                                    <span className="text-sm font-medium text-slate-900 group-hover:text-indigo-600 flex-1">
                                                                        {name}
                                                                    </span>
                                                                    <div className="flex items-center gap-2 ml-3">
                                                                        <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                                                                        <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                                                                    </div>
                                                                </a>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            </CardContent>
                                        )}
                                    </Card>
                                );
                            })
                        )}
                    </div>
                </>
            )}

            {!selectedSubject && Object.keys(subjects).length > 0 && (
                <Card>
                    <CardContent className="pt-12 pb-12 text-center">
                        <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-600 font-medium">Select a subject to view materials</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
