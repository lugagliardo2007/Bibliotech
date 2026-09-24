import { neon, Pool } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('Falta la variable de entorno DATABASE_URL (configurala en Vercel > Settings > Environment Variables)');
}

// Para queries simples, de una sola sentencia (SELECT, INSERT sueltos, etc.)
export const sql = neon(process.env.DATABASE_URL);

// Para operaciones que necesitan varias sentencias en una sola transacción
// (BEGIN / COMMIT / ROLLBACK), igual que $pdo->beginTransaction() en PHP.
export function getPool() {
  return new Pool({ connectionString: process.env.DATABASE_URL });
}
