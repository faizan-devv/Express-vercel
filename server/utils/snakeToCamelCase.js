const toCamel = (str) => {
  return str.replace(/([-_][a-z])/gi, (underscoreChar) => {
    return underscoreChar.toUpperCase().replace('-', '').replace('_', '');
  });
};

const isObject = (obj) => {
  return (
    obj === Object(obj) && !Array.isArray(obj) && typeof obj !== 'function'
  );
};

/**
 * @function snakeToCamelCase
 * @param {object | array} obj - Object or array need to be converted from snake into camel case.
 * @returns {object | array} - Object or array converted into camel case.
 * @description
 * Coverts an object or array of snake case into camel case.
 */
const snakeToCamelCase = (obj) => {
  if (isObject(obj)) {
    const transformedObj = {};

    Object.keys(obj).forEach((k) => {
      transformedObj[toCamel(k)] = snakeToCamelCase(obj[k]);
    });

    return transformedObj;
  } else if (Array.isArray(obj)) {
    return obj.map((i) => {
      return snakeToCamelCase(i);
    });
  }

  return obj;
};

module.exports = {
  snakeToCamelCase,
};
