/**
 * Helper functions for working with user data
 * Handles both new field structure (firstName, lastName) and old structure (name) for backward compatibility
 */

/**
 * Get the full name of a user
 * @param {Object} user - User object
 * @returns {string} Full name or fallback
 */
export const getFullName = (user) => {
  if (!user) return 'Unknown User';
  
  // Trim whitespace from name fields (handle null/undefined/empty strings)
  const firstName = (user.firstName && typeof user.firstName === 'string') ? user.firstName.trim() : '';
  const lastName = (user.lastName && typeof user.lastName === 'string') ? user.lastName.trim() : '';
  // Check for name field - might be a virtual field that's empty string if firstName/lastName are undefined
  const name = (user.name && typeof user.name === 'string' && user.name.trim() !== '') ? user.name.trim() : '';
  
  // New structure: firstName and lastName (both must be non-empty)
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }
  
  // If only firstName exists
  if (firstName) {
    return firstName;
  }
  
  // If only lastName exists
  if (lastName) {
    return lastName;
  }
  
  // Fallback: use name field (for backward compatibility or migrated data)
  // Only use it if it's not an empty string (which happens when virtual field computes from undefined firstName/lastName)
  if (name) {
    return name;
  }
  
  // Last resort: use email if available
  if (user.email && typeof user.email === 'string' && user.email.trim() !== '') {
    return user.email.split('@')[0]; // Return part before @
  }
  
  return 'Unknown User';
};

/**
 * Get the first name of a user
 * @param {Object} user - User object
 * @returns {string} First name or fallback
 */
export const getFirstName = (user) => {
  if (!user) return '';
  
  // New structure: firstName
  if (user.firstName) {
    return user.firstName;
  }
  
  // Fallback: extract first word from name field
  if (user.name) {
    return user.name.split(' ')[0] || '';
  }
  
  return '';
};

/**
 * Format address fields into a display string
 * @param {Object} user - User object
 * @returns {string} Formatted address or fallback
 */
export const formatAddress = (user) => {
  if (!user) return '';
  
  // New structure: address fields
  const parts = [];
  if (user.addressLine1) parts.push(user.addressLine1);
  if (user.addressLine2) parts.push(user.addressLine2);
  if (user.city) parts.push(user.city);
  if (user.state) parts.push(user.state);
  if (user.zip) parts.push(user.zip);
  
  if (parts.length > 0) {
    return parts.join(', ');
  }
  
  // Fallback: use old address field
  if (user.address) {
    return user.address;
  }
  
  return '';
};

/**
 * Get initials from a user's name
 * @param {Object} user - User object
 * @returns {string} Initials (e.g., "JD" for John Doe)
 */
export const getInitials = (user) => {
  if (!user) return 'U';
  
  // New structure: firstName and lastName
  if (user.firstName && user.lastName) {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }
  
  // Fallback: use name field
  if (user.name) {
    const parts = user.name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
    }
    return parts[0].charAt(0).toUpperCase();
  }
  
  // Last resort: use firstName only
  if (user.firstName) {
    return user.firstName.charAt(0).toUpperCase();
  }
  
  return 'U';
};
