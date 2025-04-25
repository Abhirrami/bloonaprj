const db = require('../config/database');

class Hospital {
  static async create(hospitalData) {
    const { name, hospital_id, location, contact, password } = hospitalData;
    
    const [result] = await db.execute(
      `INSERT INTO hospitals (name, hospital_id, location, contact, password)
       VALUES (?, ?, ?, ?, ?)`,
      [name, hospital_id, location, contact, password]
    );
    
    return result.insertId;
  }

  static async findByHospitalId(hospital_id) {
    const [rows] = await db.execute(
      'SELECT * FROM hospitals WHERE hospital_id = ?',
      [hospital_id]
    );
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM hospitals WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async update(id, updateData) {
    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updateData);
    values.push(id);

    await db.execute(
      `UPDATE hospitals SET ${fields} WHERE id = ?`,
      values
    );
  }

  static async delete(id) {
    await db.execute(
      'DELETE FROM hospitals WHERE id = ?',
      [id]
    );
  }

  static async getAll() {
    const [rows] = await db.execute('SELECT * FROM hospitals');
    return rows;
  }

  static async getBloodRequests(hospital_id) {
    const [rows] = await db.execute(
      'SELECT * FROM blood_requests WHERE hospital_id = ?',
      [hospital_id]
    );
    return rows;
  }

  static async createBloodRequest(requestData) {
    const { hospital_id, blood_group, quantity, urgency } = requestData;
    
    const [result] = await db.execute(
      `INSERT INTO blood_requests (hospital_id, blood_group, quantity, urgency)
       VALUES (?, ?, ?, ?)`,
      [hospital_id, blood_group, quantity, urgency]
    );
    
    return result.insertId;
  }

  static async getDonations(hospital_id) {
    const [rows] = await db.execute(
      `SELECT d.*, dn.name as donor_name 
       FROM donations d 
       JOIN donors dn ON d.donor_id = dn.id 
       WHERE d.hospital_id = ?`,
      [hospital_id]
    );
    return rows;
  }
}

module.exports = Hospital; 