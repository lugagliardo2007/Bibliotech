import { sql } from '../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Método no permitido' });
  }

  try {
    const { usuario = '', pass = '' } = req.body || {};

    const rows = await sql`
      SELECT "ID_usuario", "Nombre", "Rol"
      FROM "Usuario"
      WHERE "Nombre" = ${usuario} AND "Contraseña" = ${pass}
    `;

    if (rows.length) {
      const u = rows[0];
      return res.status(200).json({ ok: true, id: u.ID_usuario, nombre: u.Nombre, rol: u.Rol });
    }

    return res.status(200).json({ ok: false });
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'Error de conexión a la base de datos' });
  }
}
