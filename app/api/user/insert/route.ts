import { NextResponse } from 'next/server';
import { getConnection } from '../../../../lib/duckdb';

export async function POST(req: Request) {
    try {
        // Leer el cuerpo de la solicitud
        const body = await req.json();
        const { type, favorite_id, puntuacionValue } = body;

        // Verificar si los valores están presentes
        if (!type || !favorite_id) {
            return NextResponse.json({ error: 'El tipo y el ID del favorito son requeridos' }, { status: 400 });
        }

        // Si puntuacionValue no está presente, asignar null
        const puntuacion = puntuacionValue !== undefined ? puntuacionValue : null;

        console.log("Recibido:", { type, favorite_id, puntuacion });  // Verificación de los valores recibidos

        // Obtener la conexión a DuckDB
        const db = getConnection();

        // Crear la consulta SQL de inserción para la tabla guardados
        const query = `INSERT INTO guardados ("type", id, puntuacion) VALUES (?, ?, ?)`;

        // Preparar la consulta
        const stmt = db.prepare(query);

        // Ejecutar la consulta
        await new Promise((resolve, reject) => {
            stmt.run(type, favorite_id, puntuacion, (err) => {
                if (err) {
                    console.error('Error al insertar en DuckDB:', err);  // Depuración del error
                    reject(new Error('Hubo un error al insertar el favorito'));
                } else {
                    resolve('Favorito añadido exitosamente');
                }
            });
        });

        // Responder si la inserción fue exitosa
        return NextResponse.json({ message: 'Favorito añadido exitosamente' }, { status: 200 });
    } catch (error) {
        console.error('Error al procesar la solicitud:', error);
        return NextResponse.json({ error: 'Hubo un error al procesar la solicitud' }, { status: 500 });
    }
}
