import { sql } from '../lib/db.js';

export default async function handler(req, res) {
  try {
    const reportes = await sql`
      SELECT rf.*, u."Nombre" AS "nombreDocente", e."Tipo" AS "tipoEquipo", e."modelo"
      FROM "Reporte fallo" rf
      JOIN "Usuario" u ON rf."id_usuario" = u."ID_usuario"
      JOIN "Equipo" e ON rf."id_equipo" = e."id_equipo"
      ORDER BY rf."fecha_reporte" DESC
    `;
    res.status(200).json(reportes);
  } catch (e) {
    res.status(500).json({ ok: false, error: 'Error de conexión a la base de datos' });
  }
}
