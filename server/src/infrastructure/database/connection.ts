import { Pool } from 'pg';
import { config } from '../../config/env';

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password,
});

pool.connect()
  .then(() => console.log('Conectado a PostgreSQL'))
  .catch((err) => console.error('Error conectando a PostgreSQL:', err.message));

export default pool;