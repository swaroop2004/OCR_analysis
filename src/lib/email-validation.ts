// Email validation utilities with domain validation

import { promises as dnsPromises } from 'dns'

// Basic email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

// Common disposable email patterns (smaller list for obvious cases)
const DISPOSABLE_PATTERNS = [
  'tempmail', 'throwaway', 'disposable', 'temporary', '10minute', 
  'guerrilla', 'mailinator', 'yopmail', 'spam', 'fake'
]

/**
 * Validate email format and check for + character
 */
export function validateEmailFormat(email: string): { isValid: boolean; error?: string } {
  if (!email) {
    return { isValid: false, error: 'Email is required' }
  }

  // Check for + character in email
  if (email.includes('+')) {
    return { isValid: false, error: 'Email addresses containing "+" are not allowed' }
  }

  // Check basic email format
  if (!EMAIL_REGEX.test(email)) {
    return { isValid: false, error: 'Invalid email format' }
  }

  return { isValid: true }
}

/**
 * Check if domain has MX records (valid email domain)
 */
export async function validateEmailDomain(email: string): Promise<{ isValid: boolean; error?: string }> {
  try {
    const domain = email.split('@')[1]
    
    // Check for obvious disposable patterns in domain
    const domainLower = domain.toLowerCase()
    for (const pattern of DISPOSABLE_PATTERNS) {
      if (domainLower.includes(pattern)) {
        return { 
          isValid: false, 
          error: 'Disposable email services are not allowed' 
        }
      }
    }

    // Check MX records
    try {
      const mxRecords = await dnsPromises.resolveMx(domain)
      
      if (mxRecords.length === 0) {
        return { 
          isValid: false, 
          error: 'Email domain does not have valid mail servers' 
        }
      }

      // Additional check: verify the domain resolves to an IP
      try {
        await dnsPromises.resolve4(domain)
      } catch {
        try {
          await dnsPromises.resolve6(domain)
        } catch {
          return { 
            isValid: false, 
            error: 'Email domain does not resolve to a valid IP address' 
          }
        }
      }

      return { isValid: true }
    } catch (dnsError) {
      return { 
        isValid: false, 
        error: 'Email domain does not exist or has no mail servers' 
      }
    }
  } catch (error) {
    return { 
      isValid: false, 
      error: 'Failed to validate email domain' 
    }
  }
}

/**
 * Complete email validation (format + domain)
 */
export async function validateEmail(email: string): Promise<{ isValid: boolean; error?: string }> {
  // First validate format
  const formatValidation = validateEmailFormat(email)
  if (!formatValidation.isValid) {
    return formatValidation
  }

  // Then validate domain
  return await validateEmailDomain(email)
}