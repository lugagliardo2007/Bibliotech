import { getPool } from '../lib/db.js';

const ESTADOS = {
  aceptar: 'aceptado',
  rechazar: 'rechazado',
  entregar: 'entregado',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Método no permitido' });
  }

  const { idReserva, accion } = req.body || {};
  const nuevoEstado = ESTADOS[accion];

  if (!nuevoEstado) {
    return res.status(400).json({ ok: false, error: 'Acción inválida' });
  }

  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1) Actualizar estado de la reserva
    await client.query(
      'UPDATE "Reserva" SET "estado_reserva" = $1 WHERE "ID_reserva" = $2',
      [nuevoEstado, idReserva]
    );

    // 2) Si se rechaza o se entrega, liberar los equipos asociados
    if (accion === 'rechazar' || accion === 'entregar') {
      await client.query(
        `UPDATE "Equipo" SET "Estado_actual" = 'Libre'
         WHERE "id_equipo" IN (
           SELECT "id_equipo" FROM "Detalle reserva" WHERE "id_reserva" = $1
         )`,
        [idReserva]
      );
    }

    await client.query('COMMIT');
    res.status(200).json({ ok: true });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ ok: false, error: 'No se pudo procesar la acción' });
  } finally {
    client.release();
    await pool.end();
  }
}
