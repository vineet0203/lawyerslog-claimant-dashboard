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

// ✅ ENV FIX
const API_BASE = import.meta.env.VITE_API_URL || '';

// ✅ TOKEN
const getToken = () =>
  localStorage.getItem('lawyerslog_token') ||
  sessionStorage.getItem('lawyerslog_token');

// ✅ USER
const getLoggedInUser = () => {
  const rawUser =
    localStorage.getItem('lawyerslog_user') ||
    sessionStorage.getItem('lawyerslog_user');

  if (rawUser) {
    try {
      const parsed = JSON.parse(rawUser);
      return {
        name:
          parsed?.name ||
          parsed?.email?.split('@')[0] ||
          'Claimant',
        email: parsed?.email || '',
      };
    } catch {}
  }

  return {
    name:
      localStorage.getItem('lawyerslog_user_name') ||
      sessionStorage.getItem('lawyerslog_user_name') ||
      'Claimant',
    email: '',
  };
};

// ✅ INITIALS
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

  // ✅ SCROLL FIX
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // ✅ SUBMIT (FULL FIXED)
  const onSubmit = async (data: CaseFormValues) => {
    setIsSubmitting(true);

    try {
      const token = getToken();

      if (!token) {
        alert('Login required');
        window.location.href = '/';
        return;
      }

      console.log('API:', API_BASE); // debug

      const response = await fetch(`${API_BASE}/api/cases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      let result = {};
      try {
        result = await response.json();
      } catch {}

      if (response.ok) {
        alert('Case submitted successfully');

        methods.reset();
        setUploadedFiles({
          medicalReport: null,
          accidentPhotos: null,
          insurancePolicy: null,
          policeReport: null,
          witnessDoc: null,
        });

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

  return (
    <div className="p-8 bg-[#F4F5F7] min-h-screen">
      <h1 className="text-2xl font-bold mb-4">
        Submitting New Case
      </h1>

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
  );
};

export default AddNewCase;