import { sql } from '../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Método no permitido' });
  }

  try {
    const { idUsuario, idEquipo, descripcion } = req.body || {};

    await sql`
      INSERT INTO "Reporte fallo" ("Descripcion","fecha_reporte","estado_fallo","id_usuario","id_equipo")
      VALUES (${descripcion}, CURRENT_DATE, 'pendiente', ${idUsuario}, ${idEquipo})
    `;

    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'No se pudo registrar el reporte' });
  }
}
