import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { 
  Camera, 
  Upload, 
  Activity, 
  ShieldAlert, 
  Info, 
  Loader2, 
  ChevronRight,
  TrendingUp,
  Search,
  ExternalLink,
  Github
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "./lib/utils";
import { analyzeAnimal, type AnimalAnalysis } from "./lib/gemini";

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [userContext, setUserContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnimalAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = (acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      if (preview) URL.revokeObjectURL(preview);
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setAnalysis(null);
      setError(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
      'video/*': ['.mp4', '.mov', '.webm']
    },
    multiple: false
  });

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeAnimal(file, userContext);
      setAnalysis(result);
    } catch (err) {
      console.error(err);
      setError("Analysis failed. Please try again with a clearer image or video.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setUserContext("");
    setAnalysis(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col">
      {/* Header */}
      <header className="h-16 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center">
            <Activity className="w-5 h-5 text-slate-950" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white uppercase">
            FAUNA<span className="text-emerald-500">AI</span> 
            <span className="font-normal text-slate-500 text-sm ml-2 font-mono">V.2.0.4-BETA</span>
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> System Active
          </div>
          <div className="h-4 w-px bg-slate-800"></div>
          <button onClick={reset} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors">
            Reset System
          </button>
          <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs uppercase tracking-wider transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            New Analysis
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-grow grid grid-cols-1 md:grid-cols-12 gap-6 p-6 overflow-hidden">
        
        {/* Left Column: Vision Engine */}
        <div className="md:col-span-8 flex flex-col gap-6 h-full">
          <div className={cn(
            "relative bg-slate-900 rounded-2xl border border-slate-800 flex-grow overflow-hidden flex items-center justify-center transition-all duration-300",
            !preview && "bg-slate-900 border-dashed border-2"
          )}
          {...(!preview ? getRootProps() : {})}
          >
            {!preview ? (
              <div className="flex flex-col items-center text-center p-12">
                <input {...getInputProps()} />
                <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-6 border border-slate-700 group cursor-pointer hover:border-emerald-500 transition-colors">
                  <Upload className="w-8 h-8 text-slate-500 group-hover:text-emerald-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wide">Vision Engine Offline</h3>
                <p className="text-xs text-slate-500 font-mono uppercase tracking-[0.2em]">
                  DRAG & DROP MEDIA CONTENT <br/> TO INITIALIZE SCANNER
                </p>
              </div>
            ) : (
              <div className="relative w-full h-full">
                {file?.type.startsWith('video') ? (
                  <video src={preview} className="w-full h-full object-contain" controls autoPlay muted loop />
                ) : (
                  <img src={preview} alt="Feed" className="w-full h-full object-contain" />
                )}
                
                {/* AI Overlay Mock UI */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(0,255,100,0.01),rgba(0,255,100,0.01))] bg-[length:100%_2px,3px_100%]"></div>
                  
                  {analysis && analysis.boundingBox && (
                    <motion.div 
                      key={JSON.stringify(analysis.boundingBox)}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute border-2 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] z-10"
                      style={{
                        top: `${analysis.boundingBox.ymin / 10}%`,
                        left: `${analysis.boundingBox.xmin / 10}%`,
                        height: `${(analysis.boundingBox.ymax - analysis.boundingBox.ymin) / 10}%`,
                        width: `${(analysis.boundingBox.xmax - analysis.boundingBox.xmin) / 10}%`,
                      }}
                    >
                      <div className="absolute -top-7 -left-[2px] bg-emerald-500 text-slate-950 text-[10px] font-bold px-2 py-1 flex items-center gap-2 whitespace-nowrap">
                        <span>{analysis.species.toUpperCase()}</span>
                        <span className="opacity-70 font-mono">{(analysis.confidence * 100).toFixed(1)}%</span>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Feed Metadata Overlay */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-20">
                  <div className="flex gap-2">
                    <div className="px-3 py-1 bg-slate-950/80 rounded border border-slate-700 text-[10px] font-mono text-slate-400">FPS: 24.2</div>
                    <div className="px-3 py-1 bg-slate-950/80 rounded border border-slate-700 text-[10px] font-mono text-slate-400 uppercase tracking-tighter">LIVE FEED</div>
                  </div>
                  {!analysis && !loading && (
                    <div className="absolute bottom-16 left-4 right-4 z-30">
                      <div className="relative group">
                        <textarea
                          value={userContext}
                          onChange={(e) => setUserContext(e.target.value)}
                          placeholder="ADD FIELD NOTES OR BEHAVIORAL CONTEXT (OPTIONAL)..."
                          className="w-full bg-slate-950/90 border border-slate-700/50 rounded-xl px-4 py-3 text-[10px] font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 min-h-[60px] resize-none backdrop-blur-md transition-all group-hover:border-slate-600"
                        />
                        <div className="absolute top-2 right-2 opacity-20 pointer-events-none">
                          <Activity className="w-3 h-3 text-emerald-500" />
                        </div>
                      </div>
                    </div>
                  )}

                  {!analysis && (
                    <button 
                      onClick={handleAnalyze}
                      disabled={loading}
                      className="px-4 py-1.5 bg-emerald-500 text-slate-950 rounded font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-400 transition-colors disabled:opacity-50"
                    >
                      {loading ? "System Scanning..." : "Run AI Sequence"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Activity Logs / Minimal View */}
          <div className="h-24 bg-slate-900 rounded-xl border border-slate-800 p-4 flex gap-4 overflow-x-auto items-center">
            <div className="flex-shrink-0 w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">System Status</p>
              <p className="text-xs text-slate-300">
                {loading ? "Analyzing biometric patterns..." : analysis ? "Behavioral signature logged." : "Standing by for visual input."}
              </p>
            </div>
            <div className="flex-grow"></div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="w-1 h-8 bg-slate-800 rounded-full overflow-hidden flex items-end">
                  <div className="w-full bg-emerald-500" style={{ height: `${Math.random() * 80 + 20}%` }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Data Analytics */}
        <aside className="md:col-span-4 flex flex-col gap-6 overflow-y-auto pr-1 h-full custom-scrollbar">
          <AnimatePresence mode="wait">
            {!analysis && !loading ? (
              <div className="flex flex-col items-center justify-center h-64 border border-slate-800 border-dashed rounded-2xl bg-slate-900/50 text-slate-600">
                <Info className="w-6 h-6 mb-2 opacity-20" />
                <p className="text-[10px] uppercase font-mono tracking-widest">Awaiting Analysis</p>
              </div>
            ) : loading ? (
              <div className="space-y-6 animate-pulse">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-32 bg-slate-900 rounded-2xl border border-slate-800" />
                ))}
              </div>
            ) : analysis && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Species Card */}
                <section className="bg-slate-900 p-6 rounded-2xl border border-slate-800 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Search className="w-24 h-24" />
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 mb-2">Primary Classification</div>
                  <div className="text-2xl font-bold text-white mb-1 transition-all">{analysis.species.split('(')[0]}</div>
                  <div className="text-xs italic text-emerald-400 opacity-80">{analysis.species.includes('(') ? analysis.species.split('(')[1].replace(')', '') : ''}</div>
                  <div className="mt-6 flex items-center justify-between text-xs pt-4 border-t border-slate-800">
                    <span className="text-slate-500">Certainty Factor</span>
                    <span className="font-mono text-emerald-500">{(analysis.confidence * 100).toFixed(2)}%</span>
                  </div>
                </section>

                {/* Alert Level Gauge */}
                <section className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">Alert Level Score</div>
                    <div className={cn(
                      "px-2 py-0.5 rounded text-[9px] font-bold border uppercase transition-colors",
                      analysis.alertLevel > 70 ? "bg-red-500/20 text-red-500 border-red-500/30" : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    )}>
                      {analysis.alertLevel > 70 ? "Critical Risk" : analysis.alertLevel > 40 ? "Moderate" : "Low Tension"}
                    </div>
                  </div>
                  <div className="flex items-end gap-5">
                    <div className="text-5xl font-black text-white leading-none">
                      {analysis.alertLevel}
                      <span className="text-xl opacity-20 font-light ml-1">/100</span>
                    </div>
                    <div className="flex-grow h-12 flex items-end gap-1 pb-1">
                      {[15, 45, 60, 30, 85, 95, 40].map((h, i) => (
                        <div 
                          key={i} 
                          className={cn(
                            "w-full rounded-t transition-all duration-700",
                            analysis.alertLevel > h ? "bg-emerald-500" : "bg-slate-800"
                          )} 
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </section>

                {/* Behavior Distribution */}
                <section className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 mb-6">Behavioral Blueprint</div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-[11px] mb-2 text-slate-400 uppercase font-mono tracking-wider">
                        <span>{analysis.behavior}</span>
                        <span className="text-emerald-500">PRIMARY</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          className="h-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.3)]" 
                        />
                      </div>
                    </div>
                    
                    {analysis.detailedBehaviors && analysis.detailedBehaviors.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-800/50">
                        {analysis.detailedBehaviors.map((item, idx) => (
                          <div key={idx} className="px-2 py-1 rounded bg-slate-800/50 border border-slate-700/50 text-[9px] font-mono text-slate-400 uppercase tracking-tighter">
                            {item}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>

                {/* Research Insights */}
                <section className="bg-slate-900 p-6 rounded-2xl border border-slate-800 relative group">
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 mb-4">Intellectual Insight</div>
                  <div className="space-y-4">
                    <p className="text-sm text-slate-400 leading-relaxed font-light">
                      {analysis.insight}
                    </p>
                    <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800/50">
                      <p className="text-xs text-slate-500 italic leading-relaxed">
                        "{analysis.researchNotes}"
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <ExternalLink className="w-4 h-4 text-slate-800 group-hover:text-emerald-500 transition-colors cursor-pointer" />
                  </div>
                </section>
              </motion.div>
            )}
          </AnimatePresence>
        </aside>
      </main>

      {/* Footer Bar */}
      <footer className="h-10 bg-emerald-500 px-6 flex items-center justify-between text-[10px] font-bold text-slate-950 uppercase tracking-tighter shrink-0 z-50">
        <div className="flex gap-6 items-center">
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> SESSION: AX-{Math.floor(Math.random()*900+100)}</span>
            <span className="opacity-50">|</span>
            <span>KERNEL: STABLE</span>
            <span className="opacity-50">|</span>
            <span>HARDWARE: VIRTUAL-VPU</span>
          </div>
        </div>
        <div className="flex gap-6 items-center">
          <a href="#" className="hover:underline transition-all">EXPORT ANALYSIS</a>
          <div className="w-px h-3 bg-slate-950/20"></div>
          <a href="#" className="hover:underline transition-all">CONNECT CLOUD</a>
        </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
      `}</style>
    </div>
  );
}

