import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useWorkspace } from './contexts/WorkspaceContext';
import { Paper } from './types';

// Layout & Common Components
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { CommandPalette } from './components/common/CommandPalette';
import { ToastContainer } from './components/common/Toast';
import { MultiPaperToolbar } from './components/common/MultiPaperToolbar';

// Pages
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { LibraryPage } from './pages/LibraryPage';
import { UploadPage } from './pages/UploadPage';
import { PaperReaderPage } from './pages/PaperReaderPage';
import { DiscoverPage } from './pages/DiscoverPage';
import { ComparePage } from './pages/ComparePage';
import { LiteratureReviewPage } from './pages/LiteratureReviewPage';
import { ResearchGapsPage } from './pages/ResearchGapsPage';
import { ResearchIdeasPage } from './pages/ResearchIdeasPage';
import { CollectionsPage } from './pages/CollectionsPage';
import { NotesPage } from './pages/NotesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { VivaPresentationPage } from './pages/VivaPresentationPage';

export const App: React.FC = () => {
  const { user } = useAuth();
  const { setActivePaper } = useWorkspace();
  const [currentPage, setCurrentPage] = useState<string>('landing');

  const isAdmin = user?.email?.toLowerCase().includes('tanishq') || 
                  user?.email?.toLowerCase().includes('admin') || 
                  user?.role?.toLowerCase().includes('admin');


  // Handle navigation
  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle opening reader for a specific paper
  const handleOpenReader = (paper: Paper) => {
    setActivePaper(paper);
    setCurrentPage('reader');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If not authenticated, route to landing, login, register, or presentation
  if (!user) {
    if (currentPage === 'login') {
      return (
        <>
          <AuthPage onNavigate={handleNavigate} isRegister={false} />
          <ToastContainer />
        </>
      );
    }
    if (currentPage === 'register') {
      return (
        <>
          <AuthPage onNavigate={handleNavigate} isRegister={true} />
          <ToastContainer />
        </>
      );
    }
    if (currentPage === 'presentation') {
      return (
        <>
          <VivaPresentationPage onBack={() => handleNavigate('landing')} />
          <ToastContainer />
        </>
      );
    }
    return (
      <>
        <LandingPage onNavigate={handleNavigate} />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-brand-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar onNavigate={handleNavigate} currentPage={currentPage} />

      <div className="flex-1 flex">
        {/* Left Sidebar */}
        <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-x-hidden min-h-[calc(100vh-4rem)] pb-20 lg:pb-8">
          {currentPage === 'dashboard' && (
            <DashboardPage onNavigate={handleNavigate} onOpenReader={handleOpenReader} />
          )}
          {currentPage === 'library' && (
            <LibraryPage onNavigate={handleNavigate} onOpenReader={handleOpenReader} />
          )}
          {currentPage === 'upload' && (
            <UploadPage onNavigate={handleNavigate} onOpenReader={handleOpenReader} />
          )}
          {currentPage === 'reader' && (
            <PaperReaderPage onBack={() => handleNavigate('library')} />
          )}
          {currentPage === 'discover' && (
            <DiscoverPage onNavigate={handleNavigate} onOpenReader={handleOpenReader} />
          )}
          {currentPage === 'compare' && (
            <ComparePage />
          )}
          {currentPage === 'literature-review' && (
            <LiteratureReviewPage />
          )}
          {currentPage === 'research-gaps' && (
            <ResearchGapsPage />
          )}
          {currentPage === 'research-ideas' && (
            <ResearchIdeasPage />
          )}
          {currentPage === 'collections' && (
            <CollectionsPage onOpenReader={handleOpenReader} />
          )}
          {currentPage === 'notes' && (
            <NotesPage />
          )}
          {currentPage === 'analytics' && (
            <AnalyticsPage onOpenReader={handleOpenReader} />
          )}
          {currentPage === 'settings' && (
            <SettingsPage />
          )}
          {currentPage === 'profile' && (
            <ProfilePage />
          )}
          {currentPage === 'admin' && isAdmin && (
            <AdminDashboardPage />
          )}

          {currentPage === 'presentation' && (
            <VivaPresentationPage onBack={() => handleNavigate('dashboard')} />
          )}
        </main>
      </div>

      {/* Global Elements */}
      <MultiPaperToolbar onNavigate={handleNavigate} />
      <CommandPalette onNavigate={handleNavigate} />
      <ToastContainer />
    </div>
  );
};
