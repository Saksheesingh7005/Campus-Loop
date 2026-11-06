import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { ResourceDetailsModal } from './components/ResourceDetailsModal';
import { ListResourceModal } from './components/ListResourceModal';
import { ChatModal } from './components/ChatModal';

import { LandingPage } from './views/LandingPage';
import { ExploreResources } from './views/ExploreResources';
import { StudentDashboard } from './views/StudentDashboard';
import { MyActivity } from './views/MyActivity';
import { AdminDashboard } from './views/AdminDashboard';

function MainApp() {
  const { user, isAuthenticated, isAdmin, openAuthModal } = useAuth();

  // Read initial view from window.location.hash or default to 'landing'
  const getInitialView = () => {
    const hash = window.location.hash.replace('#', '');
    if (['landing', 'explore', 'dashboard', 'activity', 'admin'].includes(hash)) {
      return hash;
    }
    return 'landing';
  };

  const [currentView, setCurrentViewState] = useState(getInitialView);
  const [selectedResource, setSelectedResource] = useState(null);
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [activeChatRequest, setActiveChatRequest] = useState(null);
  const [previewResources, setPreviewResources] = useState([]);

  // Change view and sync hash
  const setCurrentView = (view) => {
    // Protected views check
    if (['dashboard', 'activity'].includes(view) && !isAuthenticated) {
      openAuthModal('login');
      return;
    }
    if (view === 'admin' && !isAdmin) {
      openAuthModal('login');
      return;
    }

    setCurrentViewState(view);
    window.location.hash = view === 'landing' ? '' : view;
  };

  // Sync on browser back/forward or hash change
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'landing';
      if (['landing', 'explore', 'dashboard', 'activity', 'admin'].includes(hash)) {
        setCurrentViewState(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Fetch initial preview resources for landing page
  useEffect(() => {
    api.getResources()
      .then((res) => {
        if (res && res.resources) {
          setPreviewResources(res.resources);
        }
      })
      .catch((err) => console.warn('Could not load preview resources:', err));
  }, []);

  const handleEditResource = (resource) => {
    setEditingResource(resource);
    setIsListModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenListModal={() => {
          if (!isAuthenticated) {
            openAuthModal('login');
          } else {
            setEditingResource(null);
            setIsListModalOpen(true);
          }
        }}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        {currentView === 'landing' && (
          <LandingPage
            setCurrentView={setCurrentView}
            onSelectResource={(r) => setSelectedResource(r)}
            previewResources={previewResources}
          />
        )}

        {currentView === 'explore' && (
          <ExploreResources
            onSelectResource={(r) => setSelectedResource(r)}
            onOpenListModal={() => {
              if (!isAuthenticated) {
                openAuthModal('login');
              } else {
                setEditingResource(null);
                setIsListModalOpen(true);
              }
            }}
          />
        )}

        {currentView === 'dashboard' && (
          <StudentDashboard
            setCurrentView={setCurrentView}
            onOpenListModal={() => {
              setEditingResource(null);
              setIsListModalOpen(true);
            }}
            onSelectResource={(r) => setSelectedResource(r)}
            onOpenChat={(req) => setActiveChatRequest(req)}
          />
        )}

        {currentView === 'activity' && (
          <MyActivity
            onOpenListModal={() => {
              setEditingResource(null);
              setIsListModalOpen(true);
            }}
            onEditResource={handleEditResource}
            onOpenChat={(req) => setActiveChatRequest(req)}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard
            onOpenChat={(req) => setActiveChatRequest(req)}
          />
        )}
      </main>

      {/* Global Footer */}
      <Footer setCurrentView={setCurrentView} />

      {/* Modals */}
      <AuthModal />

      <ChatModal
        request={activeChatRequest}
        isOpen={!!activeChatRequest}
        onClose={() => setActiveChatRequest(null)}
      />

      <ResourceDetailsModal
        resource={selectedResource}
        onClose={() => setSelectedResource(null)}
        onRequestSuccess={() => {
          // Refresh preview
          api.getResources().then((r) => setPreviewResources(r.resources || []));
        }}
        onNavigateToRequests={() => {
          setCurrentView('activity');
        }}
      />

      <ListResourceModal
        isOpen={isListModalOpen}
        editingResource={editingResource}
        onClose={() => {
          setIsListModalOpen(false);
          setEditingResource(null);
        }}
        onResourceSaved={() => {
          api.getResources().then((r) => setPreviewResources(r.resources || []));
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
