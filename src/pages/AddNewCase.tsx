import React, { useState, useEffect, useRef } from 'react';
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

const API_BASE =
  (import.meta as ImportMeta & { env?: { VITE_API_URL?: string } }).env
    ?.VITE_API_URL || '';

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
  const [isLoadingCase, setIsLoadingCase] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [editingCaseId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
  });
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
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
      address: '',
      city: '',
      state: '',
      incidentType: undefined,
      incidentDate: '',
      incidentLocation: '',
      policeReportAvail: undefined,
      incidentDescription: '',
      insuranceCompany: '',
      policyNumber: '',
      injuryDescription: '',
    },
  });

  const { handleSubmit, getFieldState, watch } = methods;
  const hasLoadedEditCaseRef = useRef(false);
  const user = getLoggedInUser();
  const initials = getInitials(user.name);

  useEffect(() => {
    if (!editingCaseId || hasLoadedEditCaseRef.current) return;
    hasLoadedEditCaseRef.current = true;

    const token = getToken();
    if (!token) return;

    const loadCaseDetails = async () => {
      setIsLoadingCase(true);
      try {
        const response = await fetch(`${API_BASE}/api/cases/${editingCaseId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();
        if (!response.ok || !result?.case) {
          alert(result?.message || 'Unable to load case details');
          return;
        }

        const caseData = result.case;
        methods.reset({
          fullName: caseData.fullName || '',
          email: caseData.email || '',
          phoneNumber: caseData.phoneNumber || '',
          address: caseData.address || '',
          city: caseData.city || '',
          state: caseData.state || '',
          incidentType: caseData.incidentType,
          incidentDate: caseData.incidentDate ? new Date(caseData.incidentDate).toISOString().slice(0, 10) : '',
          incidentLocation: caseData.incidentLocation || '',
          policeReportAvail: caseData.policeReportAvail,
          incidentDescription: caseData.incidentDescription || '',
          insuranceCompany: caseData.insuranceCompany || '',
          policyNumber: caseData.policyNumber || '',
          injuryDescription: caseData.injuryDescription || '',
        });
      } catch (error) {
        console.error(error);
        alert('Unable to load case details');
      } finally {
        setIsLoadingCase(false);
      }
    };

    loadCaseDetails();
  }, [editingCaseId, methods]);

  useEffect(() => {
    const hasValue = (value: unknown) =>
      typeof value === 'string' ? value.trim().length > 0 : Boolean(value);

    const updateStepFromValues = (values: Partial<CaseFormValues>) => {
      const personalValid =
        hasValue(values.fullName) &&
        hasValue(values.email) &&
        hasValue(values.phoneNumber) &&
        hasValue(values.address) &&
        hasValue(values.city) &&
        hasValue(values.state) &&
        !getFieldState('fullName').invalid &&
        !getFieldState('email').invalid &&
        !getFieldState('phoneNumber').invalid &&
        !getFieldState('city').invalid &&
        !getFieldState('state').invalid;

      const incidentValid =
        hasValue(values.incidentType) &&
        hasValue(values.incidentDate) &&
        hasValue(values.incidentLocation) &&
        hasValue(values.incidentDescription) &&
        !getFieldState('incidentType').invalid &&
        !getFieldState('incidentDate').invalid &&
        !getFieldState('incidentLocation').invalid;

      const insuranceValid =
        hasValue(values.insuranceCompany) &&
        hasValue(values.policyNumber) &&
        !getFieldState('insuranceCompany').invalid &&
        !getFieldState('policyNumber').invalid;

      const medicalValid =
        hasValue(values.injuryDescription) &&
        !getFieldState('injuryDescription').invalid;

      const policeValid =
        hasValue(values.policeReportAvail) &&
        !getFieldState('policeReportAvail').invalid;

      const documentsValid = Object.values(uploadedFiles).some(Boolean);

      const completedSteps = [personalValid, incidentValid, insuranceValid, medicalValid, policeValid, documentsValid];
      const firstIncomplete = completedSteps.findIndex((done) => !done);
      const nextStep = firstIncomplete === -1 ? 5 : firstIncomplete;

      setCurrentStep((prev) => (prev === nextStep ? prev : nextStep));
    };

    updateStepFromValues(methods.getValues() as Partial<CaseFormValues>);

    const subscription = watch((values) => {
      updateStepFromValues(values as Partial<CaseFormValues>);
    });

    return () => subscription.unsubscribe();
  }, [watch, getFieldState, methods, uploadedFiles]);

  const onSubmit = async (data: CaseFormValues) => {
    setIsSubmitting(true);
    try {
      const token = getToken();
      if (!token) {
        alert('Login required');
        window.location.href = '/';
        return;
      }
      const isEditMode = Boolean(editingCaseId);
      const response = await fetch(
        isEditMode ? `${API_BASE}/api/cases/${editingCaseId}` : `${API_BASE}/api/cases`,
        {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }
      );
      let result = {};
      try { result = await response.json(); } catch {}
      if (response.ok) {
        alert(editingCaseId ? 'Case updated successfully' : 'Case submitted successfully');
        methods.reset();
        setCurrentStep(0);
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
          <StepIndicator currentStep={currentStep} />
          <FormProvider {...methods}>
            {isLoadingCase ? <p className="mb-4">Loading case details...</p> : null}
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
