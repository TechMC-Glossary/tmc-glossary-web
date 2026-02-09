// app/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import { GlossaryTerm } from './types';
import { Search, Plus, Edit, Loader2, FileText, CheckCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { useLanguage } from './hooks/useLanguage';

export default function Home() {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTerm, setCurrentTerm] = useState<GlossaryTerm | null>(null);
  const [originalTerm, setOriginalTerm] = useState<GlossaryTerm | null>(null); // For diffing/original ref
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState<'ADD' | 'EDIT'>('ADD');

  // Load Data
  useEffect(() => {
    fetch('/api/glossary')
      .then(res => res.json())
      .then(data => {
        setTerms(data.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
        toast.error("Failed to load glossary");
      });
  }, []);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    terms.forEach(term => {
      if (term.Category) {
        term.Category.split(';').forEach(c => cats.add(c.trim()));
      }
    });
    return Array.from(cats).sort();
  }, [terms]);

  // Search & Filter
  const filteredTerms = useMemo(() => {
    let result = terms;

    // Filter by Category first
    if (selectedCategory !== 'All') {
      result = result.filter(term => 
        term.Category?.split(';').map(c => c.trim()).includes(selectedCategory)
      );
    }

    // Then Fuse Search
    if (!query) return result;
    
    const fuse = new Fuse(result, {
      keys: ['Full Form (English)', 'Chinese', 'Category', 'Description', 'Short Form'],
      threshold: 0.3, 
    });
    return fuse.search(query).map(result => result.item);
  }, [terms, query, selectedCategory]);

  // Actions
  const handleEdit = (term: GlossaryTerm) => {
    if (!session) {
      toast.error("Please login to suggest changes");
      return;
    }
    setMode('EDIT');
    setOriginalTerm(term);
    setCurrentTerm({ ...term });
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    if (!session) {
      toast.error("Please login to suggest changes");
      return;
    }
    setMode('ADD');
    setOriginalTerm(null);
    setCurrentTerm({
      Category: '',
      "Full Form (English)": '',
      chinese: '',
      "Short Form": '',
      Description: '',
    } as any);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTerm) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: mode,
          payload: currentTerm,
          originalTerm: originalTerm
        })
      });

      if (!res.ok) throw new Error('Failed to submit request');
      
      toast.success("Request submitted successfully! Admin review required.");
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card p-6 rounded-xl border shadow-sm">
        <div className="flex flex-1 w-full gap-4">
            <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
                type="text"
                placeholder={t('search')}
                className="w-full pl-10 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            </div>
            
            <div className="w-48">
                <select 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                >
                    <option value="All">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>
        </div>
        
        <button
          onClick={handleAddNew}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t('addNew')}
        </button>
      </div>

      {/* Table Card */}
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">{t('category')}</th>
                <th className="px-6 py-4 font-medium">{t('english')}</th>
                <th className="px-6 py-4 font-medium">{t('chinese')}</th>
                <th className="px-6 py-4 font-medium">{t('shortForm')}</th>
                <th className="px-6 py-4 font-medium hidden lg:table-cell">{t('desc')}</th>
                <th className="px-6 py-4 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTerms.length === 0 ? (
                <tr>
                   <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      {t('noTerms')}
                   </td>
                </tr>
              ) : (
                filteredTerms.map((term, idx) => (
                  <tr key={idx} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{term.Category}</td>
                    <td className="px-6 py-4 text-foreground font-semibold">{term['Full Form (English)']}</td>
                    <td className="px-6 py-4">{term.Chinese || term['Chinese (Simplified)'] || '-'}</td>
                    <td className="px-6 py-4 font-mono text-xs">{term['Short Form'] || '-'}</td>
                    <td className="px-6 py-4 hidden lg:table-cell text-muted-foreground max-w-xs truncate" title={term.Description}>
                      {term.Description || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleEdit(term)}
                        className="p-2 hover:bg-muted rounded-full transition-colors text-primary"
                        title="Edit / Suggest Change"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t bg-muted/20 text-xs text-muted-foreground text-center">
            {t('showing')} {filteredTerms.length} {t('terms')}
        </div>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && currentTerm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-lg overflow-hidden border">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-lg">{mode === 'ADD' ? t('suggestNew') : t('suggestEdit')}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">Close</span>
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Form Fields - Simplified generic rendering or specific fields */}
              <div className="grid gap-2">
                 <label className="text-sm font-medium">{t('category')}</label>
                 <input 
                   required
                   className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                   value={currentTerm.Category || ''}
                   onChange={e => setCurrentTerm({...currentTerm, Category: e.target.value})}
                 />
              </div>

              <div className="grid gap-2">
                 <label className="text-sm font-medium">{t('english')}</label>
                 <input 
                   required
                   className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                   value={currentTerm['Full Form (English)'] || ''}
                   onChange={e => setCurrentTerm({...currentTerm, 'Full Form (English)': e.target.value})}
                 />
              </div>
              
              <div className="grid gap-2">
                 <label className="text-sm font-medium">{t('chinese')}</label>
                 <input 
                   className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                   value={currentTerm.Chinese || ''}
                   onChange={e => setCurrentTerm({...currentTerm, Chinese: e.target.value})}
                 />
              </div>

              <div className="grid gap-2">
                 <label className="text-sm font-medium">{t('shortForm')}</label>
                 <input 
                   className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                   value={currentTerm['Short Form'] || ''}
                   onChange={e => setCurrentTerm({...currentTerm, 'Short Form': e.target.value})}
                 />
              </div>

              <div className="grid gap-2">
                 <label className="text-sm font-medium">{t('desc')}</label>
                 <textarea 
                   className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                   value={currentTerm.Description || ''}
                   onChange={e => setCurrentTerm({...currentTerm, Description: e.target.value})}
                 />
              </div>

              <div className="pt-4 flex justify-end gap-2 text-sm text-yellow-600 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded-md">
                 <FileText className="h-4 w-4 mt-0.5" />
                 <p>Submitting this will create a request for Admin review. It will not appear immediately.</p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                 <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium rounded-md hover:bg-muted"
                 >
                   Cancel
                 </button>
                 <button 
                   type="submit"
                   disabled={isSubmitting}
                   className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                 >
                   {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : 'Submit Request'}
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
