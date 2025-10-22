import React from 'react';
import { Phone } from 'lucide-react';

const countries = [
  { code: '+250', name: 'Rwanda', flag: '🇷🇼' },
  { code: '+254', name: 'Kenya', flag: '🇰🇪' },
  { code: '+255', name: 'Tanzania', flag: '🇹🇿' },
  { code: '+256', name: 'Uganda', flag: '🇺🇬' },
  { code: '+257', name: 'Burundi', flag: '🇧🇮' },
  { code: '+243', name: 'DR Congo', flag: '🇨🇩' },
  { code: '+1', name: 'USA', flag: '🇺🇸' },
  { code: '+44', name: 'UK', flag: '🇬🇧' },
  { code: '+33', name: 'France', flag: '🇫🇷' },
  { code: '+49', name: 'Germany', flag: '🇩🇪' },
  { code: '+91', name: 'India', flag: '🇮🇳' },
  { code: '+86', name: 'China', flag: '🇨🇳' },
];

export const PhoneInput = ({ 
  value = '', 
  onChange, 
  placeholder = "123 456 789",
  label = "Phone Number",
  required = false,
  className = ""
}) => {
  // Parse existing value to extract country code and number
  const parsePhoneValue = (phoneValue) => {
    if (!phoneValue) return { countryCode: '+250', number: '' };
    
    // Find matching country code
    const matchedCountry = countries.find(country => 
      phoneValue.startsWith(country.code)
    );
    
    if (matchedCountry) {
      return {
        countryCode: matchedCountry.code,
        number: phoneValue.substring(matchedCountry.code.length).trim()
      };
    }
    
    // Default to Rwanda if no match
    return { countryCode: '+250', number: phoneValue };
  };

  const { countryCode, number } = parsePhoneValue(value);

  const handleCountryChange = (newCountryCode) => {
    const fullNumber = number ? `${newCountryCode} ${number}` : newCountryCode;
    onChange(fullNumber);
  };

  const handleNumberChange = (newNumber) => {
    // Remove any non-digit characters except spaces and dashes
    const cleanNumber = newNumber.replace(/[^\d\s-]/g, '');
    const fullNumber = cleanNumber ? `${countryCode} ${cleanNumber}` : countryCode;
    onChange(fullNumber);
  };

  const selectedCountry = countries.find(c => c.code === countryCode) || countries[0];

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <Phone className="inline h-4 w-4 mr-1" />
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex">
        {/* Country Code Selector */}
        <div className="relative">
          <select
            value={countryCode}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="appearance-none bg-white border border-gray-300 rounded-l-lg px-3 py-2 pr-8 focus:ring-2 focus:ring-primary-500 focus:border-transparent min-w-[120px]"
          >
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.flag} {country.code}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Phone Number Input */}
        <input
          type="tel"
          value={number}
          onChange={(e) => handleNumberChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 border border-l-0 border-gray-300 rounded-r-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          required={required}
        />
      </div>
      
      {/* Display full number preview */}
      {(countryCode && number) && (
        <p className="text-xs text-gray-500 mt-1">
          Full number: {countryCode} {number}
        </p>
      )}
    </div>
  );
};