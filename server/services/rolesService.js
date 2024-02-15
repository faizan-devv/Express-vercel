const { Op } = require('sequelize');
const { BadRequestError } = require('../utils/errorTypes');

class RolesService {
  constructor(models, sequelize) {
    this.models = models;
    this.sequelize = sequelize;
  }
  fetchRoles = async ({ companyId }) => {
    const Roles = await this.models.roles.findAll({
      where: {
        CompanyID: companyId,
        IsDeleted: false,
      },
    });
    return {
      Roles,
      success: true,
    };
  };
  createRole = async ({
    name,
    companyId,
    userId,
    description,
    selectedSubModulesRights,
  }) => {
    const found = await this.models.roles.findOne({
      where: {
        Name: name,
        IsDeleted: false,
      },
    });
    if (found) {
      throw new BadRequestError('Role Name already exists');
    }
    await this.sequelize.transaction(async (t) => {
      const currentDate = Date.now();
      const role = await this.models.roles.create(
        {
          Name: name,
          Description: description,
          CompanyID: companyId,
          CreatedBy: userId,
          CreatedDate: currentDate,
        },
        { transaction: t }
      );
      const sequelizeBulkDate = [];
      for (const item of selectedSubModulesRights) {
        sequelizeBulkDate.push({
          RoleID: parseInt(role.ID),
          SubModuleID: parseInt(item.SubModuleID),
          RightsID: parseInt(item.RightsID),
          CreatedBy: userId,
          CreatedDate: currentDate,
        });
      }
      await this.models.rolesSubModulesRights.bulkCreate(sequelizeBulkDate, {
        transaction: t,
      });
    });
    return {
      success: true,
    };
  };
  fetchPermissionsGrid = async () => {
    const permissionsGrid = await this.models.modules.findAll({
      attributes: ['ID', 'Name'],
      include: [
        {
          attributes: ['ID', 'Name'],
          model: this.models.subModules,
        },
      ],
    });
    return {
      permissionsGrid,
      success: true,
    };
  };
  fetchRoleData = async ({ roleId }) => {
    const RoleData = await this.models.modules.findAll({
      attributes: ['ID', 'Name'],
      include: [
        {
          attributes: ['ID', 'Name'],
          model: this.models.subModules,
          include: [
            {
              required: false,
              attributes: ['ID', 'RightsID', 'RoleID', 'SubModuleID'],
              model: this.models.rolesSubModulesRights,
              include: [
                {
                  attributes: ['ID', 'Name'],
                  model: this.models.rights,
                },
              ],
              where: {
                RoleID: roleId,
              },
            },
          ],
        },
      ],
    });
    return {
      RoleData,
      success: true,
    };
  };
  updateRole = async (body) => {
    const {
      userId,
      roleId,
      selectedSubModulesRights,
      Name,
      Description,
      companyId,
    } = body;
    const found = await this.models.roles.findOne({
      where: {
        Name,
        ID: { [Op.ne]: roleId },
        CompanyID: companyId,
        IsDeleted: false,
      },
    });
    if (found) {
      throw new BadRequestError(
        'Role cannont be changed to a already existing one'
      );
    }
    const updateRolesObject = Object.fromEntries(
      Object.entries(body).filter(
        ([key]) =>
          key !== 'selectedSubModulesRights' &&
          key !== 'userId' &&
          key !== 'companyId' &&
          key !== 'roleId'
      )
    );
    updateRolesObject['Description'] = Description;
    updateRolesObject['ModifiedBy'] = userId;
    updateRolesObject['ModifiedDate'] = Date.now();

    const results = await this.fetchRoleData({ roleId });
    const currentSelectedSubModulesRights = [];
    results.RoleData.forEach((roleDataItem) => {
      roleDataItem.SubModules.forEach((subModuleItem) => {
        subModuleItem.RoleSubModuleRights.forEach((roleSubModuleRight) => {
          currentSelectedSubModulesRights.push({
            RightsID: roleSubModuleRight.RightsID,
            SubModuleID: subModuleItem.ID,
          });
        });
      });
    });
    await this.sequelize.transaction(async (t) => {
      await this.models.roles.update(updateRolesObject, {
        where: { ID: roleId },
        transaction: t,
      });
      const currentDate = Date.now();
      const rightsToDelete = currentSelectedSubModulesRights.filter(
        (dbRight) =>
          !selectedSubModulesRights.some(
            (userRight) =>
              userRight.RightsID === dbRight.RightsID &&
              userRight.SubModuleID === dbRight.SubModuleID
          )
      );
      const rightsToAdd = selectedSubModulesRights.filter(
        (userRight) =>
          !currentSelectedSubModulesRights.some(
            (dbRight) =>
              userRight.RightsID === dbRight.RightsID &&
              userRight.SubModuleID === dbRight.SubModuleID
          )
      );
      for (const rightToDelete of rightsToDelete) {
        await this.models.rolesSubModulesRights.destroy({
          where: {
            RoleID: roleId,
            RightsID: rightToDelete.RightsID,
            SubModuleID: rightToDelete.SubModuleID,
          },
          transaction: t,
        });
      }
      const sequelizeBulkDate = [];
      for (const rightToAdd of rightsToAdd) {
        sequelizeBulkDate.push({
          RoleID: roleId,
          RightsID: rightToAdd.RightsID,
          SubModuleID: rightToAdd.SubModuleID,
          CreatedBy: userId,
          CreatedDate: currentDate,
        });
      }
      await this.models.rolesSubModulesRights.bulkCreate(sequelizeBulkDate, {
        transaction: t,
      });
    });
    return {
      currentSelectedSubModulesRights,
      success: true,
    };
  };
  deleteRole = async ({ roleId, userId }) => {
    await this.models.roles.update(
      {
        IsDeleted: true,
        ModifiedDate: Date.now(),
        ModifiedBy: userId,
      },
      {
        where: {
          ID: parseInt(roleId),
        },
      }
    );
    return {
      success: true,
    };
  };
}

module.exports = RolesService;
