
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import GeneratorForm from './components/GeneratorForm';
import ResultsDisplay from './components/ResultsDisplay';
import HistoryList from './components/HistoryList';
import AIAssistantModal from './components/AIAssistantModal';
import Notification from './components/Notification';
import GroundedSearch from './components/GroundedSearch';
import ActivityLog from './components/ActivityLog';
import FeedbackForm from './components/FeedbackForm';
import PdfUploadForm from './components/PdfUploadForm';
import { View, Module, FormData, HistoryItem, NotificationType, GeneratedSection, ActivityLogItem, FeedbackItem } from './types';
import { getCPSuggestions, getTopicSuggestions, generateAdminContent, generateSoalContentSections, generateTryoutContent, generateSuperContent } from './services/geminiService';

const App: React.FC = () => {
  const [view, setView] = useState<View>('dashboard');
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedSections, setGeneratedSections] = useState<GeneratedSection[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isCpModalOpen, setIsCpModalOpen] = useState(false);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [modalFormData, setModalFormData] = useState<Partial<FormData>>({});
  const [notification, setNotification] = useState<{ message: string; type: NotificationType } | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const progressIntervalRef = useRef<number | null>(null);
  const [lastSubmittedFormData, setLastSubmittedFormData] = useState<FormData | null>(null);
  const [savedSession, setSavedSession] = useState<HistoryItem | null>(null);
  
  const [activityLog, setActivityLog] = useState<ActivityLogItem[]>([]);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  
  useEffect(() => {
    try {
      const storedLog = localStorage.getItem('activityLog');
      if (storedLog) setActivityLog(JSON.parse(storedLog));

      const storedFeedback = localStorage.getItem('appFeedback');
      if (storedFeedback) setFeedback(JSON.parse(storedFeedback));

      const storedHistory = localStorage.getItem('generationHistory');
      if (storedHistory) setHistory(JSON.parse(storedHistory));

      const savedSessionData = localStorage.getItem('savedGenerationSession');
      if (savedSessionData) setSavedSession(JSON.parse(savedSessionData));

    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('generationHistory', JSON.stringify(history));
    } catch (error) {
      console.error("Failed to save history to localStorage", error);
    }
  }, [history]);

  useEffect(() => {
    try {
        localStorage.setItem('activityLog', JSON.stringify(activityLog));
    } catch (error) {
        console.error("Failed to save activity log to localStorage", error);
    }
  }, [activityLog]);

  useEffect(() => {
    try {
        localStorage.setItem('appFeedback', JSON.stringify(feedback));
    } catch (error) {
        console.error("Failed to save feedback to localStorage", error);
    }
  }, [feedback]);
  
  const showNotification = (message: string, type: NotificationType) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };
  
  const handleSaveSession = () => {
    if (generatedSections.length > 0 && lastSubmittedFormData && currentModule) {
      const sessionToSave: HistoryItem = {
        id: 'saved_session',
        ...lastSubmittedFormData,
        module_type: currentModule,
        generated_sections: generatedSections,
        created_at: new Date().toISOString(),
      };
      try {
        localStorage.setItem('savedGenerationSession', JSON.stringify(sessionToSave));
        showNotification('Sesi berhasil disimpan!', 'success');
      } catch (error) {
        console.error("Failed to save session to localStorage", error);
        showNotification('Gagal menyimpan sesi.', 'error');
      }
    } else {
      showNotification('Tidak ada konten untuk disimpan.', 'warning');
    }
  };

  const handleRestoreSession = () => {
    if (savedSession) {
      setCurrentModule(savedSession.module_type);
      setLastSubmittedFormData(savedSession);
      setGeneratedSections(savedSession.generated_sections);
      setView('results');
      setSavedSession(null); 
      localStorage.removeItem('savedGenerationSession');
      showNotification('Sesi berhasil dipulihkan.', 'success');
    }
  };

  const handleDismissSavedSession = () => {
    localStorage.removeItem('savedGenerationSession');
    setSavedSession(null);
    showNotification('Sesi tersimpan telah dihapus.', 'success');
  };

  const handleModuleSelect = (module: Module | View) => {
     if (module === 'admin' || module === 'soal' || module === 'tryout' || module === 'super') {
        setCurrentModule(module as Module);
        setView('form');
        setGeneratedSections([]);
    } else {
        setView(module as View);
    }
  };
  
  const handleBack = () => {
    setView('dashboard');
    setCurrentModule(null);
    setGeneratedSections([]);
  };

  const clearProgressInterval = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);
  
  const addActivityLog = (formData: FormData, module: Module) => {
    const details = `${formData.mata_pelajaran} - Kelas ${formData.kelas}`;

    const newLog: ActivityLogItem = {
      id: Date.now().toString(),
      user: "Guru",
      module_type: module,
      details: details,
      created_at: new Date().toISOString(),
    };
    setActivityLog(prev => [newLog, ...prev]);
  };

  const startLoadingSimulation = (formData: FormData) => {
      setIsLoading(true);
      setGeneratedSections([]);
      setLastSubmittedFormData(formData);
      setGenerationProgress(0);
      clearProgressInterval();

      const SIMULATED_DURATION = formData.use_thinking_mode ? 15000 : 8000;
      const MAX_SIMULATED_PROGRESS = 95;
      const startTime = Date.now();

      progressIntervalRef.current = window.setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const progress = Math.min(
          (elapsedTime / SIMULATED_DURATION) * 100,
          MAX_SIMULATED_PROGRESS
        );
        setGenerationProgress(progress);
        if (progress >= MAX_SIMULATED_PROGRESS) {
          clearProgressInterval();
        }
      }, 100);
  }
  
  const finishLoadingSimulation = (callback: () => void) => {
      clearProgressInterval();
      setGenerationProgress(100);

      setTimeout(() => {
        callback();
        setIsLoading(false);
      }, 500);
  }

  const handleGenericError = (error: unknown) => {
      console.error("Error generating content:", error);
      let errorMessage = 'Terjadi kesalahan saat generate. Silakan coba lagi.';
      if (error instanceof Error) {
        const errorString = error.toString().toLowerCase();
        if (errorString.includes('503') || errorString.includes('unavailable')) {
            errorMessage = 'Server AI sedang sibuk. Mohon coba lagi nanti.';
        }
      }
      showNotification(errorMessage, 'error');
      setView('form');
      setIsLoading(false);
      clearProgressInterval();
      setGenerationProgress(0);
  }

  const handleFormSubmit = async (formData: FormData) => {
    if (!currentModule || currentModule === 'super') return;
    
    localStorage.removeItem('savedGenerationSession');
    setSavedSession(null);
    startLoadingSimulation(formData);

    try {
      let sections: GeneratedSection[] = [];
      if (currentModule === 'admin') {
        sections = await generateAdminContent(formData);
      } else if (currentModule === 'soal') {
        sections = await generateSoalContentSections(formData);
      } else if (currentModule === 'tryout') {
        sections = await generateTryoutContent(formData);
      }
      
      finishLoadingSimulation(() => {
          setGeneratedSections(sections);
          setView('results');
          
          const newHistoryItem: HistoryItem = {
            id: Date.now().toString(),
            ...formData,
            module_type: currentModule,
            generated_sections: sections,
            created_at: new Date().toISOString(),
          };
          setHistory(prev => [newHistoryItem, ...prev]);
          addActivityLog(formData, currentModule);
          showNotification('Perangkat berhasil digenerate!', 'success');
      });

    } catch (error) {
      handleGenericError(error);
    }
  };

  const handleSuperGeneratorSubmit = async (formData: FormData, textContent: string) => {
    if (currentModule !== 'super') return;

    localStorage.removeItem('savedGenerationSession');
    setSavedSession(null);
    startLoadingSimulation(formData);

    try {
        const sections = await generateSuperContent(formData, textContent);
        
        finishLoadingSimulation(() => {
            setGeneratedSections(sections);
            setView('results');
            
            const newHistoryItem: HistoryItem = {
              id: Date.now().toString(),
              ...formData,
              module_type: 'super',
              generated_sections: sections,
              created_at: new Date().toISOString(),
            };
            setHistory(prev => [newHistoryItem, ...prev]);
            addActivityLog(formData, 'super');
            showNotification('Perangkat terpusat berhasil digenerate!', 'success');
        });

    } catch (error) {
      handleGenericError(error);
    }
};

  const handleShowAIAssistant = (data: Partial<FormData>, type: 'cp' | 'topic') => {
    if(!data.jenjang || !data.kelas || !data.mata_pelajaran) {
      showNotification('Pilih jenjang, kelas, dan mata pelajaran terlebih dahulu', 'warning');
      return;
    }
    setModalFormData(data);
    if (type === 'cp') {
      setIsCpModalOpen(true);
    } else {
      setIsTopicModalOpen(true);
    }
  };

  const handleViewHistory = (item: HistoryItem) => {
    setCurrentModule(item.module_type);
    setLastSubmittedFormData(item);
    setGeneratedSections(item.generated_sections);
    setView('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteHistory = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
    showNotification('Riwayat berhasil dihapus', 'success');
  };

  const handleUpdateSectionContent = (id: string, newContent: string) => {
    setGeneratedSections(prevSections =>
        prevSections.map(section =>
            section.id === id ? { ...section, content: newContent } : section
        )
    );
  };

  const handleDeleteSection = (id: string) => {
      setGeneratedSections(prevSections =>
          prevSections.filter(section => section.id !== id)
      );
  };

  const handleFeedbackSubmit = (rating: number, comment: string) => {
    const newFeedback: FeedbackItem = {
        id: Date.now().toString(),
        user: "Guru",
        rating,
        comment,
        created_at: new Date().toISOString(),
    };
    setFeedback(prev => [newFeedback, ...prev]);
    showNotification('Terima kasih atas masukan Anda!', 'success');
  };

  const renderContent = () => {
    switch(view) {
        case 'dashboard':
            return <Dashboard onModuleSelect={handleModuleSelect} />;
        case 'form':
            if (currentModule === 'super') {
                return <PdfUploadForm
                    onSubmit={handleSuperGeneratorSubmit}
                    onBack={handleBack}
                    isLoading={isLoading}
                    generationProgress={generationProgress}
                />
            }
            return currentModule && (
                <GeneratorForm 
                    module={currentModule} 
                    onSubmit={handleFormSubmit}
                    onBack={handleBack}
                    onShowAIAssistant={handleShowAIAssistant}
                    isLoading={isLoading}
                    generationProgress={generationProgress}
                />
            );
        case 'results':
            return generatedSections.length > 0 && lastSubmittedFormData && (
                <ResultsDisplay 
                    module={currentModule!}
                    sections={generatedSections}
                    formData={lastSubmittedFormData}
                    onUpdateSectionContent={handleUpdateSectionContent}
                    onDeleteSection={handleDeleteSection}
                    onNewGeneration={() => setView('form')}
                    onBack={handleBack}
                    onSaveSession={handleSaveSession}
                />
            );
        case 'groundedSearch':
            return <GroundedSearch onBack={handleBack} />;
        default:
            return <Dashboard onModuleSelect={handleModuleSelect} />;
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {view === 'dashboard' && savedSession && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 mb-6 rounded-md shadow-lg" role="alert">
            <h3 className="font-bold">Sesi Tersimpan Ditemukan</h3>
            <p>Anda memiliki pekerjaan yang belum selesai dari <span className="font-medium">{new Date(savedSession.created_at).toLocaleString('id-ID')}</span>. Ingin melanjutkannya?</p>
            <div className="mt-3">
              <button onClick={handleRestoreSession} className="bg-yellow-500 text-white font-bold py-1 px-3 rounded text-sm hover:bg-yellow-600 transition-colors">
                Lanjutkan
              </button>
              <button onClick={handleDismissSavedSession} className="ml-2 border border-yellow-600 text-yellow-800 font-bold py-1 px-3 rounded text-sm hover:bg-yellow-200 transition-colors">
                Hapus
              </button>
            </div>
          </div>
        )}

        {renderContent()}
        
        {view === 'dashboard' && (
            <>
                <div className="grid lg:grid-cols-2 gap-8 mt-8">
                    <HistoryList 
                        history={history}
                        onView={handleViewHistory}
                        onDelete={handleDeleteHistory}
                    />
                    <ActivityLog
                        logs={activityLog}
                    />
                </div>
                <div className="mt-8">
                    <FeedbackForm onFeedbackSubmit={handleFeedbackSubmit} />
                </div>
            </>
        )}

      </main>
      <Footer />
      
      {(isCpModalOpen || isTopicModalOpen) && (
        <AIAssistantModal 
          isOpen={isCpModalOpen || isTopicModalOpen}
          onClose={isCpModalOpen ? () => setIsCpModalOpen(false) : () => setIsTopicModalOpen(false)}
          formData={modalFormData}
          getSuggestions={isCpModalOpen ? getCPSuggestions : getTopicSuggestions}
          suggestionType={'markdown'}
          title={isCpModalOpen ? 'AI Asisten - Bantuan CP' : 'AI Asisten - Bantuan Topik'}
          description={isCpModalOpen 
            ? 'AI telah membuat beberapa saran Elemen CP dalam format Markdown. Anda bisa menyalin atau langsung menerapkannya ke dalam kolom.'
            : 'AI telah membuat beberapa saran Topik/Materi dalam format Markdown. Anda bisa menyalin atau langsung menerapkannya.'
          }
          targetElementId={isCpModalOpen ? 'cp_elements' : 'topik_materi'}
        />
      )}

      {notification && <Notification message={notification.message} type={notification.type} />}
    </div>
  );
};

export default App;
