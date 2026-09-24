import { sql } from '../lib/db.js';

export default async function handler(req, res) {
  try {
    const equipos = await sql`SELECT * FROM "Equipo" ORDER BY "id_equipo"`;
    res.status(200).json(equipos);
  } catch (e) {
    res.status(500).json({ ok: false, error: 'Error de conexión a la base de datos' });
  }
}
