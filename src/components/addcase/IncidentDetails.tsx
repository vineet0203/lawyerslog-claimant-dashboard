import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { CaseFormValues } from '../../schemas/caseSchema';

export const IncidentDetails: React.FC = () => {
  const { control, formState: { errors } } = useFormContext<CaseFormValues>();

  const SelectField = ({ label, name, options, placeholder, required = true }: any) => (
    <div>
      <label className="block text-[12.6px] font-medium text-[#6C6A6A] mb-2">
        {label}{required ? '*' : ''}
      </label>
      <Controller
        name={name as any}
        control={control}
        render={({ field }) => (
          <select
            {...field}
            className="w-full px-3 py-3 border border-[#6C6A6A] rounded-[8px] text-[14px] text-[#AFADAD] focus:outline-none focus:border-[#CD0715] transition-colors bg-white appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.5rem center',
              backgroundSize: '1.5em 1.5em',
              paddingRight: '2.5rem'
            }}
          >
            <option value="">{placeholder}</option>
            {options?.map((opt: string) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        )}
      />
      {errors[name as keyof CaseFormValues] && (
        <p className="text-red-500 text-xs mt-1">{(errors[name as keyof CaseFormValues] as any)?.message}</p>
      )}
    </div>
  );

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
            rows={4}
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
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
        </svg>
        <h3 className="text-[19px] font-medium text-black">Incident Details</h3>
      </div>

      {/* Form Content */}
      <div className="p-8">
        <div className="grid grid-cols-2 gap-6 mb-6">
          <SelectField
            label="Incident Type"
            name="incidentType"
            options={['Car Accident', 'Slip & Fall', 'Medical Malpractice', 'Workplace Injury', 'Other']}
            placeholder="Select"
          />
          <TextField
            label="Incident Date"
            name="incidentDate"
            type="date"
            placeholder="Select"
          />
          <TextField
            label="Incident Location"
            name="incidentLocation"
            placeholder="Incident Address"
          />
          <SelectField
            label="Police Report Available"
            name="policeReportAvail"
            options={['yes', 'no']}
            placeholder="Yes"
          />
        </div>
        <TextAreaField
          label="Description"
          name="incidentDescription"
          placeholder="Describe the Injury sustained"
        />
      </div>
    </div>
  );
};
