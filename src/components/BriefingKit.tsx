import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CaseBrief, CaseFlashcard, PRESET_FLASHCARDS } from '../types';
import { BookOpen, HelpCircle, Save, Plus, Trash2, Edit3, ChevronRight, ChevronLeft, RefreshCw, FileText } from 'lucide-react';

interface BriefingKitProps {
  caseBriefs: CaseBrief[];
  saveCaseBrief: (title: string, citation: string, facts: string, issue: string, holding: string, notes: string, existingId?: string) => Promise<void>;
  deleteCaseBrief: (briefId: string) => Promise<void>;
}

export function BriefingKit({ caseBriefs, saveCaseBrief, deleteCaseBrief }: BriefingKitProps) {
  const [activeTab, setActiveTab] = useState<'notebook' | 'flashcards'>('notebook');

  // Notebook states
  const [isAddingBrief, setIsAddingBrief] = useState(false);
  const [editingBriefId, setEditingBriefId] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState('');
  const [citation, setCitation] = useState('');
  const [facts, setFacts] = useState('');
  const [issue, setIssue] = useState('');
  const [holding, setHolding] = useState('');
  const [notes, setNotes] = useState('');

  // Flashcards states
  const [flashcardIdx, setFlashcardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleEditBrief = (brief: CaseBrief) => {
    setEditingBriefId(brief.id);
    setTitle(brief.title);
    setCitation(brief.citation || '');
    setFacts(brief.facts || '');
    setIssue(brief.issue || '');
    setHolding(brief.holding || '');
    setNotes(brief.notes || '');
    setIsAddingBrief(true);
  };

  const handleSaveSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await saveCaseBrief(
      title.trim(),
      citation.trim(),
      facts.trim(),
      issue.trim(),
      holding.trim(),
      notes.trim(),
      editingBriefId
    );

    // Reset Form
    handleResetForm();
  };

  const handleResetForm = () => {
    setTitle('');
    setCitation('');
    setFacts('');
    setIssue('');
    setHolding('');
    setNotes('');
    setEditingBriefId(undefined);
    setIsAddingBrief(false);
  };

  const activeCard: CaseFlashcard = PRESET_FLASHCARDS[flashcardIdx];

  const handleNextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setFlashcardIdx((prev) => (prev + 1) % PRESET_FLASHCARDS.length);
    }, 150);
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setFlashcardIdx((prev) => (prev - 1 + PRESET_FLASHCARDS.length) % PRESET_FLASHCARDS.length);
    }, 150);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 flex flex-col h-full shadow-sm max-h-[750px]">
      {/* Tab Select Header with Sleek Interface Style */}
      <div className="flex border-b border-slate-100 pb-3 mb-4 justify-between items-center gap-2">
        <div className="flex bg-slate-100/80 p-1 rounded-xl">
          <button
            id="tab-notebook"
            onClick={() => { setActiveTab('notebook'); setIsFlipped(false); }}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'notebook' 
                ? 'bg-white text-slate-900 shadow-sm font-extrabold' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Case Notebook ({caseBriefs.length})</span>
          </button>
          
          <button
            id="tab-flashcards"
            onClick={() => { setActiveTab('flashcards'); setIsFlipped(false); }}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'flashcards' 
                ? 'bg-white text-slate-900 shadow-sm font-extrabold' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Famous Flashcards</span>
          </button>
        </div>

        {activeTab === 'notebook' && !isAddingBrief && (
          <button
            id="btn-create-brief"
            onClick={() => setIsAddingBrief(true)}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold py-1.5 px-3 rounded-xl transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Brief</span>
          </button>
        )}
      </div>

      {/* Grid view based on active tab */}
      <div className="flex-1 overflow-y-auto pr-1">
        {activeTab === 'notebook' ? (
          <div>
            {isAddingBrief ? (
              // Add / Update Brief UI
              <form onSubmit={handleSaveSubmit} className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    {editingBriefId ? '🔧 Modify Case Briefing Sheet' : '📝 Draft Case Brief'}
                  </h3>
                  <button
                    id="btn-cancel-brief-edit"
                    type="button"
                    onClick={handleResetForm}
                    className="text-xs text-slate-400 hover:text-slate-600 font-bold transition-colors"
                  >
                    Cancel / Retract
                  </button>
                </div>

                {/* Primary metadata row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase tracking-wider font-bold">CASE NAME / CLASS NAME *</label>
                    <input
                      id="input-brief-title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Miranda v. Arizona"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase tracking-wider font-bold">CITATIONS REFERENCE</label>
                    <input
                      id="input-brief-citation"
                      type="text"
                      value={citation}
                      onChange={(e) => setCitation(e.target.value)}
                      placeholder="e.g. 384 U.S. 436 (1966)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Technical facts and legal constraints */}
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase tracking-wider font-bold">FACTS (EVIDENTIARY & PROCEDURAL)</label>
                    <textarea
                      id="textarea-brief-facts"
                      value={facts}
                      onChange={(e) => setFacts(e.target.value)}
                      rows={2}
                      placeholder="Procedural history, who is suing whom, what happened..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase tracking-wider font-bold">THE LEGAL ISSUE PRESENTED</label>
                    <textarea
                      id="textarea-brief-issue"
                      value={issue}
                      onChange={(e) => setIssue(e.target.value)}
                      rows={2}
                      placeholder="What is the key legal question or constitutional issue..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase tracking-wider font-bold">COURT HOLDING & REASONING</label>
                    <textarea
                      id="textarea-brief-holding"
                      value={holding}
                      onChange={(e) => setHolding(e.target.value)}
                      rows={2}
                      placeholder="What did the court rule, and by what ratio decidendi..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase tracking-wider font-bold">EXAM NOTES & TAKEAWAYS</label>
                    <textarea
                      id="textarea-brief-notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder="Personal takeaways, outlining hooks, cold call prep..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    id="btn-save-brief"
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs hover:bg-indigo-700 cursor-pointer shadow-sm shadow-indigo-100 transition-colors"
                  >
                    <Save className="w-4 h-4 text-indigo-100" />
                    <span>Commit & Sync Briefing Sheet</span>
                  </button>
                  
                  <button
                    id="btn-revert-brief-form"
                    type="button"
                    onClick={handleResetForm}
                    className="bg-slate-100 hover:bg-slate-205 border border-slate-200 rounded-xl px-4 text-xs font-bold text-slate-700 cursor-pointer transition-colors"
                  >
                    Discard
                  </button>
                </div>
              </form>
            ) : (
              // List Saved Briefs View
              <div className="space-y-4">
                {caseBriefs.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-slate-250 rounded-2xl bg-slate-50/40">
                    <FileText className="w-10 h-10 text-slate-350 mx-auto stroke-[1.2] mb-3" />
                    <p className="text-sm font-bold text-slate-800">Your Case Notebook is Empty</p>
                    <p className="text-xs text-slate-400 mt-1.5 max-w-[280px] mx-auto leading-relaxed">
                      Use the "New Brief" option to structure, organize, and sync case briefing sheets securely across your devices.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {caseBriefs.map((brief) => (
                      <div
                        key={brief.id}
                        className="group border border-slate-200/80 bg-white rounded-2xl p-4 md:p-5 hover:border-slate-300 transition-all flex flex-col justify-between gap-3 shadow-xs"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-900 transition-colors">
                              {brief.title}
                            </h4>
                            <div className="flex items-center gap-1 opacity-90 md:opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                id={`edit-brief-${brief.id}`}
                                onClick={() => handleEditBrief(brief)}
                                className="p-1 px-1.5 hover:bg-slate-100 border border-transparent hover:border-slate-200 rounded-lg text-slate-500 hover:text-slate-900 flex items-center gap-1 text-[10px] font-bold"
                                title="Edit brief"
                              >
                                <Edit3 className="w-3 h-3 text-indigo-650" />
                                <span>Edit</span>
                              </button>
                              
                              <button
                                id={`delete-brief-${brief.id}`}
                                onClick={() => deleteCaseBrief(brief.id)}
                                className="p-1.5 text-slate-400 hover:text-red-650 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg"
                                title="Delete brief"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {brief.citation && (
                            <span className="text-[10px] font-mono font-semibold text-slate-450 mt-0.5 block">
                              {brief.citation}
                            </span>
                          )}

                          {/* Split blocks of briefing material with Sleek formatting */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3.5 border-t border-slate-100">
                            {brief.facts && (
                              <div>
                                <span className="block text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest">FACTS SUMMARY</span>
                                <p className="text-[11px] text-slate-600 mt-1 line-clamp-3 leading-relaxed font-sans">
                                  {brief.facts}
                                </p>
                              </div>
                            )}

                            {brief.issue && (
                              <div>
                                <span className="block text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest">PRIMARY ISSUE</span>
                                <p className="text-[11px] text-slate-600 mt-1 line-clamp-3 leading-relaxed font-sans">
                                  {brief.issue}
                                </p>
                              </div>
                            )}

                            {brief.holding && (
                              <div className="sm:col-span-2">
                                <span className="block text-[8px] font-mono text-indigo-700 font-bold uppercase tracking-widest">COURT HOLDING</span>
                                <p className="text-[11px] text-slate-800 mt-1 line-clamp-2 leading-relaxed font-sans font-medium">
                                  {brief.holding}
                                </p>
                              </div>
                            )}

                            {brief.notes && (
                              <div className="sm:col-span-2 bg-slate-50/50 p-2.5 rounded-xl border border-slate-150/60 mt-1.5">
                                <span className="block text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest">EXAM NOTES / OUTLINE HOOKS</span>
                                <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 font-mono leading-relaxed">
                                  {brief.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          // Flashcards 공부 View
          <div className="flex flex-col items-center justify-center py-6">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-4 text-center">
              1L Fundamental Study Deck (Landmark Common Law Cases)
            </h3>

            {/* Flip Double Sided Deck Card */}
            <div 
              className="w-full max-w-sm h-72 cursor-pointer perspective-1000 select-none scale-95 sm:scale-100"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <motion.div
                className="w-full h-full relative preserve-3d"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                {/* Front Side */}
                <div className="absolute inset-0 bg-slate-900 text-white rounded-3xl p-6 border border-slate-850 flex flex-col justify-between backface-hidden shadow-lg shadow-slate-900/10">
                  <div>
                    <span className="text-[9px] font-mono font-bold uppercase bg-slate-800 text-slate-300 px-2.5 py-0.8 rounded tracking-widest border border-slate-700/50">
                      Famous Landmark Case
                    </span>
                    <h4 className="text-xl font-extrabold tracking-tight mt-4 text-slate-105 font-sans">
                      {activeCard.title}
                    </h4>
                    <p className="text-xs font-mono font-medium text-slate-400 mt-1">
                      {activeCard.citation}
                    </p>
                  </div>

                  <div className="flex justify-between items-center text-slate-500 text-xs mt-4">
                    <span className="font-semibold text-[10px] tracking-wide bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded">Card {flashcardIdx + 1} of {PRESET_FLASHCARDS.length}</span>
                    <span className="flex items-center gap-1.5 text-[9px] text-slate-350 font-bold uppercase tracking-wider font-mono">
                      <RefreshCw className="w-3 h-3 text-slate-200 animate-spin-slow" />
                      Click to flip
                    </span>
                  </div>
                </div>

                {/* Back Side */}
                <div 
                  className="absolute inset-0 bg-white text-slate-900 rounded-3xl p-5 border border-slate-200 flex flex-col justify-between backface-hidden shadow-lg shadow-slate-200/20 rotate-y-180"
                >
                  <div className="space-y-3.5 overflow-y-auto max-h-[195px] pr-1">
                    <div>
                      <span className="block text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest">FACTS BRIEF</span>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed font-sans">
                        {activeCard.facts}
                      </p>
                    </div>

                    <div>
                      <span className="block text-[8px] font-mono font-bold text-indigo-700 uppercase tracking-widest">HOLDING</span>
                      <p className="text-[11px] text-slate-800 mt-0.5 leading-relaxed font-sans font-semibold">
                        {activeCard.holding}
                      </p>
                    </div>

                    <div className="bg-indigo-50/55 p-2.5 rounded-xl border border-indigo-100/50">
                      <span className="block text-[8px] font-mono font-bold text-indigo-800 uppercase tracking-widest">CON-LAW TAKEAWAY</span>
                      <p className="text-[11px] text-slate-705 mt-0.5 leading-relaxed font-sans font-medium">
                        {activeCard.takeaway}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-slate-400 text-xs border-t border-slate-100 pt-2.5">
                    <span className="text-[9px] font-bold tracking-wider font-mono uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded">Back of Card</span>
                    <span className="flex items-center gap-1 text-[10px] text-slate-600 font-bold font-sans">
                      <RefreshCw className="w-3 h-3" /> Click to hide details
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Stepper Cluster */}
            <div className="flex gap-4 mt-6 items-center">
              <button
                id="btn-prev-card"
                onClick={handlePrevCard}
                className="flex items-center gap-1 py-1.5 px-3 border border-slate-205 rounded-xl hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <ChevronLeft className="w-4 h-4 text-slate-550" />
                <span>Prev</span>
              </button>

              <span className="text-xs font-bold font-mono text-slate-450">
                {flashcardIdx + 1} / {PRESET_FLASHCARDS.length}
              </span>

              <button
                id="btn-next-card"
                onClick={handleNextCard}
                className="flex items-center gap-1 py-1.5 px-3 border border-slate-205 rounded-xl hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4 text-slate-550" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
