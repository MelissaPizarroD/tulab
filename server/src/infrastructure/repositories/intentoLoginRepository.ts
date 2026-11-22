import pool from '../database/connection';

export const intentoLoginRepository = {

  async registrar(codigo_usado: string, ip_origen: string) {
    await pool.query(
      `INSERT INTO intento_login (codigo_usado, ip_origen) VALUES ($1, $2)`,
      [codigo_usado.slice(0, 50), ip_origen.slice(0, 45)]
    );
  }

};