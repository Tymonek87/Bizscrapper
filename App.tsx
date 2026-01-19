
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Download, 
  Layers, 
  CheckCircle2, 
  Loader2, 
  AlertCircle, 
  Database, 
  ExternalLink,
  ChevronRight,
  Filter,
  BarChart3,
  Mail,
  Phone,
  AlertTriangle
} from 'lucide-react';
import { ScrapeTask, TaskStatus, Lead } from './types';

// W produkcji endpointy są serwowane z tej samej domeny pod prefixem /api
const API_BASE_URL = '/api';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<ScrapeTask[]>([]);
  const [activeTask, setActiveTask] = useState<ScrapeTask | null>(null);
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(20);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Poll for status updates for any non-completed tasks
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(prevTasks => prevTasks.map(task => {
        if (task.status !== TaskStatus.COMPLETED && task.status !== TaskStatus.FAILED) {
          // Tutaj w realnej aplikacji odpytujemy endpoint:
          // fetch(`${API_BASE_URL}/status/${task.id}`).then(...)
          
          // Symulacja postępu (dla celów demo, gdy backend nie jest podłączony na żywo)
          const newProgress = Math.min(task.progress + 5, 100);
          let newStatus = task.status;
          let errorMsg = undefined;

          // Symulacja błędu dla demo (jeśli użytkownik wpisze "error" w zapytaniu)
          if (task.query.toLowerCase().includes("error") && newProgress > 20) {
             newStatus = TaskStatus.FAILED;
             errorMsg = "Nie udało się połączyć z API Apify. Sprawdź poprawność klucza API.";
          } else {
             if (newProgress > 40 && task.status === TaskStatus.PENDING) newStatus = TaskStatus.RUNNING;
             if (newProgress > 70 && task.status === TaskStatus.RUNNING) newStatus = TaskStatus.ENRICHING;
             if (newProgress === 100) newStatus = TaskStatus.COMPLETED;
          }

          return { ...task, progress: newProgress, status: newStatus, error: errorMsg };
        }
        return task;
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setIsSubmitting(true);
    
    // W realnej aplikacji tutaj następuje strzał do API:
    /*
    try {
      const response = await fetch(`${API_BASE_URL}/scrape`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, max_results: limit })
      });
      if (!response.ok) throw new Error('Błąd serwera');
      const data = await response.json();
      // ... dodaj task z ID z serwera ...
    } catch (e) {
      alert("Nie udało się uruchomić zadania");
    }
    */

    // Symulacja utworzenia zadania (Demo Mode)
    const newTask: ScrapeTask = {
      id: crypto.randomUUID(),
      query,
      maxResults: limit,
      status: TaskStatus.PENDING,
      progress: 0,
      resultsCount: 0,
      results: [],
      createdAt: new Date().toISOString(),
      csvUrl: '#'
    };

    setTimeout(() => {
      setTasks(prev => [newTask, ...prev]);
      setActiveTask(newTask);
      setQuery('');
      setIsSubmitting(false);
    }, 1000);
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED: return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case TaskStatus.FAILED: return <AlertCircle className="w-4 h-4 text-red-500" />;
      case TaskStatus.ENRICHING: return <Database className="w-4 h-4 text-purple-500 animate-pulse" />;
      default: return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
    }
  };

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED: return 'ZAKOŃCZONO';
      case TaskStatus.FAILED: return 'BŁĄD';
      case TaskStatus.ENRICHING: return 'WZBOGACANIE';
      case TaskStatus.RUNNING: return 'W TOKU';
      default: return 'OCZEKIWANIE';
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED: return 'bg-green-100 text-green-700 border-green-200';
      case TaskStatus.FAILED: return 'bg-red-100 text-red-700 border-red-200';
      case TaskStatus.ENRICHING: return 'bg-purple-100 text-purple-700 border-purple-200';
      case TaskStatus.RUNNING: return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2 font-bold text-xl text-blue-400">
            <Layers className="w-6 h-6" />
            <span>LeadFlow PL</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Zaawansowany B2B Scraper</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium">
            <BarChart3 className="w-5 h-5" /> Panel Główny
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors">
            <Search className="w-5 h-5" /> Nowe Wyszukiwanie
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors">
            <Filter className="w-5 h-5" /> Automatyzacja
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors">
            <Database className="w-5 h-5" /> Historia
          </button>
        </nav>
        
        <div className="p-4 mt-auto border-t border-slate-800 text-xs text-slate-500">
          v1.1.0 Gotowy do produkcji
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-lg font-semibold text-slate-800">Panel Zarządzania Ekstrakcją</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">Saldo Apify: $124.50</span>
            <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-slate-500">
              LF
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
          
          {/* Action Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">Rozpocznij Nową Ekstrakcję</h2>
              <p className="text-sm text-slate-500">Pobierz dane firm z Google Maps wraz z automatycznym wyszukiwaniem danych kontaktowych.</p>
            </div>
            
            <form onSubmit={handleScrape} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="np. 'Piekarnie Rzeszów' lub 'Firmy IT Warszawa'"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="flex gap-2">
                <select 
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-32"
                >
                  <option value={10}>10 wyn.</option>
                  <option value={20}>20 wyn.</option>
                  <option value={50}>50 wyn.</option>
                  <option value={100}>100 wyn.</option>
                  <option value={500}>500 wyn.</option>
                  <option value={1000}>1000 wyn.</option>
                  <option value={10000}>10000 wyn.</option>
                </select>
                <button 
                  disabled={isSubmitting || !query}
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Uruchom"}
                </button>
              </div>
            </form>
          </div>

          {/* Active Tasks Grid */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
              <Database className="w-4 h-4" /> Historia Ekstrakcji
            </h3>
            
            {tasks.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-slate-200 text-slate-400">
                Brak aktywnych zadań. Wpisz frazę powyżej, aby zacząć.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {tasks.map((task) => (
                  <div 
                    key={task.id} 
                    className={`bg-white rounded-xl border p-4 transition-all hover:shadow-md cursor-pointer ${activeTask?.id === task.id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200'}`}
                    onClick={() => setActiveTask(task)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${getStatusColor(task.status)}`}>
                          {getStatusIcon(task.status)}
                          {getStatusLabel(task.status)}
                        </div>
                        <h4 className="font-bold text-slate-800">"{task.query}"</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        {task.status === TaskStatus.COMPLETED && (
                          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors">
                            <Download className="w-4 h-4" /> Eksportuj CSV
                          </button>
                        )}
                        <span className="text-xs text-slate-400">{new Date(task.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                    
                    {/* Progress Bar or Error Message */}
                    {task.status === TaskStatus.FAILED ? (
                       <div className="text-xs text-red-600 flex items-center gap-1 bg-red-50 p-2 rounded">
                          <AlertTriangle className="w-3 h-3" />
                          <span className="font-medium">Wystąpił błąd:</span> {task.error || "Nieznany błąd"}
                       </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-blue-500 h-full transition-all duration-1000" 
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-slate-600">{task.progress}%</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Preview Results Table */}
          {activeTask && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <h3 className="font-bold text-slate-800">
                    {activeTask.status === TaskStatus.FAILED 
                     ? <span className="text-red-600 flex items-center gap-2"><AlertTriangle className="w-5 h-5"/> Błąd wykonania zadania</span>
                     : `Podgląd wyników dla: ${activeTask.query}`
                    }
                </h3>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <span>Pokazywanie pierwszych {activeTask.status === TaskStatus.COMPLETED ? 5 : 0} z {activeTask.maxResults} pozycji</span>
                </div>
              </div>

              {activeTask.status === TaskStatus.FAILED ? (
                 <div className="p-8 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-800 mb-2">Ups! Coś poszło nie tak.</h4>
                    <p className="text-slate-500 max-w-md mb-6">
                        {activeTask.error || "Wystąpił nieoczekiwany błąd podczas przetwarzania danych. Sprawdź logi serwera lub spróbuj ponownie później."}
                    </p>
                    <button onClick={() => setActiveTask(null)} className="text-blue-600 hover:underline font-medium">
                        Zamknij podgląd
                    </button>
                 </div>
              ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Nazwa Firmy</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Strona WWW</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Kontakt</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Akcje</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activeTask.status === TaskStatus.COMPLETED ? (
                        [1, 2, 3, 4, 5].map(i => (
                            <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="px-4 py-4">
                                <div className="font-semibold text-slate-900">Firma Przykładowa {i}</div>
                                <div className="text-xs text-slate-500 italic">ul. Przykładowa {i*10}, 35-001 Rzeszów</div>
                            </td>
                            <td className="px-4 py-4">
                                <a href="#" className="text-blue-600 hover:underline flex items-center gap-1 text-sm" onClick={(e) => e.preventDefault()}>
                                www.firma-{i}.pl <ExternalLink className="w-3 h-3" />
                                </a>
                            </td>
                            <td className="px-4 py-4 space-y-1">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Mail className="w-3.5 h-3.5" /> biuro@firma-{i}.pl
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Phone className="w-3.5 h-3.5" /> +48 123 456 78{i}
                                </div>
                            </td>
                            <td className="px-4 py-4">
                                <button className="p-2 hover:bg-slate-100 rounded-md transition-colors text-slate-400">
                                <ChevronRight className="w-5 h-5" />
                                </button>
                            </td>
                            </tr>
                        ))
                        ) : (
                        <tr>
                            <td colSpan={4} className="px-4 py-12 text-center text-slate-400 italic">
                            {activeTask.status === TaskStatus.ENRICHING 
                                ? "Wyszukiwanie adresów e-mail oraz numerów telefonów na stronach WWW..." 
                                : activeTask.status === TaskStatus.RUNNING 
                                ? "Pobieranie listy firm z Google Maps (Apify Scraper)..."
                                : "Oczekiwanie na rozpoczęcie zadania..."}
                            </td>
                        </tr>
                        )}
                    </tbody>
                    </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
