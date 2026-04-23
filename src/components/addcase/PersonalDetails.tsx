import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { CaseFormValues } from '../../schemas/caseSchema';

export const PersonalDetails: React.FC = () => {
  const { control, formState: { errors } } = useFormContext<CaseFormValues>();

  const Field = ({ label, name, type = 'text', placeholder, required = true }: any) => (
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
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4m0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
        <h3 className="text-[19px] font-medium text-black">Personal Details</h3>
      </div>

      {/* Form Content */}
      <div className="p-8">
        <div className="grid grid-cols-2 gap-6">
          <Field label="Full Name" name="fullName" placeholder="Enter your full name" />
          <Field label="Email Address" name="email" type="email" placeholder="Enter your Email" />
          <Field label="Phone Number" name="phoneNumber" type="tel" placeholder="Enter your Phone" />
          <Field label="Address" name="address" placeholder="Street Address" />
          <Field label="City" name="city" placeholder="Enter City" />
          <Field label="State" name="state" placeholder="Enter State" />
        </div>
      </div>
    </div>
  );
};
