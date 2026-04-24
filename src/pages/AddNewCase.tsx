import React, { useState, useEffect } from 'react';
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

const API_BASE = import.meta.env.VITE_API_URL || '';

const getToken = () =>
  localStorage.getItem('lawyerslog_token') ||
  sessionStorage.getItem('lawyerslog_token');

const getLoggedInUser = () => {
  const rawUser =
    localStorage.getItem('lawyerslog_user') ||
    sessionStorage.getItem('lawyerslog_user');
  if (rawUser) {
    try {
      const parsed = JSON.parse(rawUser);
      return {
        name: parsed?.name || parsed?.email?.split('@')[0] || 'Claimant',
        email: parsed?.email || '',
      };
    } catch {}
  }
  return { name: 'Claimant', email: '' };
};

const getInitials = (name: string) => {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

export const AddNewCase: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileState>({
    medicalReport: null,
    accidentPhotos: null,
    insurancePolicy: null,
    policeReport: null,
    witnessDoc: null,
  });

  const methods = useForm<CaseFormValues>({
    resolver: zodResolver(CaseSchema),
    mode: 'onBlur',
  });

  const { handleSubmit } = methods;
  const user = getLoggedInUser();
  const initials = getInitials(user.name);

  const onSubmit = async (data: CaseFormValues) => {
    setIsSubmitting(true);
    try {
      const token = getToken();
      if (!token) {
        alert('Login required');
        window.location.href = '/';
        return;
      }
      const response = await fetch(`${API_BASE}/api/cases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      let result = {};
      try { result = await response.json(); } catch {}
      if (response.ok) {
        alert('Case submitted successfully');
        methods.reset();
        window.location.href = '/cases';
      } else {
        alert((result as any)?.message || 'Error submitting case');
      }
    } catch (err) {
      console.error(err);
      alert('Server error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('lawyerslog_token');
    localStorage.removeItem('lawyerslog_user');
    sessionStorage.removeItem('lawyerslog_token');
    sessionStorage.removeItem('lawyerslog_user');
    window.location.href = '/';
  };

  return (
    <main className="cases-page">
      <aside className="cases-sidebar">
        <div className="sidebar-top">
          <div className="sidebar-logo">LAWYERSLOG</div>
          <nav className="sidebar-menu">
            <button className="menu-item" type="button" onClick={() => window.location.href = '/cases'}>
              <span className="menu-label">My Cases</span>
            </button>
            <button className="menu-item menu-item-active" type="button">
              <span className="menu-label">Add New Case</span>
            </button>
            <button className="menu-item" type="button">
              <span className="menu-label">Lawyer Matching</span>
            </button>
            <button className="menu-item" type="button">
              <span className="menu-label">Case Tracking</span>
            </button>
            <button className="menu-item" type="button">
              <span className="menu-label">Communication</span>
            </button>
            <button className="menu-item" type="button">
              <span className="menu-label">Settlement</span>
            </button>
            <button className="menu-item" type="button">
              <span className="menu-label">Case Closure</span>
            </button>
          </nav>
        </div>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={logout}>
            <span className="logout-label">Logout</span>
          </button>
          <div className="sidebar-profile">
            <div className="profile-avatar">{initials}</div>
            <div className="profile-details">
              <div className="profile-name">{user.name}</div>
              <div className="profile-link">View profile</div>
            </div>
          </div>
        </div>
      </aside>

      <section className="cases-content" style={{overflowY: 'auto'}}>
        <header className="cases-header">
          <h1>Submitting New Case</h1>
          <div className="profile-mini">{user.name}</div>
        </header>

        <div className="p-8">
          <StepIndicator currentStep={0} />
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <PersonalDetails />
              <IncidentDetails />
              <InsuranceInfo />
              <MedicalInfo />
              <SupportingDocuments onFilesChange={setUploadedFiles} />
              <div className="text-center mt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-red-600 text-white px-6 py-2 rounded"
                >
                  {isSubmitting ? 'Submitting...' : 'Create Case'}
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
