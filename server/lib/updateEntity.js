const updateEntity = (instanse, form, ...props) => {
  const keys = props.length > 0 ? props : Object.keys(form);
  return keys.reduce((acc, key) => {
    if (acc[key]) {
      acc[key] = form[key];
    }
    return acc;
  }, instanse);
};

export default updateEntity;
