import React, { useRef } from 'react';

interface UploadZoneProps {
  fieldName: string;
  label: string;
  onFileSelect: (file: File) => void;
  selectedFile?: File | null;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ fieldName, label, onFileSelect, selectedFile }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size exceeds 10MB limit');
        return;
      }
      onFileSelect(file);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="border-2 border-dashed border-[#D4D4D4] bg-[#F4F5F7] rounded-lg p-8 cursor-pointer hover:bg-[#E8E9EC] transition-colors flex flex-col items-center justify-center"
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
      />
      <svg className="w-8 h-8 text-black mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3v-6" />
      </svg>
      <p className="text-[16px] font-medium text-black text-center">
        {selectedFile ? selectedFile.name : label}
      </p>
    </div>
  );
};
