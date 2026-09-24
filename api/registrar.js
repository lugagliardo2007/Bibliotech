import bcrypt from 'bcryptjs';
import { sql } from '../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Método no permitido' });
  }

  try {
    const { nombre = '', email = '', pass = '' } = req.body || {};

    if (!nombre.trim() || !email.trim() || !pass) {
      return res.status(400).json({ ok: false, error: 'Completá todos los campos' });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ ok: false, error: 'Email inválido' });
    }
    if (pass.length < 6) {
      return res.status(400).json({ ok: false, error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const existente = await sql`
      SELECT "ID_usuario" FROM "Usuario" WHERE "Email" = ${email} LIMIT 1
    `;
    if (existente.length) {
      return res.status(409).json({ ok: false, error: 'Ya existe una cuenta con ese email' });
    }

    const hash = await bcrypt.hash(pass, 10);

    const rows = await sql`
      INSERT INTO "Usuario" ("Nombre", "Email", "Contraseña", "Rol")
      VALUES (${nombre}, ${email}, ${hash}, 'docente')
      RETURNING "ID_usuario", "Nombre", "Rol"
    `;
    const u = rows[0];

    return res.status(200).json({ ok: true, id: u.ID_usuario, nombre: u.Nombre, rol: u.Rol });
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'No se pudo crear la cuenta' });
  }
}
