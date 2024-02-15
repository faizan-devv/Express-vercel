const { BadRequestError } = require('../../utils/errorTypes');
const { isNonEmptyObject } = require('../../utils/helpers');

/**
 * @function deleteEntity
 * @description Reusable utility service to delete any entity field(s)
 * @param {Object} model
 * @param {string|number} id
 * @example deleteEntity(this.models.users, 12345)
 * @returns {Object} The will update entity by adding is_deleted check to true from the database
 */
function deleteEntity(model, id, userId) {
  const performDelete = (entity) =>
    entity.update({
      IsDeleted: true,
      ModifiedBy: userId,
      ModifiedDate: Date.now(),
    });

  return model.findByPk(id).then(performDelete);
}

/**
 * @function updateEntity
 * @description Reusable utility service to update any entity field(s)
 * @param {Object} model
 * @param {string|number} id
 * @param {Object} changeSet
 * @example updateEntity(this.models.users, 12345, {username: 'foobar', isAdmin: true})
 * @returns {Object} The updated entity from the database
 */
function updateEntity(model, id, changeSet) {
  if (!isNonEmptyObject(changeSet)) {
    throw new BadRequestError(
      'Must include changeSet, with at least one field and value'
    );
  }
  changeSet.ModifiedDate = Date.now();
  changeSet.ModifiedBy = changeSet.UserID;

  const performUpdate = (entity) => entity.update(changeSet);

  return model.findByPk(id).then(performUpdate);
}

module.exports = { deleteEntity, updateEntity };
