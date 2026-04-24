import { z } from 'zod';

export const CaseSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().min(10, 'Valid phone number required'),
  address: z.string(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  incidentType: z.enum(['Car Accident', 'Slip & Fall', 'Medical Malpractice', 'Workplace Injury', 'Other'], {
    errorMap: () => ({ message: 'Please select an incident type' })
  }),
  incidentDate: z.string().refine(d => !isNaN(Date.parse(d)), 'Invalid date'),
  incidentLocation: z.string().min(2, 'Incident location required'),
  policeReportAvail: z.enum(['yes', 'no'], {
    errorMap: () => ({ message: 'Please specify if police report is available' })
  }),
  incidentDescription: z.string(),
  insuranceCompany: z.string().min(2, 'Insurance company required'),
  policyNumber: z.string().min(3, 'Policy number required'),
  injuryDescription: z.string(),
});

export type CaseFormValues = z.infer<typeof CaseSchema>;
