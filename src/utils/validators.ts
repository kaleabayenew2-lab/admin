export function validateEmail(email?: string) {
  if (!email) return 'Email is required';
  // simple regex
  const re = /\S+@\S+\.\S+/;
  if (!re.test(email)) return 'Invalid email address';
  return null;
}

export function validateRequired(val?: string, label = 'This field') {
  if (!val || !String(val).trim()) return `${label} is required`;
  return null;
}

export function validatePhone(phone?: string) {
  if (!phone) return 'Phone is required';
  const digits = (phone.match(/\d/g) || []).length;
  if (digits < 6 || digits > 20) return 'Phone number looks invalid';
  return null;
}

export function validatePassword(p?: string) {
  if (!p) return 'Password is required';
  if (p.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(p)) return 'Password must include an uppercase letter';
  if (!/[a-z]/.test(p)) return 'Password must include a lowercase letter';
  if (!/[0-9]/.test(p)) return 'Password must include a number';
  if (!/[!@#$%^&*]/.test(p)) return 'Password must include a special character';
  return null;
}

export function validateProfile(profile: any) {
  const errors: Record<string, string> = {};
  const nameErr = validateRequired(profile?.name, 'Name');
  if (nameErr) errors.name = nameErr;
  const emailErr = validateEmail(profile?.email);
  if (emailErr) errors.email = emailErr;
  const phoneErr = validatePhone(profile?.phone);
  if (phoneErr) errors.phone = phoneErr;
  return errors;
}

export function validateUserInput(user: any) {
  const errors: Record<string, string> = {};
  const nameErr = validateRequired(user?.fullName, 'Full name');
  if (nameErr) errors.fullName = nameErr;
  const emailErr = validateEmail(user?.email);
  if (emailErr) errors.email = emailErr;
  if (user?.phone) {
    const phoneErr = validatePhone(user?.phone);
    if (phoneErr) errors.phone = phoneErr;
  }
  return errors;
}

export function validateLatitude(lat?: number | string) {
  const n = Number(lat);
  if (!isFinite(n)) return 'Invalid latitude';
  if (n < -90 || n > 90) return 'Latitude must be between -90 and 90';
  return null;
}

export function validateLongitude(lng?: number | string) {
  const n = Number(lng);
  if (!isFinite(n)) return 'Invalid longitude';
  if (n < -180 || n > 180) return 'Longitude must be between -180 and 180';
  return null;
}
