const { IdempotencyKey } = require("../models");
const CrudRepository = require("./crud-repository");

class IdempotencyKeyRepository extends CrudRepository {
  constructor() {
    super(IdempotencyKey);
  }
  async addKeys(data, transaction) {
    try {
      const response = await IdempotencyKey.create(data, { transaction });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async checkPayment(condition) {
    return await IdempotencyKey.findAll({
      where: condition,
    });
  }
}

module.exports = IdempotencyKeyRepository;
