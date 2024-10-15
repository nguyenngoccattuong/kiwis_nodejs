const z = require("zod");
class UserValidation {
  //
  createUser = {
    body: z.object({
      email: z.string().email().required(),
      phone: z.string().phone().required(),
      password: z.string().min(6).required(),
    }),
  }

  //
  loginUser = {
    body: z.object({
      phone: z.string().email().required(),
      password: z.string().min(6).required(),
    }),
  }

  //
  updateUser = {
    body: z.object({
      email: z.string().email().optional(),
      phone: z.string().email().optional(),
      password: z.string().min(6).optional(),
    }),
  }
  
  //
  deleteUser = {
    params: z.object({
      id: z.string().required(),
    }),
  }
}

module.exports = UserValidation;
