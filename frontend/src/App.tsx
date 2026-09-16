import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { Dashboard } from './pages/Dashboard';
import { Claims } from './pages/Claims';
import { NewAudit } from './pages/NewAudit';
import { AuditReport } from './pages/AuditReport';
import { AuditHistory } from './pages/AuditHistory';
import { Settings } from './pages/Settings';
import { CdtLibrary } from './pages/CdtLibrary';
import { Auth, DemoUser } from './pages/Auth';
import { fetchHealth } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedClaimId, setSelectedClaimId] = useState<string>('CLM-1001');
  const [latestAuditResult, setLatestAuditResult] = useState<any>(null);
  const [editingClaimId, setEditingClaimId] = useState<string | null>(null);
  const [selectedCdtCode, setSelectedCdtCode] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<string>('Local Database');
  const [demoUser, setDemoUser] = useState<DemoUser | null>(() => {
    const saved = localStorage.getItem('claim_shield_demo_user');
    const parsed = saved ? JSON.parse(saved) : null;
    return parsed?.id ? parsed : null;
  });

  useEffect(() => {
    fetchHealth()
      .then((res) => {
        if (res && res.database) {
          setDbStatus(res.database);
        }
      })
      .catch(() => {});
  }, []);

  const handleSelectClaim = (claimId: string) => {
    setSelectedClaimId(claimId);
    setLatestAuditResult(null);
    setActiveTab('report');
  };

  const handleEditClaim = (claimId: string) => {
    setEditingClaimId(claimId);
    setActiveTab('new-audit');
  };

  const handleStartAuditWithCode = (code: string) => {
    setSelectedCdtCode(code);
    setEditingClaimId(null);
    setActiveTab('new-audit');
  };

  const handleAuditComplete = (auditResult: any, claimId: string) => {
    setLatestAuditResult(auditResult);
    setSelectedClaimId(claimId);
    setActiveTab('report');
  };

  const handleLogout = () => {
    localStorage.removeItem('claim_shield_demo_user');
    setDemoUser(null);
    setActiveTab('dashboard');
  };

  if (!demoUser) {
    return <Auth onAuthenticated={setDemoUser} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} demoUser={demoUser} onLogout={handleLogout} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TopBar */}
        <TopBar
          onStartAudit={() => setActiveTab('new-audit')}
          dbStatus={dbStatus}
        />

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <Dashboard
              onSelectClaim={handleSelectClaim}
              onNewAudit={() => setActiveTab('new-audit')}
            />
          )}

          {activeTab === 'claims' && (
            <Claims
              onSelectClaim={handleSelectClaim}
              onNewAudit={() => setActiveTab('new-audit')}
            />
          )}

          {activeTab === 'new-audit' && (
            <NewAudit
              existingClaimId={editingClaimId}
              initialCdtCode={selectedCdtCode}
              onAuditComplete={(auditResult, claimId) => {
                setEditingClaimId(null);
                handleAuditComplete(auditResult, claimId);
              }}
            />
          )}

          {activeTab === 'report' && (
            <AuditReport
              claimId={selectedClaimId}
              initialAudit={latestAuditResult}
              onBack={() => setActiveTab('claims')}
              onViewHistory={() => setActiveTab('history')}
              onEditClaim={() => handleEditClaim(selectedClaimId)}
            />
          )}

          {activeTab === 'history' && (
            <AuditHistory onSelectClaim={handleSelectClaim} />
          )}

          {activeTab === 'cdt-library' && (
            <CdtLibrary onStartAuditWithCode={handleStartAuditWithCode} />
          )}

          {activeTab === 'settings' && <Settings />}
        </main>
      </div>
    </div>
  );
}

export default App;
