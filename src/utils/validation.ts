export const validateEmail = (email: string) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    );
};

export const validatePassword = (password: string) => {
  return password.length >= 6;
};

export const validatePhone = (phone: string) => {
  return String(phone).match(/^\(?(\d{3})\)?[-\. ]?(\d{3})[-\. ]?(\d{4})( x\d{4})?$/);
};

export const validateName = (name: string) => {
  return String(name).match(/^(?![\s.]+$)[a-zA-Z\s.]{2,50}$/);
};

export const isNull = (value: any) => {
  return value === "" || value === undefined || value === null;
};

export const compareString = (value1: string, value2: string): boolean => {
  // Both not null
  if (value1 && value2) {
    // Compare string directly
    return value1 === value2;
  } else {
    // 2 both match only when both null
    return isNull(value1) && isNull(value2);
  }
};

export const compareBoolean = (value1: boolean, value2: boolean): boolean => {
  // If both value is not null, do compare value directly
  if (!isNull(value1) && !isNull(value2)) {
    return value1 === value2;
  } else {
    return false;
  }
};
