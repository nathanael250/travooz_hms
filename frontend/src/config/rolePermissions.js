// Role-based access control configuration
// Define which roles can access which navigation items

export const ROLE_PERMISSIONS = {
  // Regular Users (from users table)
  admin: {
    canAccessAll: true, // Admin can access everything
  },
  vendor: {
    allowedSections: [
      'Dashboard',
      'Hotel Management',
      'Booking Management',
      'Financial Management',
      'Guest Management',
      'Front Desk',
      'Housekeeping',
      'Maintenance',
      'Restaurant & Kitchen',
      'Stock Management',
      'Reports',
      'Settings'
    ]
  },
  client: {
    allowedSections: [
      'Dashboard',
      'Booking Management',
      'Guest Management',
      'Settings'
    ]
  },

  // HMS Users (from hms_users table)
  manager: {
    allowedSections: [
      'Dashboard',
      'Hotel Management',
      'Booking Management',
      'Financial Management',
      'Guest Management',
      'Front Desk',
      'Housekeeping',
      'Maintenance',
      'Restaurant & Kitchen',
      'Stock Management',
      'Reports',
      'Settings'
    ]
  },
  receptionist: {
    allowedSections: [
      'Dashboard',
      'Guest Management',
      'Front Desk'
    ],
    allowedItems: [
      '/hotels/room-availability',
      '/hotels/room-status',
      '/hotels/room-inventory'
    ]
  },
  housekeeping: {
    allowedSections: [
      'Dashboard',
      'Housekeeping'
    ],
    allowedItems: [
      '/hotels/room-status',
      '/hotels/room-inventory'
    ]
  },
  maintenance: {
    allowedSections: [
      'Dashboard',
      'Maintenance'
    ],
    allowedItems: [
      '/hotels/room-status'
    ]
  },
  restaurant: {
    allowedSections: [
      'Dashboard',
      'Restaurant & Kitchen'
    ]
  },
  inventory: {
    allowedSections: [
      'Dashboard',
      'Stock Management'
    ]
  },
  accountant: {
    allowedSections: [
      'Dashboard',
      'Financial Management',
      'Booking Management',
      'Reports'
    ],
    allowedItems: [
      '/bookings/booking-charges'
    ]
  }
};

/**
 * Check if a user role can access a specific section
 */
export const canAccessSection = (userRole, sectionName) => {
  if (!userRole || !ROLE_PERMISSIONS[userRole]) {
    return false;
  }

  const permissions = ROLE_PERMISSIONS[userRole];

  // Admin can access everything
  if (permissions.canAccessAll) {
    return true;
  }

  // Check if section is in allowed sections
  return permissions.allowedSections?.includes(sectionName) || false;
};

/**
 * Check if a user role can access a specific menu item
 */
export const canAccessItem = (userRole, itemHref, sectionName) => {
  if (!userRole || !ROLE_PERMISSIONS[userRole]) {
    return false;
  }

  const permissions = ROLE_PERMISSIONS[userRole];

  // Admin can access everything
  if (permissions.canAccessAll) {
    return true;
  }

  // If the section is allowed, all items in it are allowed
  if (permissions.allowedSections?.includes(sectionName)) {
    return true;
  }

  // Check if specific item is allowed
  return permissions.allowedItems?.includes(itemHref) || false;
};

/**
 * Filter navigation items based on user role
 */
export const filterNavigationByRole = (navigation, userRole) => {
  if (!userRole) {
    return [];
  }

  const permissions = ROLE_PERMISSIONS[userRole];

  // Admin can see everything
  if (permissions?.canAccessAll) {
    return navigation;
  }

  return navigation.filter(item => {
    // Check if user can access this section
    if (!canAccessSection(userRole, item.name)) {
      return false;
    }

    // If item has children, filter them too
    if (item.children) {
      item.children = item.children.filter(child =>
        canAccessItem(userRole, child.href, item.name)
      );
      // Only include parent if it has visible children
      return item.children.length > 0;
    }

    return true;
  });
};
