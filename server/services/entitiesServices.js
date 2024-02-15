const { BadRequestError } = require('../utils/errorTypes');
const { deleteEntity, updateEntity } = require('./utils/entitiesHelpers');
const { isEmpty } = require('underscore');

class EntitiesService {
  constructor(models) {
    this.models = models;
  }

  getModel = (entityName) => {
    const model = this.models[entityName];

    if (!model) throw new BadRequestError('Incorrect Entity Name Provided');

    return model;
  };

  getAll = async (entityName, where) => {
    const model = this.getModel(entityName);
    // SQL Injection Check
    for (const val of Object.values(where)) {
      if (val && val.includes(';')) {
        throw new BadRequestError(
          'Query strings are not allowed to contain the ; character. This is a SQL Injection risk.'
        );
      }
    }

    where.IsDeleted = false;

    return await model.findAll({ where });
  };

  getByID = async (entityName, id) => {
    const model = this.getModel(entityName);

    return await model.findOne({
      where: {
        ID: id,
        IsDeleted: false,
      },
    });
  };

  create = async (entityName, body) => {
    if (isEmpty(body)) {
      throw new BadRequestError(
        'Invalid data! Please provide body to create data.'
      );
    }

    const model = this.getModel(entityName);

    body.IsDeleted = false;
    body.CreatedDate = Date.now();

    return await model.create(body);
  };

  update = async (entityName, id, body) => {
    if (isEmpty(body)) {
      throw new BadRequestError(
        'Invalid data! Please provide body to update data.'
      );
    }
    const model = this.getModel(entityName);
    return await updateEntity(model, id, body);
  };

  destroy = async (entityName, id, userId) => {
    const model = this.getModel(entityName);
    return await deleteEntity(model, id, userId);
  };
}

module.exports = EntitiesService;
