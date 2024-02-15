/**
 * @function isNonEmptyObject
 * @description Determines whether the input is a non-empty Object
 * @param {*} val
 * @returns {boolean}
 */
function isNonEmptyObject(val) {
  if (!val) return false;

  if (typeof val !== 'object') {
    return false;
  }

  if (!Object.keys(val).length) {
    return false;
  }

  return true;
}

function capitalize(text) {
  const lower = text || '';
  return lower.charAt(0).toUpperCase() + lower.substring(1);
}
/**
 * @function isNullOrUndefined
 * @description Determines whether the input is null or undefined.
 *   Helpful when guarding against null or undefined, but not other falsey values
 *   such as '' or 0.
 * @param {*} val
 * @returns {boolean}
 */
function isNullOrUndefined(val) {
  if (val === null) return true;

  if (val === undefined) return true;

  return false;
}

function tryWithDefault(func, defaultValue) {
  try {
    return func();
  } catch (_) {
    return defaultValue;
  }
}

module.exports = {
  tryWithDefault,
  isNonEmptyObject,
  isNullOrUndefined,
  capitalize,
};
