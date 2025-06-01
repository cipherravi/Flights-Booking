const { getLogger } = require("../config");
const logger = getLogger(__filename);

class CrudRepository {
  constructor(model) {
    this.model = model;
  }
  async create(data) {
    const response = await this.model.create(data);
    logger.info("Successfully accessed create");
    return response;
  }
  async destroy(condition) {
    const response = await this.model.destroy({
      where: condition,
    });
    logger.info("Successfully accessed destroy");
    return response;
  }
  async get(id) {
    const response = await this.model.findByPk(id);
    logger.info("Successfully accessed get");
    return response;
  }
  async getAll(condition) {
    const response = await this.model.findAll({ where: condition });
    logger.info("Successfully accessed getAll");
    return response;
  }
  async update(id, data) {
    //data -> {col:val, ...}

    const updateRecord = await this.model.update(data, { where: { id: id } });
    logger.info("Successfully accessed update");
    logger.info(`Successfully updated record with id: ${id}`);

    return updateRecord;
  }
}

module.exports = CrudRepository;
