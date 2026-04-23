/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { 
  BookOpen, 
  ChevronRight, 
  Search, 
  Layout, 
  Map, 
  Award, 
  Loader2, 
  Download,
  Scroll,
  Menu,
  X,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import plantumlEncoder from "plantuml-encoder";
import { generateCourseStructure, generateModule } from "./services/geminiService";

const PlantUMLDiagram = ({ code }: { code: string }) => {
  const encoded = plantumlEncoder.encode(code.trim());
  const url = `https://www.plantuml.com/plantuml/svg/${encoded}`;
  
  return (
    <div className="my-10 bg-white border border-border-main rounded-xl overflow-hidden shadow-sm">
      <div className="bg-sidebar px-4 py-2 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-white/10">
        <span>Architectural Protocol</span>
        <span>PlantUML v1.0</span>
      </div>
      <div className="p-8 flex flex-col items-center justify-center">
        <img 
          src={url} 
          alt="Architectural Diagram" 
          className="max-w-full h-auto"
          onLoad={() => console.log('PlantUML Diagram Loaded')}
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://placehold.co/600x400?text=Diagram+Generation+Error`;
          }}
        />
        <div className="mt-4 text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-50">Generated System Schematic</div>
      </div>
    </div>
  );
};

interface CourseModule {
  stage: string;
  title: string;
  id: string;
}

const TECH_STACKS: Record<string, string[]> = {
  "General": ["NONE (Conceptual Only)"],
  "Frontend Frameworks": ["Angular", "Next.js", "Nuxt.js", "React", "Solid.js", "Svelte", "Vue.js"],
  "Backend Frameworks": ["ASP.NET Core", "Django", "FastAPI", "Flask", "Laravel", "Node JS", "Ruby on Rails", "Spring Boot"],
  "Mobile Frameworks": ["Android (Native)", "Capacitor", "Flutter", "Ionic", "iOS (Native)", "Kotlin Multiplatform", "React-Native"],
  "Database Systems": ["Cassandra", "DynamoDB", "Firebase", "MongoDB", "MySQL", "Oracle", "PostgreSQL", "Redis", "SQLite"],
  "Core Languages": ["C++", "Go", "Java", "JavaScript", "Kotlin", "Python", "Rust", "Swift", "TypeScript"]
};

