const toJSON = record => {
  if (record && record.toJSON) {
    return record.toJSON();
  }

  if (Array.isArray(record)) {
    return record.map(toJSON);
  }

  return record;
};

module.exports = toJSON;
