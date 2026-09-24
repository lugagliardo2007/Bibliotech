import { sql } from '../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Método no permitido' });
  }

  try {
    const { idEquipo, estado } = req.body || {};

    if (!['Libre', 'En uso'].includes(estado)) {
      return res.status(400).json({ ok: false, error: 'Estado inválido' });
    }

    await sql`UPDATE "Equipo" SET "Estado_actual" = ${estado} WHERE "id_equipo" = ${idEquipo}`;
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'No se pudo actualizar el equipo' });
  }
}
