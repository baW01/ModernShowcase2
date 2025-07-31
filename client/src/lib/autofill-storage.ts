// Local storage key for autofill data
const AUTOFILL_STORAGE_KEY = 'spotted_gfc_autofill_data';

export interface AutofillData {
  submitterName: string;
  submitterEmail: string;
  contactPhone: string;
  lastUpdated: string;
}

// Save autofill data to localStorage
export function saveAutofillData(data: Partial<AutofillData>): void {
  try {
    const existingData = getAutofillData();
    const updatedData: AutofillData = {
      ...existingData,
      ...data,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem(AUTOFILL_STORAGE_KEY, JSON.stringify(updatedData));
  } catch (error) {
    console.warn('Failed to save autofill data:', error);
  }
}

// Get autofill data from localStorage
export function getAutofillData(): AutofillData {
  try {
    const stored = localStorage.getItem(AUTOFILL_STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored) as AutofillData;
      return data;
    }
  } catch (error) {
    console.warn('Failed to load autofill data:', error);
  }
  
  return {
    submitterName: '',
    submitterEmail: '',
    contactPhone: '',
    lastUpdated: ''
  };
}

// Clear autofill data from localStorage
export function clearAutofillData(): void {
  try {
    localStorage.removeItem(AUTOFILL_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear autofill data:', error);
  }
}

// Check if autofill data exists
export function hasAutofillData(): boolean {
  try {
    const data = getAutofillData();
    return !!(data.submitterName || data.submitterEmail || data.contactPhone);
  } catch {
    return false;
  }
}