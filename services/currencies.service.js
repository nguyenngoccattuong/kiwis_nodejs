const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
 
class CurrenciesService{

  async createCurrency(data) {
    return await prisma.currency.create({ data });
  }
}

module.exports = CurrenciesService;