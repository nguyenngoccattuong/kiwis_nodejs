// const this.connection = require("../database/connect");
const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);
const Model = require("./Model");

class User_Model extends Model {
  async findAll(phone, sort_name, sort_type, limit, skip) {
    const sql =
      `SELECT id, phone, created_at, updated_at FROM users WHERE phone like ? ORDER BY ` +
      sort_name +
      ` ` +
      sort_type +
      ` LIMIT ` +
      skip +
      `,` +
      limit;

    const [data] = await this.connection.query(sql, ["%" + phone + "%"]);
    return data;
  }

  async findOne(id) {
    const sql =
      "SELECT id,phone,created_at,updated_at FROM users WHERE id = " + id;
    const data = await this.connection.query(sql);
    return data[0];
  }

  async create(data, created_by) {
    const sql =
      "INSERT INTO users (phone, password, created_by) VALUES (?, ?, ?)";
    const [result] = await this.connection.query(sql, [
      data.phone,
      bcrypt.hashSync(data.password, salt),
      created_by,
    ]);

    const insertedId = result.insertId;

    const selectSql = "SELECT * FROM users WHERE id = ?";
    const [query] = await this.connection.query(selectSql, [insertedId]);

    return query[0];
  }

  async update(id, password) {
    const sql = "UPDATE users SET password = ? WHERE id = ?";
    await this.connection.query(sql, [password, id]);

    const selectSql = "SELECT * FROM users WHERE id = ?";
    const [data] = await this.connection.query(selectSql, [id]);

    return data[0];
  }

  async delete(id) {
    const sql = "DELETE FROM users WHERE id = ?";
    await this.connection.query(sql, [id]);

    // const selectSql = "SELECT * FROM users WHERE id = ?";
    // const [data] = await this.connection.query(selectSql, [id]);

    return "Deleted!";
  }

  login(phone, password) {}

  async check_phone(phone) {
    const sql = "SELECT id FROM users WHERE phone = ?";
    const [data] = await this.connection.query(sql, [phone]);
    return data[0] ? true : false;
  }

  async getPhone(phone) {
    const sql = "SELECT id, password FROM users WHERE phone = ?";
    const data = await this.connection.query(sql, [phone]);
    return data[0];
  }
}

module.exports = User_Model;
