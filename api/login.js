import bcrypt from 'bcryptjs';
import { sql } from '../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Método no permitido' });
  }

  try {
    const { usuario = '', pass = '' } = req.body || {};

    // Permite ingresar con el nombre de usuario o con el email
    const rows = await sql`
      SELECT "ID_usuario", "Nombre", "Rol", "Contraseña"
      FROM "Usuario"
      WHERE "Nombre" = ${usuario} OR "Email" = ${usuario}
      LIMIT 1
    `;

    if (!rows.length) {
      return res.status(200).json({ ok: false });
    }

    const u = rows[0];
    const stored = u['Contraseña'] || '';

    // Las cuentas nuevas (creadas desde /api/registrar) guardan un hash bcrypt,
    // que siempre arranca con "$2". Las cuentas viejas quedaron en texto plano.
    const esHash = stored.startsWith('$2');
    const passwordOk = esHash
      ? await bcrypt.compare(pass, stored)
      : pass === stored;

    if (!passwordOk) {
      return res.status(200).json({ ok: false });
    }

    return res.status(200).json({ ok: true, id: u.ID_usuario, nombre: u.Nombre, rol: u.Rol });
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'Error de conexión a la base de datos' });
  }
}
