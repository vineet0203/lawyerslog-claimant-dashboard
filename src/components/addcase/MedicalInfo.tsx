import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { CaseFormValues } from '../../schemas/caseSchema';

export const MedicalInfo: React.FC = () => {
  const { control, formState: { errors } } = useFormContext<CaseFormValues>();

  const TextAreaField = ({ label, name, placeholder, required = true }: any) => (
    <div>
      <label className="block text-[12.6px] font-medium text-[#6C6A6A] mb-2">
        {label}{required ? '*' : ''}
      </label>
      <Controller
        name={name as any}
        control={control}
        render={({ field }) => (
          <textarea
            {...field}
            placeholder={placeholder}
            rows={6}
            className="w-full px-3 py-3 border border-[#6C6A6A] rounded-[8px] text-[14px] placeholder-[#AFADAD] focus:outline-none focus:border-[#CD0715] transition-colors resize-none"
          />
        )}
      />
      {errors[name as keyof CaseFormValues] && (
        <p className="text-red-500 text-xs mt-1">{(errors[name as keyof CaseFormValues] as any)?.message}</p>
      )}
    </div>
  );

  return (
    <div className="bg-white border border-[#D4D4D4] rounded-lg overflow-hidden mb-6">
      {/* Header */}
      <div className="bg-[#EAEBEC] border-b border-[#D4D4D4] px-8 py-3 flex items-center gap-3">
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 9.5c0 .83-.67 1.5-1.5 1.5S11 13.33 11 12.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5zM19 19H5v-8h14v8z" />
        </svg>
        <h3 className="text-[19px] font-medium text-black">Medical Injury Information</h3>
      </div>

      {/* Form Content */}
      <div className="p-8">
        <TextAreaField
          label="Describe Injury"
          name="injuryDescription"
          placeholder="Describe the Injury sustained"
        />
      </div>
    </div>
  );
};
