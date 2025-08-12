// SMS Service abstraction layer for multiple providers

export interface SMSProvider {
  sendSMS(phoneNumber: string, message: string): Promise<boolean>
}

class TextBeltProvider implements SMSProvider {
  async sendSMS(phoneNumber: string, message: string): Promise<boolean> {
    try {
      // Format phone number - ensure it has country code and remove any formatting
      let formattedPhoneNumber = phoneNumber.replace(/[^\d+]/g, '')
      
      // If no country code, assume US (+1)
      if (!formattedPhoneNumber.startsWith('+')) {
        formattedPhoneNumber = '+1' + formattedPhoneNumber
      }
      
      console.log(`Attempting to send SMS to: ${formattedPhoneNumber}`)
      
      const response = await fetch('https://textbelt.com/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          phone: formattedPhoneNumber,
          message,
          key: process.env.TEXTBELT_API_KEY || 'textbelt',
        }),
      })

      const result = await response.json()
      console.log('TextBelt response:', result)
      
      if (result.success) {
        console.log('SMS sent successfully via TextBelt')
        return true
      } else {
        console.error('TextBelt API error:', result.error || 'Unknown error')
        return false
      }
    } catch (error) {
      console.error('TextBelt error:', error)
      return false
    }
  }
}

class VonageProvider implements SMSProvider {
  async sendSMS(phoneNumber: string, message: string): Promise<boolean> {
    try {
      const formattedPhoneNumber = phoneNumber.replace(/[^\d+]/g, '')
      
      const response = await fetch('https://rest.nexmo.com/sms/json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          api_key: process.env.VONAGE_API_KEY || '',
          api_secret: process.env.VONAGE_API_SECRET || '',
          from: process.env.VONAGE_FROM_NUMBER || 'OCRApp',
          to: formattedPhoneNumber,
          text: message,
        }),
      })

      const result = await response.json()
      return result.messages?.[0]?.status === '0'
    } catch (error) {
      console.error('Vonage error:', error)
      return false
    }
  }
}

class ConsoleProvider implements SMSProvider {
  async sendSMS(phoneNumber: string, message: string): Promise<boolean> {
    console.log(`[SMS CONSOLE LOG] To: ${phoneNumber}, Message: ${message}`)
    return true // Always returns true for development
  }
}

// Factory function to get the appropriate SMS provider
export function getSMSProvider(): SMSProvider {
  const provider = process.env.SMS_PROVIDER?.toLowerCase() || 'console'
  
  switch (provider) {
    case 'textbelt':
      return new TextBeltProvider()
    case 'vonage':
      return new VonageProvider()
    case 'console':
    default:
      return new ConsoleProvider()
  }
}

// Convenience function to send SMS
export async function sendSMS(phoneNumber: string, message: string): Promise<boolean> {
  const provider = getSMSProvider()
  return await provider.sendSMS(phoneNumber, message)
}