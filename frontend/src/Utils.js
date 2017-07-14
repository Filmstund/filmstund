

export const trim = (v) => {
  if(Array.isArray(v)) {
    return v.map(item => item.trim())
  } else {
    return v.trim()
  }
};

export const capitalize = s => s[0].toUpperCase() + s.substring(1);
