let permissions = {};

const cache = {
  getPermissions: () => {
    return { ...permissions };
  },

  addPermissions: (val) => {
    permissions = {
      ...permissions,
      ...val,
    };
  },

  updatePermissions: (key, val) => {
    permissions = {
      ...permissions,
      [key]: val,
    };
  },

  deletePermissions: (key) => {
    const { [key]: deletedKey, ...rest } = permissions;
    permissions = rest;
  },

  print: () => {
    console.log('permissions cache', permissions);
  },
};

module.exports = cache;
