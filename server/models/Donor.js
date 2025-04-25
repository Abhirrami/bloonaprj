const db = require('../config/database');

class Donor {
  static async create(donorData) {
    const { name, age, donor_id, blood_group, location, contact, password, health_report } = donorData;
    
    const [result] = await db.execute(
      `INSERT INTO donors (name, age, donor_id, blood_group, location, contact, password, health_report)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, age, donor_id, blood_group, location, contact, password, health_report]
    );
    
    return result.insertId;
  }

  static async findByDonorId(donor_id) {
    const [rows] = await db.execute(
      'SELECT * FROM donors WHERE donor_id = ?',
      [donor_id]
    );
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM donors WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async update(id, updateData) {
    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updateData);
    values.push(id);

    await db.execute(
      `UPDATE donors SET ${fields} WHERE id = ?`,
      values
    );
  }

  static async delete(id) {
    await db.execute(
      'DELETE FROM donors WHERE id = ?',
      [id]
    );
  }

  static async getAll() {
    const [rows] = await db.execute('SELECT * FROM donors');
    return rows;
  }

  static async getByBloodGroup(blood_group) {
    const [rows] = await db.execute(
      'SELECT * FROM donors WHERE blood_group = ?',
      [blood_group]
    );
    return rows;
  }

  static async getDonations(donor_id) {
    const [rows] = await db.execute(
      `SELECT d.*, h.name as hospital_name 
       FROM donations d 
       JOIN hospitals h ON d.hospital_id = h.id 
       WHERE d.donor_id = ?`,
      [donor_id]
    );
    return rows;
  }
}

module.exports = Donor; 