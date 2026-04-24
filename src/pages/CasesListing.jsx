import { useEffect, useMemo, useState } from 'react';

const getToken = () => localStorage.getItem('lawyerslog_token') || sessionStorage.getItem('lawyerslog_token');
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

const getLoggedInUser = () => {
  const rawUser = localStorage.getItem('lawyerslog_user') || sessionStorage.getItem('lawyerslog_user');
  if (rawUser) {
    try {
      const parsed = JSON.parse(rawUser);
      const safeName = parsed?.name || parsed?.email?.split('@')[0] || 'Claimant';
      return {
        name: safeName,
        email: parsed?.email || '',
        role: parsed?.role || 'claimant'
      };
    } catch {
      // continue to fallback for older saved keys
    }
  }

  const fallbackName = localStorage.getItem('lawyerslog_user_name') || sessionStorage.getItem('lawyerslog_user_name') || 'Claimant';
  return { name: fallbackName, email: '', role: 'claimant' };
};

const getInitials = (name) => {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'CL';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
};

const statusClass = (status) => {
  if (status === 'closed' || status === 'resolved') return 'status-badge status-closed';
  return 'status-badge status-progress';
};

const labelStatus = (status) => {
  if (status === 'closed' || status === 'resolved') return 'Solved';
  return 'In Progress';
};

const SidebarIcon = ({ type }) => {
  const common = { width: 25, height: 25, viewBox: '0 0 24 24', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' };

  if (type === 'my-cases') {
    return (
      <svg {...common}>
        <rect x="3" y="6" width="18" height="13" rx="2" stroke="#FFFFFF" strokeWidth="1.8" />
        <path d="M9 6V5C9 3.9 9.9 3 11 3H13C14.1 3 15 3.9 15 5V6" stroke="#FFFFFF" strokeWidth="1.8" />
        <path d="M3 11H21" stroke="#FFFFFF" strokeWidth="1.8" />
      </svg>
    );
  }

  if (type === 'add') {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="18" height="18" rx="6" fill="#FFFFFF" />
        <path d="M12 8V16M8 12H16" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === 'lawyer') {
    return (
      <svg {...common}>
        <path d="M4 8L12 4L20 8L12 12L4 8Z" stroke="#FFFFFF" strokeWidth="1.6" />
        <path d="M8 11V16M16 11V16" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M6 18H18" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="19" cy="13" r="1.8" stroke="#FFFFFF" strokeWidth="1.4" />
      </svg>
    );
  }

  if (type === 'tracking') {
    return (
      <svg {...common}>
        <rect x="3.5" y="10.5" width="9" height="9" rx="2" stroke="#FFFFFF" strokeWidth="1.7" />
        <path d="M16 5.5C17.7 5.5 19 6.8 19 8.5C19 10.8 16 13.8 16 13.8C16 13.8 13 10.8 13 8.5C13 6.8 14.3 5.5 16 5.5Z" stroke="#FFFFFF" strokeWidth="1.7" />
        <circle cx="16" cy="8.5" r="1.1" fill="#FFFFFF" />
      </svg>
    );
  }

  if (type === 'communication') {
    return (
      <svg {...common}>
        <path d="M5 6.5C5 5.1 6.1 4 7.5 4H16.5C17.9 4 19 5.1 19 6.5V13C19 14.4 17.9 15.5 16.5 15.5H10L6 19V15.5H7.5C6.1 15.5 5 14.4 5 13V6.5Z" fill="#FFFFFF" />
        <path d="M9 8.5H15M9 11.5H13" stroke="#000000" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === 'settlement') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" fill="#FFFFFF" />
        <circle cx="12" cy="12" r="2.6" fill="#000000" />
      </svg>
    );
  }

  if (type === 'closure') {
    return (
      <svg {...common}>
        <rect x="4" y="6" width="16" height="13" rx="2" stroke="#FFFFFF" strokeWidth="1.8" />
        <path d="M8 6V5.2C8 4 9 3 10.2 3H13.8C15 3 16 4 16 5.2V6" stroke="#FFFFFF" strokeWidth="1.8" />
        <path d="M4 11H20" stroke="#FFFFFF" strokeWidth="1.8" />
      </svg>
    );
  }

  return null;
};

