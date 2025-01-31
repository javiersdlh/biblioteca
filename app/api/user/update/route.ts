import { NextResponse } from 'next/server';
import { getConnection } from '../../../../lib/duckdb';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { type, favorite_id, puntuacionValue } = body;

        if (!type || !favorite_id) {
            return NextResponse.json({ error: 'El tipo y el ID del favorito son requeridos' }, { status: 400 });
        }

        const puntuacion = puntuacionValue !== undefined ? puntuacionValue : null;

        console.log("Recibido:", { type, favorite_id, puntuacion });

        const db = getConnection();

        // Consulta UPDATE
        const queryUpdate = `
            UPDATE guardados
            SET puntuacion = ?
            WHERE type = ? AND id = ?
        `;
        const stmtUpdate = db.prepare(queryUpdate);

        await new Promise((resolve, reject) => {
            stmtUpdate.run(puntuacion, type, favorite_id, (err) => {
                if (err) {
                    console.error('Error al actualizar la puntuación en DuckDB:', err);
                    reject(new Error('Hubo un error al actualizar la puntuación'));
                } else {
                    resolve('Puntuación actualizada exitosamente');
                }
            });
        });

        return NextResponse.json({ message: 'Puntuación actualizada exitosamente' }, { status: 200 });
    } catch (error) {
        console.error('Error al procesar la solicitud:', error);
        return NextResponse.json({ error: 'Hubo un error al procesar la solicitud' }, { status: 500 });
    }
}
