import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  const steps = [
    'Personal Details',
    'Incident Details',
    'Insurance Info',
    'Injuries',
    'Police',
    'Upload Documents'
  ];

  return (
    <div className="flex items-center justify-between mb-8 px-4 py-6 bg-white rounded-lg border border-[#D4D4D4]">
      <div className="flex items-center w-full gap-4">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2 transition-colors ${
                  index < currentStep
                    ? 'bg-[#CD0715] border-[#CD0715] text-white'
                    : index === currentStep
                    ? 'bg-[#CD0715] border-[#CD0715] text-white'
                    : 'bg-[#F4F5F7] border-[#E4E5E9] text-[#A5A5A5]'
                }`}
              >
                {index < currentStep ? '✓' : index + 1}
              </div>
              <span
                className={`text-xs font-medium mt-2 text-center w-20 ${
                  index <= currentStep ? 'text-[#000000]' : 'text-[#797373]'
                }`}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-1 mx-2 mt-6 ${index < currentStep ? 'bg-[#CD0715]' : 'bg-[#D4D4D4]'}`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