function CasesListing() {
  const [cases, setCases] = useState([]);
  const [hasFetched, setHasFetched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('my-cases');
  const loggedInUser = getLoggedInUser();
  const displayName = loggedInUser.name;
  const profileInitials = getInitials(displayName);

  const sectionMeta = {
    'my-cases': { label: 'My Cases' },
    'add-new-case': { label: 'Add New Case', stage: 'Work in Progress', message: 'Case submission wizard is currently under active development.' },
    'lawyer-matching': { label: 'Lawyer Matching', stage: 'Future Progress', message: 'Smart lawyer recommendation module will be enabled in upcoming releases.' },
    'case-tracking': { label: 'Case Tracking', stage: 'Work in Progress', message: 'Timeline and milestone tracking views are in implementation phase.' },
    communication: { label: 'Communication', stage: 'Future Progress', message: 'In-app chat and notification center will be added soon.' },
    settlement: { label: 'Settlement', stage: 'Future Progress', message: 'Settlement negotiation workflow is planned for the next phase.' },
    'case-closure': { label: 'Case Closure', stage: 'Future Progress', message: 'Digital closure checklist and final documentation are coming soon.' }
  };

  const isMyCases = activeSection === 'my-cases';

  const goToAddCase = () => {
    window.location.href = '/add-case';
  };

  const displayCases = useMemo(() => {
    if (hasFetched) return cases;
    return [
      { caseId: '#Case001', title: 'Car Accident, Medical', claimant: { name: 'John Smith', phone: '0945464655' }, createdAt: '2025-12-11', lawyer: { name: 'John Smith' }, status: 'negotiation' },
      { caseId: '#Case002', title: 'Property Damage', claimant: { name: 'David', phone: '0945464655' }, createdAt: '2025-12-13', lawyer: { name: 'John Smith' }, status: 'negotiation' },
      { caseId: '#Case003', title: 'Medical Claim', claimant: { name: 'Robert', phone: '0945464655' }, createdAt: '2025-12-14', lawyer: { name: 'John Smith' }, status: 'closed' }
    ];
  }, [cases, hasFetched]);

  const handleDeleteCase = async (caseMongoId) => {
    const token = getToken();
    if (!token || !caseMongoId) return;

    const shouldDelete = window.confirm('Are you sure you want to delete this case?');
    if (!shouldDelete) return;

    try {
      const response = await fetch(`${API_BASE}/api/cases/${caseMongoId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        alert(result?.message || 'Failed to delete case');
        return;
      }

      setCases((prev) => prev.filter((item) => item._id !== caseMongoId));
    } catch {
      alert('Unable to connect to backend');
    }
  };

  const handleEditCase = (caseMongoId) => {
    if (!caseMongoId) return;
    window.location.href = `/add-case?id=${caseMongoId}`;
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      window.location.href = '/';
      return;
    }

    const loadCases = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/api/cases`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();

        if (!response.ok) {
          setError(data.message || 'Failed to load cases');
          return;
        }

        const mapped = (data.cases || []).map((item, index) => ({
          _id: item._id,
          caseId: item.caseId || `#Case${String(index + 1).padStart(3, '0')}`,
          title: item.incidentType ? item.incidentType.replaceAll('_', ' ') : 'General Case',
          claimant: item.claimant || { name: 'N/A', phone: '-' },
          createdAt: item.createdAt,
          lawyer: item.lawyer || { name: '-' },
          status: item.status || 'submitted'
        }));

        setCases(mapped);
        setHasFetched(true);
      } catch {
        setError('Unable to connect to backend');
        setHasFetched(true);
      } finally {
        setLoading(false);
      }
    };

    loadCases();
  }, []);

  return (
    <main className="cases-page">
      <aside className="cases-sidebar">
        <div className="sidebar-top">
          <div className="sidebar-logo">LAWYERSLOG</div>
          <nav className="sidebar-menu">
            <button className={`menu-item ${activeSection === 'my-cases' ? 'menu-item-active' : ''}`} type="button" onClick={() => setActiveSection('my-cases')}>
              <span className="menu-icon"><SidebarIcon type="my-cases" /></span>
              <span className={`menu-label ${activeSection === 'my-cases' ? 'menu-label-active' : ''}`}>My Cases</span>
            </button>
            <button className="menu-item" type="button" onClick={goToAddCase}>
              <span className="menu-icon"><SidebarIcon type="add" /></span>
              <span className="menu-label">Add New Case</span>
            </button>
            <button className={`menu-item ${activeSection === 'lawyer-matching' ? 'menu-item-active' : ''}`} type="button" onClick={() => setActiveSection('lawyer-matching')}>
              <span className="menu-icon"><SidebarIcon type="lawyer" /></span>
              <span className="menu-label">Lawyer Matching</span>
            </button>
            <button className={`menu-item ${activeSection === 'case-tracking' ? 'menu-item-active' : ''}`} type="button" onClick={() => setActiveSection('case-tracking')}>
              <span className="menu-icon"><SidebarIcon type="tracking" /></span>
              <span className="menu-label">Case Tracking</span>
            </button>
            <button className={`menu-item ${activeSection === 'communication' ? 'menu-item-active' : ''}`} type="button" onClick={() => setActiveSection('communication')}>
              <span className="menu-icon"><SidebarIcon type="communication" /></span>
              <span className="menu-label">Communication</span>
            </button>
            <button className={`menu-item ${activeSection === 'settlement' ? 'menu-item-active' : ''}`} type="button" onClick={() => setActiveSection('settlement')}>
              <span className="menu-icon"><SidebarIcon type="settlement" /></span>
              <span className="menu-label">Settlement</span>
            </button>
            <button className={`menu-item ${activeSection === 'case-closure' ? 'menu-item-active' : ''}`} type="button" onClick={() => setActiveSection('case-closure')}>
              <span className="menu-icon"><SidebarIcon type="closure" /></span>
              <span className="menu-label">Case Closure</span>
            </button>
          </nav>
        </div>

        <div className="sidebar-footer">
          <button
            className="logout-btn"
            onClick={() => {
              localStorage.removeItem('lawyerslog_token');
              localStorage.removeItem('lawyerslog_user');
              localStorage.removeItem('lawyerslog_user_name');
              sessionStorage.removeItem('lawyerslog_token');
              sessionStorage.removeItem('lawyerslog_user');
              sessionStorage.removeItem('lawyerslog_user_name');
              window.location.href = '/';
            }}
          >
            <span className="menu-icon logout-icon-wrap">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 4.5H6.8C5.8 4.5 5 5.3 5 6.3V17.7C5 18.7 5.8 19.5 6.8 19.5H9" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
                <path d="M13 16.5L17.5 12L13 7.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M17.5 12H9" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
            <span className="logout-label">Logout</span>
          </button>

          <div className="sidebar-profile">
            <div className="profile-avatar">{profileInitials}</div>
            <div className="profile-details">
              <div className="profile-name">{displayName}</div>
              <div className="profile-link">View profile</div>
            </div>
          </div>
        </div>
      </aside>

      <section className="cases-content">
        <header className="cases-header">
          <h1>{sectionMeta[activeSection].label}</h1>
          <div className="profile-mini">{displayName}</div>
        </header>

        <section className="cases-welcome">
          <h2>Welcome Back, {displayName}</h2>
          <p>{isMyCases ? 'Here is your case Overview' : `${sectionMeta[activeSection].label} module status`}</p>
          <button className="add-case-btn" type="button" onClick={goToAddCase}>+ GET STARTED</button>
        </section>

        {isMyCases ? (
          <>
            <div className="cases-tabs">
              <span className="tab-active">Active Cases</span>
              <span>Pending Cases</span>
            </div>

            <div className="cases-table-head">
              <span>Case ID</span>
              <span>Case Title</span>
              <span>Claimant Name</span>
              <span>Date</span>
              <span>Lawyer Name</span>
              <span>Phone</span>
              <span>Status</span>
              <span>Action</span>
            </div>

            <div className="cases-table-body">
              {loading ? <div className="cases-note">Loading cases...</div> : null}
              {error ? <div className="cases-note cases-error">{error}</div> : null}

              {!loading && !error
                ? displayCases.slice(0, 10).map((item, index) => (
                    <div className="case-row" key={`${item.caseId}-${index}`}>
                      <span>{item.caseId}</span>
                      <span>{item.title}</span>
                      <span>{item.claimant?.name || '-'}</span>
                      <span>{formatDate(item.createdAt)}</span>
                      <span>{item.lawyer?.name || '-'}</span>
                      <span>{item.claimant?.phone || '-'}</span>
                      <span className={statusClass(item.status)}>{labelStatus(item.status)}</span>
                      <span className="row-actions">
                        <span
                          className="action-link action-link-edit"
                          role="button"
                          tabIndex={0}
                          onClick={() => handleEditCase(item._id)}
                          onKeyDown={(e) => e.key === 'Enter' && handleEditCase(item._id)}
                        >
                          Edit
                        </span>
                        <span
                          className="action-link action-link-delete"
                          role="button"
                          tabIndex={0}
                          onClick={() => handleDeleteCase(item._id)}
                          onKeyDown={(e) => e.key === 'Enter' && handleDeleteCase(item._id)}
                        >
                          Delete
                        </span>
                      </span>
                    </div>
                  ))
                : null}
            </div>

            <footer className="cases-footer">Showing 1-5 out of 50 results</footer>
          </>
        ) : (
          <section className="module-placeholder">
            <span className="module-badge">{sectionMeta[activeSection].stage}</span>
            <h3>{sectionMeta[activeSection].label}</h3>
            <p>{sectionMeta[activeSection].message}</p>
          </section>
        )}
      </section>
    </main>
  );
}

export default CasesListing;
