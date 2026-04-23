import React, { useState } from 'react';
import { UploadZone } from './UploadZone';

interface FileState {
  medicalReport: File | null;
  accidentPhotos: File | null;
  insurancePolicy: File | null;
  policeReport: File | null;
  witnessDoc: File | null;
}

interface SupportingDocumentsProps {
  onFilesChange: (files: FileState) => void;
}

export const SupportingDocuments: React.FC<SupportingDocumentsProps> = ({ onFilesChange }) => {
  const [files, setFiles] = useState<FileState>({
    medicalReport: null,
    accidentPhotos: null,
    insurancePolicy: null,
    policeReport: null,
    witnessDoc: null
  });

  const handleFileSelect = (fieldName: keyof FileState, file: File) => {
    const updatedFiles = { ...files, [fieldName]: file };
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  return (
    <div className="bg-white border border-[#D4D4D4] rounded-lg overflow-hidden mb-6">
      {/* Header */}
      <div className="bg-[#EAEBEC] border-b border-[#D4D4D4] px-8 py-3 flex items-center gap-3">
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
        </svg>
        <h3 className="text-[19px] font-medium text-black">Supporting Documents</h3>
      </div>

      {/* Form Content */}
      <div className="p-8">
        <p className="text-[18px] text-black mb-6">
          Upload relevant documents such as medical reports, accident photos, insurance policy, police report, and witness statements.
        </p>

        <div className="grid grid-cols-2 gap-6">
          <UploadZone
            fieldName="medicalReport"
            label="Upload Medical Report"
            onFileSelect={(file) => handleFileSelect('medicalReport', file)}
            selectedFile={files.medicalReport}
          />
          <UploadZone
            fieldName="accidentPhotos"
            label="Upload Accident photos"
            onFileSelect={(file) => handleFileSelect('accidentPhotos', file)}
            selectedFile={files.accidentPhotos}
          />
          <UploadZone
            fieldName="insurancePolicy"
            label="Upload Insurance policy"
            onFileSelect={(file) => handleFileSelect('insurancePolicy', file)}
            selectedFile={files.insurancePolicy}
          />
          <UploadZone
            fieldName="policeReport"
            label="Upload Police reports"
            onFileSelect={(file) => handleFileSelect('policeReport', file)}
            selectedFile={files.policeReport}
          />
          <div className="col-span-2 flex justify-center">
            <div className="w-full max-w-sm">
              <UploadZone
                fieldName="witnessDoc"
                label="Upload Witness Document"
                onFileSelect={(file) => handleFileSelect('witnessDoc', file)}
                selectedFile={files.witnessDoc}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
