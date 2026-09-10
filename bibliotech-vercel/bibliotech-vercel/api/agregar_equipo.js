import { sql } from '../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Método no permitido' });
  }

  try {
    const { tipo, modelo, numSerie } = req.body || {};

    if (!tipo || !modelo) {
      return res.status(400).json({ ok: false, error: 'Faltan datos del equipo' });
    }

    const rows = await sql`
      INSERT INTO "Equipo" ("Tipo","modelo","num_serie","Estado_actual")
      VALUES (${tipo}, ${modelo}, ${numSerie || null}, 'Libre')
      RETURNING "id_equipo"
    `;

    res.status(200).json({ ok: true, idEquipo: rows[0].id_equipo });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'No se pudo agregar el equipo' });
  }
}
