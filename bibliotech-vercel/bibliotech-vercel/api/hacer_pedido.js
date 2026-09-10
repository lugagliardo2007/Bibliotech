import { getPool } from '../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Método no permitido' });
  }

  const { idUsuario, aula, fechaUso, turnoHorario, equiposIds } = req.body || {};

  if (!Array.isArray(equiposIds) || equiposIds.length === 0) {
    return res.status(400).json({ ok: false, error: 'Debés seleccionar al menos un equipo' });
  }

  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1) Crear la reserva
    const result = await client.query(
      `INSERT INTO "Reserva" ("fecha_solicitud","fecha_uso","turno_horario","aula","estado_reserva","id_usuario")
       VALUES (CURRENT_DATE, $1, $2, $3, 'pendiente', $4)
       RETURNING "ID_reserva"`,
      [fechaUso, turnoHorario, aula, idUsuario]
    );
    const idReserva = result.rows[0].ID_reserva;

    // 2) Vincular cada equipo pedido + marcarlo en uso
    for (const idEquipo of equiposIds) {
      await client.query(
        'INSERT INTO "Detalle reserva" ("id_reserva","id_equipo") VALUES ($1, $2)',
        [idReserva, idEquipo]
      );
      await client.query(
        `UPDATE "Equipo" SET "Estado_actual" = 'En uso' WHERE "id_equipo" = $1`,
        [idEquipo]
      );
    }

    await client.query('COMMIT');
    res.status(200).json({ ok: true, idReserva });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ ok: false, error: 'No se pudo registrar el pedido' });
  } finally {
    client.release();
    await pool.end();
  }
}
