import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CaseSchema, CaseFormValues } from '../schemas/caseSchema';
import { StepIndicator } from '../components/addcase/StepIndicator';
import { PersonalDetails } from '../components/addcase/PersonalDetails';
import { IncidentDetails } from '../components/addcase/IncidentDetails';
import { InsuranceInfo } from '../components/addcase/InsuranceInfo';
import { MedicalInfo } from '../components/addcase/MedicalInfo';
import { SupportingDocuments } from '../components/addcase/SupportingDocuments';

interface FileState {
  medicalReport: File | null;
  accidentPhotos: File | null;
  insurancePolicy: File | null;
  policeReport: File | null;
  witnessDoc: File | null;
}

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
        email: parsed?.email || ''
      };
    } catch {
      // fallback below
    }
  }

  const fallbackName = localStorage.getItem('lawyerslog_user_name') || sessionStorage.getItem('lawyerslog_user_name') || 'Claimant';
  return { name: fallbackName, email: '' };
};

const getInitials = (name: string) => {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'CL';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const SidebarIcon: React.FC<{ type: string }> = ({ type }) => {
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

export const AddNewCase: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileState>({
    medicalReport: null,
    accidentPhotos: null,
    insurancePolicy: null,
    policeReport: null,
    witnessDoc: null
  });

  const methods = useForm<CaseFormValues>({
    resolver: zodResolver(CaseSchema),
    mode: 'onBlur'
  });

  const { handleSubmit } = methods;
  const loggedInUser = getLoggedInUser();
  const displayName = loggedInUser.name;
  const profileInitials = getInitials(displayName);

  React.useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const onSubmit = async (data: CaseFormValues) => {
    setIsSubmitting(true);
    try {
      const token = getToken();
      if (!token) {
        alert('Please log in again');
        window.location.href = '/';
        return;
      }

      // Create FormData for multipart/form-data submission
      const formData = new FormData();

      // Append all text fields
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value as string);
      });

      // Append files
      if (uploadedFiles.medicalReport) {
        formData.append('medicalReport', uploadedFiles.medicalReport);
      }
      if (uploadedFiles.accidentPhotos) {
        formData.append('accidentPhotos', uploadedFiles.accidentPhotos);
      }
      if (uploadedFiles.insurancePolicy) {
        formData.append('insurancePolicy', uploadedFiles.insurancePolicy);
      }
      if (uploadedFiles.policeReport) {
        formData.append('policeReport', uploadedFiles.policeReport);
      }
      if (uploadedFiles.witnessDoc) {
        formData.append('witnessDoc', uploadedFiles.witnessDoc);
      }

      const response = await fetch(`${API_BASE}/api/cases`, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (response.ok) {
        // Show success message
        alert('Case submitted successfully!');
        // Reset form
        methods.reset();
        setUploadedFiles({
          medicalReport: null,
          accidentPhotos: null,
          insurancePolicy: null,
          policeReport: null,
          witnessDoc: null
        });
        // Redirect to cases listing (optional)
        window.location.href = '/cases';
      } else {
        alert(result.message || 'Error submitting case');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error submitting case. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="cases-page">
      <aside className="cases-sidebar">
        <div className="sidebar-top">
          <div className="sidebar-logo">LAWYERSLOG</div>
          <nav className="sidebar-menu">
            <button className="menu-item" type="button" onClick={() => { window.location.href = '/cases'; }}>
              <span className="menu-icon"><SidebarIcon type="my-cases" /></span>
              <span className="menu-label">My Cases</span>
            </button>
            <button className="menu-item menu-item-active" type="button" onClick={() => { window.location.href = '/add-case'; }}>
              <span className="menu-icon"><SidebarIcon type="add" /></span>
              <span className="menu-label menu-label-active">Add New Case</span>
            </button>
            <button className="menu-item" type="button">
              <span className="menu-icon"><SidebarIcon type="lawyer" /></span>
              <span className="menu-label">Lawyer Matching</span>
            </button>
            <button className="menu-item" type="button">
              <span className="menu-icon"><SidebarIcon type="tracking" /></span>
              <span className="menu-label">Case Tracking</span>
            </button>
            <button className="menu-item" type="button">
              <span className="menu-icon"><SidebarIcon type="communication" /></span>
              <span className="menu-label">Communication</span>
            </button>
            <button className="menu-item" type="button">
              <span className="menu-icon"><SidebarIcon type="settlement" /></span>
              <span className="menu-label">Settlement</span>
            </button>
            <button className="menu-item" type="button">
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
          <h1>Submitting New Case</h1>
          <div className="profile-mini">{displayName}</div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-[#F4F5F7]">
          <div className="mb-8">
            <h1 className="text-[20px] font-bold text-black mb-1">Submitting New Case</h1>
            <p className="text-[18px] text-black">Provide the necessary information to submit a new legal case.</p>
          </div>

          <StepIndicator currentStep={0} />

          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <PersonalDetails />
              <IncidentDetails />
              <InsuranceInfo />
              <MedicalInfo />
              <SupportingDocuments onFilesChange={setUploadedFiles} />

              <div className="flex justify-center mb-8">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#CD0715] text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-[#a8000f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting && (
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  Create Case
                </button>
              </div>
            </form>
          </FormProvider>
        </div>
      </section>
    </main>
  );
};

export default AddNewCase;
