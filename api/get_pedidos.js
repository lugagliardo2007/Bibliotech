import { sql } from '../lib/db.js';

export default async function handler(req, res) {
  try {
    // 1) Traer todas las reservas + nombre del docente
    const reservas = await sql`
      SELECT r.*, u."Nombre" AS "nombreDocente"
      FROM "Reserva" r
      JOIN "Usuario" u ON r."id_usuario" = u."ID_usuario"
      ORDER BY r."fecha_solicitud" DESC
    `;

    // 2) Para cada reserva, traer los equipos pedidos (vía Detalle reserva)
    for (const r of reservas) {
      r.equipos = await sql`
        SELECT e."id_equipo", e."Tipo", e."modelo", e."num_serie"
        FROM "Detalle reserva" dr
        JOIN "Equipo" e ON dr."id_equipo" = e."id_equipo"
        WHERE dr."id_reserva" = ${r.ID_reserva}
      `;
    }

    res.status(200).json(reservas);
  } catch (e) {
    res.status(500).json({ ok: false, error: 'Error de conexión a la base de datos' });
  }
}
