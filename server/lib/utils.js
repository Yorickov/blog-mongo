const updateEntity = (instanse, form) => {
  const keys = Object.keys(form);
  return keys.reduce((acc, key) => {
    acc[key] = form[key];
    return acc;
  }, instanse);
};

export default updateEntity;