export default function App() {
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState("General");
  const [language, setLanguage] = useState("NONE (Conceptual Only)");
  const [isGenerating, setIsGenerating] = useState(false);
  const [content, setContent] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState<"home" | "course">("home");
  const [currentModuleIndex, setCurrentModuleIndex] = useState(1);
  const [modulesList, setModulesList] = useState<string[]>([]);

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    setLanguage(TECH_STACKS[newCat][0]);
  };

  useEffect(() => {
    if (!content && activeView === "course") {
      setActiveView("home");
    }
  }, [content, activeView]);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    try {
      const result = await generateCourseStructure(topic, language);
      setContent(result || "Failed to generate content.");
      
      // Advanced extraction for 50 modules
      const lines = result?.split('\n') || [];
      const extracted = lines
        .filter(l => l.match(/^(###|\d+\.)\s/))
        .map(l => l.replace(/^(###|\d+\.)\s/, '').trim())
        .filter(l => l.length > 5);
      
      if (extracted.length > 20) {
        setModulesList(extracted);
      } else {
        // Fallback placeholders for 50 modules if AI is shy
        const fallbacks = Array.from({ length: 50 }, (_, i) => `Chapter ${String(i + 1).padStart(2, '0')}: Advanced Concepts`);
        setModulesList(fallbacks);
      }
      
      setActiveView("course");
      setCurrentModuleIndex(1);
    } catch (error) {
      console.error("Generation failed:", error);
      alert("Something went wrong during generation. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateNextModule = async () => {
    if (!topic || !content) return;
    setIsGenerating(true);
    const nextIndex = currentModuleIndex + 1;
    const nextTitle = modulesList[nextIndex - 1] || `Chapter ${nextIndex}`;
    
    try {
      const result = await generateModule(topic, language, nextTitle, content);
      setContent(prev => `${prev}\n\n---\n\n${result}`);
      setCurrentModuleIndex(nextIndex);
    } catch (error) {
      console.error("Next module generation failed:", error);
      alert("Failed to generate the next chapter.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow popups to export the course.");
      return;
    }

    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(s => s.outerHTML)
      .join('\n');

    printWindow.document.write(`
      <html>
        <head>
          <title>AIGuru Masterclass: ${topic}</title>
          ${styles}
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
            body { background: white !important; }
            .print-container { padding: 40px; max-width: 900px; margin: 0 auto; color: #1E293B; }
            hr { border: none; border-top: 2px solid #E2E8F0; margin: 60px 0; page-break-after: always; }
            pre { background: #0F172A !important; color: #E2E8F0 !important; border-radius: 8px; padding: 24px !important; }
            img { max-width: 100% !important; margin: 40px 0; border: 1px solid #E2E8F0; border-radius: 12px; }
            @page { margin: 2cm; }
          </style>
        </head>
        <body>
          <div class="print-container prose prose-slate prose-lg max-w-none">
            <div style="text-align: center; margin-bottom: 80px; border-bottom: 4px solid #3B82F6; padding-bottom: 40px;">
              <h1 style="font-size: 56px; font-weight: 800; margin-bottom: 8px; letter-spacing: -0.05em;">AIGuru</h1>
              <p style="color: #3B82F6; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.3em;">MIT-Level Architectural Masterclass</p>
              <p style="margin-top: 24px; font-size: 20px; color: #64748B;">Subject: ${topic} | Language: ${language}</p>
            </div>
            ${document.querySelector('article')?.innerHTML || ''}
          </div>
          <script>
            setTimeout(() => { window.print(); }, 1200);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-bg-main text-text-main font-sans selection:bg-accent/20">
      <AnimatePresence mode="wait">
        {activeView === "home" ? (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-screen p-6 max-w-5xl mx-auto text-center"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sidebar text-white text-[10px] font-black uppercase tracking-[0.3em] mb-4 shadow-xl">
                <Sparkles size={14} className="text-accent" />
                Architect Level Integration
              </div>
              <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-none text-text-main filter drop-shadow-sm">
                Guru<span className="text-accent">.AI</span>
              </h1>
              <p className="text-2xl text-text-muted max-w-2xl mx-auto font-medium leading-tight">
                Decode Systems. Master Foundations. Build Excellence.
              </p>

              <div className="flex flex-col gap-6 mt-16 max-w-2xl mx-auto w-full">
                {/* Search Bar on Top */}
                <div className="bg-white rounded-2xl shadow-2xl shadow-slate-200/50 border border-border-main p-2">
                  <div className="flex items-center px-6">
                    <Search className="text-text-muted mr-3" size={20} />
                    <input
                      type="text"
                      placeholder="What do you want to master?"
                      className="w-full bg-transparent py-5 outline-none text-xl font-bold placeholder:text-text-muted/30"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                    />
                  </div>
                </div>

                {/* Dropdowns and GO Button */}
                <div className="flex flex-col md:flex-row gap-4 items-stretch">
                  {/* Category Dropdown */}
                  <div className="flex-1 px-6 flex items-center bg-white h-[68px] rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-200/10 relative group hover:border-accent/40 transition-all active:scale-[0.99] overflow-hidden">
                    <div className="flex flex-col justify-center h-full mr-6 border-r border-slate-100 pr-6 shrink-0">
                      <span className="text-[8px] font-black text-accent uppercase tracking-[0.25em] leading-none mb-1">Architecture</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Domain</span>
                    </div>
                    <select 
                      className="flex-1 bg-transparent py-5 outline-none font-bold text-sidebar cursor-pointer appearance-none pr-8 text-sm md:text-base"
                      value={category}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                    >
                      {Object.keys(TECH_STACKS).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted group-hover:text-accent transition-colors">
                      <ChevronRight size={16} className="rotate-90" />
                    </div>
                  </div>

                  {/* Technology Dropdown */}
                  <div className="flex-1 px-6 flex items-center bg-white h-[68px] rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-200/10 relative group hover:border-accent/40 transition-all active:scale-[0.99] overflow-hidden">
                    <div className="flex flex-col justify-center h-full mr-6 border-r border-slate-100 pr-6 shrink-0">
                      <span className="text-[8px] font-black text-accent uppercase tracking-[0.25em] leading-none mb-1">Target</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Stack</span>
                    </div>
                    <select 
                      className="flex-1 bg-transparent py-5 outline-none font-bold text-sidebar cursor-pointer appearance-none pr-8 text-sm md:text-base"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      {TECH_STACKS[category].map(tech => (
                        <option key={tech} value={tech}>{tech}</option>
                      ))}
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted group-hover:text-accent transition-colors">
                      <ChevronRight size={16} className="rotate-90" />
                    </div>
                  </div>

                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !topic.trim()}
                    className="md:w-auto w-full bg-accent text-white px-12 h-[68px] rounded-2xl font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 group shadow-xl shadow-accent/20"
                  >
                    {isGenerating ? (
                      <Loader2 className="animate-spin" size={24} />
                    ) : (
                      <>
                        GO
                        <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="course"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex h-screen overflow-hidden bg-white"
          >
            <motion.aside
              initial={false}
              animate={{ width: sidebarOpen ? 320 : 0, opacity: sidebarOpen ? 1 : 0 }}
              className="bg-sidebar text-white overflow-hidden hidden md:flex flex-col border-r border-white/10"
            >
              <div className="w-[320px] h-full flex flex-col p-8">
                <div className="mb-12 flex items-center gap-3">
                  <div className="w-8 h-8 bg-accent rounded flex items-center justify-center font-black text-white italic shadow-[0_0_15px_rgba(59,130,246,0.3)]">G</div>
                  <h2 className="text-white font-black text-xl tracking-tighter uppercase italic">Guru.AI</h2>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                  <div className="space-y-4">
                    <div className="text-[10px] font-black text-accent uppercase tracking-[0.3em] mb-6">Course Syllabus (50 Chapters)</div>
                    <div className="space-y-2">
                      {modulesList.map((m, idx) => {
                        const isCompleted = idx + 1 < currentModuleIndex;
                        const isActive = idx + 1 === currentModuleIndex;
                        const isLocked = idx + 1 > currentModuleIndex;
                        
                        return (
                          <div 
                            key={idx}
                            className={`flex items-start gap-3 py-3 px-4 text-xs font-bold rounded-xl transition-all border border-transparent ${
                                isActive ? 'bg-accent/10 border-accent/30 text-white shadow-lg' : 
                                isLocked ? 'text-white/10' : 'text-white/40 hover:text-white hover:bg-white/5 cursor-pointer'
                            }`}
                          >
                            <span className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 font-black text-[10px] ${
                                isActive ? 'bg-accent text-white' : 
                                isCompleted ? 'bg-emerald-500 text-white' : 'bg-white/5'
                            }`}>
                                {isCompleted ? '✓' : idx + 1}
                            </span>
                            <span className="leading-tight mt-1 truncate">{m}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/5">
                   <div className="flex items-center justify-between text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-4">
                      <span>Course Mastery</span>
                      <span className="text-white">{Math.round((currentModuleIndex / modulesList.length) * 100)}%</span>
                   </div>
                   <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden p-0.5 border border-white/5">
                      <div className="bg-accent h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(59,130,246,0.5)]" style={{ width: `${(currentModuleIndex / modulesList.length) * 100}%` }} />
                   </div>
                </div>
              </div>
            </motion.aside>

             <main className="flex-1 overflow-y-auto bg-[#F8FAFC] flex flex-col relative custom-scrollbar">
               <header className="h-[72px] sticky top-0 z-10 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 px-8 flex items-center justify-between print:hidden shadow-sm">
                 <div className="flex items-center gap-4">
                   <button 
                     onClick={() => setSidebarOpen(!sidebarOpen)}
                     className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 hover:text-slate-900"
                   >
                     <Menu size={20} />
                   </button>
                   
                   <button 
                    onClick={() => setContent(null)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-accent group flex items-center gap-2"
                    title="Home"
                   >
                     <Layout size={20} className="group-hover:scale-110 transition-transform" />
                   </button>

                   <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block" />

                   <div className="flex flex-col">
                     <span className="text-[9px] font-black text-accent uppercase tracking-widest leading-none mb-1">
                        Tier {Math.floor((currentModuleIndex-1)/10) + 1} • Chapter {String(currentModuleIndex).padStart(2, '0')}
                     </span>
                     <h3 className="text-sm md:text-base font-bold text-sidebar tracking-tight leading-tight max-w-[200px] md:max-w-md truncate">
                       {(modulesList[currentModuleIndex - 1] || "Architecture Mastery").replace(/\*\*/g, '')}
                     </h3>
                   </div>
                 </div>

                 <div className="flex items-center gap-3">
                   <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-100/50 border border-slate-200/50 rounded-lg">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                     <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter truncate max-w-[120px]">{topic}</span>
                     <span className="text-[8px] text-slate-300 font-bold px-1">/</span>
                     <span className="text-[9px] font-bold text-accent uppercase tracking-tighter">{language}</span>
                   </div>

                   <button 
                     onClick={handleExportPDF}
                     className="flex items-center gap-2 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider bg-sidebar text-white rounded-lg hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
                   >
                     <Download size={14} />
                     <span>Export</span>
                   </button>
                 </div>
               </header>

              <div className="flex-1 w-full px-10 py-12 print:p-0 print:bg-white">
                <div className="max-w-4xl mx-auto bg-white p-12 md:p-20 rounded-[2rem] border border-border-main shadow-2xl shadow-slate-200/50 print:shadow-none print:border-none print:p-0">
                  <article className="prose prose-slate prose-xl max-w-none prose-headings:text-sidebar prose-strong:text-sidebar prose-headings:font-black prose-headings:tracking-tighter prose-h1:text-6xl prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-8 prose-h2:border-b-4 prose-h2:border-accent prose-h2:pb-4 prose-p:text-slate-600 prose-p:leading-relaxed prose-code:text-accent selection:bg-accent/10">
                    <ReactMarkdown
                      components={{
                        hr: ({node, ...props}) => <hr className="my-20 border-slate-100 border-t-2" {...props} />,
                        p: ({node, children, ...props}) => {
                          if (typeof children === 'string') {
                            if (children.includes('$$PLANTUML')) {
                              const plantumlCode = children.split('$$PLANTUML:')[1]?.split('$$')[0];
                              return <PlantUMLDiagram code={plantumlCode || children} />;
                            }
                            if (children.includes('$$IMAGE')) {
                                const desc = children.split('$$IMAGE:')[1]?.split('$$')[0];
                                return (
                                    <div className="my-16 flex flex-col items-center">
                                        <div className="w-full h-[400px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                                            <img 
                                                src={`https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80&text=${encodeURIComponent(desc || '')}`} 
                                                className="w-full h-full object-cover grayscale brightness-50 contrast-125" 
                                                alt={desc || 'MIT Visual Reference'} 
                                            />
                                        </div>
                                        <div className="mt-6 text-center">
                                          <div className="text-[10px] font-black text-accent uppercase tracking-[0.4em] mb-1">Figure {currentModuleIndex}.A</div>
                                          <div className="text-sm font-bold text-slate-400 italic font-serif">Structural Context: {desc}</div>
                                        </div>
                                    </div>
                                )
                            }
                            if (children.startsWith('Pro-Tip:')) {
                              return (
                                  <div className="my-16 p-10 bg-slate-50 border-r-8 border-accent rounded-l-3xl shadow-inner">
                                      <div className="text-[12px] font-black uppercase tracking-[0.3em] text-accent mb-4">Architectural Heuristic</div>
                                      <div className="text-xl italic text-slate-700 leading-tight font-medium">
                                          "{children.replace('Pro-Tip:', '').trim()}"
                                      </div>
                                  </div>
                              )
                            }
                          }
                          return <p className="mb-8" {...props}>{children}</p>
                        },
                        code: ({node, inline, className, children, ...props}) => {
                          if (!inline) {
                            return (
                              <div className="my-12 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
                                <div className="bg-slate-900 px-6 py-4 flex justify-between items-center border-b border-white/5">
                                  <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                    <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                                    <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                                  </div>
                                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{language} Standard Protocol</span>
                                </div>
                                <pre className="p-8 m-0! bg-slate-950 text-emerald-100 text-sm leading-relaxed font-mono overflow-x-auto selection:bg-emerald-500/20">
                                  {children}
                                </pre>
                              </div>
                            )
                          }
                          return <code className="bg-accent/5 text-accent px-2 py-1 rounded-lg text-[0.85em] font-black border border-accent/10" {...props}>{children}</code>
                        }
                      }}
                    >
                      {content || ""}
                    </ReactMarkdown>
                  </article>

                  <div className="mt-24 pt-12 border-t border-slate-100 flex items-center justify-between print:hidden">
                    <button 
                      onClick={() => setContent(null)}
                      className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted hover:text-accent transition-all flex items-center gap-3"
                    >
                      <Layout size={16} />
                      Reset Curriculum
                    </button>
                    {currentModuleIndex < modulesList.length && (
                      <button 
                        onClick={handleGenerateNextModule}
                        disabled={isGenerating}
                        className="bg-accent text-white px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-accent/30 flex items-center gap-4 hover:-translate-y-1 hover:brightness-110 active:translate-y-0 transition-all disabled:opacity-50"
                      >
                        {isGenerating ? <Loader2 className="animate-spin" size={20} /> : (
                          <>
                            <span>Advance to Chapter {currentModuleIndex + 1}</span>
                            <ChevronRight size={20} />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </main>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E2E8F0;
          border-radius: 20px;
          border: 2px solid transparent;
          background-clip: content-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
        
        @media print {
          .print\\:hidden { display: none !important; }
          body { background: white !important; overflow: visible !important; height: auto !important; }
          .min-h-screen { min-h: 0 !important; }
        }
        @page { margin: 1.5cm; }
      `}</style>
    </div>
  );
}
