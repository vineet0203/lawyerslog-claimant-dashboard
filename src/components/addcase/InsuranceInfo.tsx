import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { CaseFormValues } from '../../schemas/caseSchema';

export const InsuranceInfo: React.FC = () => {
  const { control, formState: { errors } } = useFormContext<CaseFormValues>();

  const TextField = ({ label, name, type = 'text', placeholder, required = true }: any) => (
    <div>
      <label className="block text-[12.6px] font-medium text-[#6C6A6A] mb-2">
        {label}{required ? '*' : ''}
      </label>
      <Controller
        name={name as any}
        control={control}
        render={({ field }) => (
          <input
            {...field}
            type={type}
            placeholder={placeholder}
            className="w-full px-3 py-3 border border-[#6C6A6A] rounded-[8px] text-[14px] placeholder-[#AFADAD] focus:outline-none focus:border-[#CD0715] transition-colors"
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
          <path d="M12 2c5.5 0 10 3.6 10 8 0 3.1-2.2 5.8-5.5 7.2.3-1 .5-2.1.5-3.2 0-4.4-4-8-9-8S3 10.6 3 15s4 8 9 8c1.7 0 3.3-.4 4.7-1.1.5 1.1 1.3 2.1 2.3 3" />
        </svg>
        <h3 className="text-[19px] font-medium text-black">Insurance Information</h3>
      </div>

      {/* Form Content */}
      <div className="p-8">
        <div className="grid grid-cols-2 gap-6">
          <TextField
            label="Insurance Company"
            name="insuranceCompany"
            placeholder="Name of insurance provider"
          />
          <TextField
            label="Policy Number"
            name="policyNumber"
            placeholder="Select"
          />
        </div>
      </div>
    </div>
  );
};
