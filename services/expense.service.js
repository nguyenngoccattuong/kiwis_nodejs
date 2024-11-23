class ExpenseService{
  async createExpense(data){
    return await prisma.expense.create({data: data});
  }

  async findById(uid){
    return await prisma.expense.findFirst({where: {
      id: uid,
    }});
  }

  async findAllByUserId(uid){
    return await prisma.expense.findMany({where: {
      userId: uid,
    }});
  }

  async findByUserId(uid){
    return await prisma.expense.findMany({where: {
      userId: uid,
    }});
  }

  async updateById(uid, data){
    return await prisma.expense.update({
      data: data,
      where: {
        id: uid,
      }
    });
  }

  async deleteById(uid){
    return await prisma.expense.deleteMany({
      where: {
        id: uid,
      }
    });
  }
}

module.exports = ExpenseService;