const { ForbiddenError } = require('../utils/errorTypes');

const getPermissionsByRightName = (
  cachedPermissions,
  moduleName,
  subModuleName,
  permission
) => {
  let submodules = cachedPermissions.find(
    (right) => right.name === moduleName
  )?.subModules;

  try {
    let subModuleData = submodules?.find(
      (submodule) => submodule.name === subModuleName
    );
    return subModuleData.permissions[permission];
  } catch (err) {
    throw new ForbiddenError('User is not permitted to access the resource.');
  }
};

module.exports = getPermissionsByRightName;
