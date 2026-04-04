// =============================================
// LEAD FIELD DEFINITIONS & VALIDATORS
// =============================================

export interface LeadFieldDef {
  key: string;
  label: string;
  icon: string;
  placeholder: string;
  validate: (value: string) => boolean;
  errorMessage: string;
}

// Country-code-aware phone length map (most common)
const PHONE_LENGTHS: Record<string, number[]> = {
  '+1':  [10],       // US/Canada
  '+44': [10, 11],   // UK
  '+91': [10],       // India
  '+61': [9],        // Australia
  '+81': [10, 11],   // Japan
  '+49': [10, 11],   // Germany
  '+33': [9],        // France
  '+86': [11],       // China
  '+55': [10, 11],   // Brazil
  '+7':  [10],       // Russia
  '+971': [9],       // UAE
  '+966': [9],       // Saudi Arabia
  '+234': [10],      // Nigeria
  '+27': [9],        // South Africa
  '+82': [9, 10],    // South Korea
  '+62': [10, 12],   // Indonesia
  '+52': [10],       // Mexico
  '+39': [10],       // Italy
};

function validatePhone(value: string): boolean {
  const cleaned = value.replace(/[\s\-().]/g, '');
  
  // Must start with + or be pure digits
  if (!/^\+?\d{7,15}$/.test(cleaned)) return false;

  // If starts with country code, verify digit count
  if (cleaned.startsWith('+')) {
    for (const [code, lengths] of Object.entries(PHONE_LENGTHS)) {
      if (cleaned.startsWith(code)) {
        const digits = cleaned.slice(code.length);
        return lengths.includes(digits.length);
      }
    }
    // Unknown country code — accept if reasonable length (7-13 digits after +)
    const digits = cleaned.replace(/^\+\d{1,3}/, '');
    return digits.length >= 6 && digits.length <= 13;
  }

  // No country code — accept 7-12 digit numbers
  return cleaned.length >= 7 && cleaned.length <= 12;
}

function validateEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

function validateName(value: string): boolean {
  const trimmed = value.trim();
  // At least 2 characters, no pure numbers, no special chars only
  return trimmed.length >= 2 && /[a-zA-Z\u00C0-\u024F\u0900-\u097F\u0600-\u06FF]/.test(trimmed);
}

function validateCompany(value: string): boolean {
  return value.trim().length >= 2;
}

function validateWebsite(value: string): boolean {
  return /^(https?:\/\/)?[\w.-]+\.\w{2,}(\/\S*)?$/.test(value.trim());
}

// Master registry of all lead capture fields
export const LEAD_FIELDS: LeadFieldDef[] = [
  {
    key: 'email',
    label: 'Email Address',
    icon: '📧',
    placeholder: 'e.g. john@example.com',
    validate: validateEmail,
    errorMessage: "That doesn't look like a valid email. Please try again with a real email address.",
  },
  {
    key: 'phone',
    label: 'Phone Number',
    icon: '📱',
    placeholder: 'e.g. +1 555 123 4567',
    validate: validatePhone,
    errorMessage: "That phone number doesn't look right. Please include your country code (e.g. +91, +1).",
  },
  {
    key: 'name',
    label: 'Full Name',
    icon: '👤',
    placeholder: 'e.g. John Doe',
    validate: validateName,
    errorMessage: "Please enter your real name (at least 2 characters).",
  },
  {
    key: 'company',
    label: 'Company Name',
    icon: '🏢',
    placeholder: 'e.g. Acme Corp',
    validate: validateCompany,
    errorMessage: "Please enter a valid company name.",
  },
  {
    key: 'website',
    label: 'Website URL',
    icon: '🌐',
    placeholder: 'e.g. https://mysite.com',
    validate: validateWebsite,
    errorMessage: "That doesn't look like a valid URL. Please try again.",
  },
];

/**
 * Validate a lead field value against its type.
 * Returns { valid: true } or { valid: false, message: string }
 */
export function validateLeadField(
  fieldKey: string,
  value: string
): { valid: boolean; message?: string } {
  const field = LEAD_FIELDS.find(f => f.key === fieldKey);
  if (!field) return { valid: true }; // Unknown field, accept

  if (field.validate(value)) {
    return { valid: true };
  }
  return { valid: false, message: field.errorMessage };
}

/**
 * Get the DM prompt message for a specific lead field.
 */
export function getLeadPromptMessage(fieldKey: string, customMessage?: string): string {
  const field = LEAD_FIELDS.find(f => f.key === fieldKey);
  if (customMessage) return customMessage;
  
  const prompts: Record<string, string> = {
    email: "📧 Please reply with your email address to receive the link:",
    phone: "📱 Please reply with your phone number (include country code) to receive the link:",
    name: "👤 Please reply with your full name to continue:",
    company: "🏢 Please reply with your company name:",
    website: "🌐 Please share your website URL:",
  };

  return prompts[fieldKey] || `Please provide your ${field?.label || fieldKey}:`;
}
