import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from "../../../../../lib/duckdb";

export async function DELETE(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const type = pathname.split('/')[4];

    const id = req.nextUrl.searchParams.get(`id_${type}`);

    // Verificar si el id está presente
    if (!id) {
        return NextResponse.json({ error: `Falta el parámetro id_${type}` }, { status: 400 });
    }

    try {
        let entityType = '';

        // Mapeo de tipo de favorito a tipo de entidad
        if (type === 'lists') {
            entityType = 'list';
        } else if (type === 'books') {
            entityType = 'book';
        } else if (type === 'authors') {
            entityType = 'author';
        } else if (type === 'series') {
            entityType = 'series';
        } else {
            return NextResponse.json({ error: `Tipo de favorito desconocido: ${type}` }, { status: 400 });
        }

        // Verificar que el id sea válido
        if (isNaN(Number(id))) {
            return NextResponse.json({ error: `El id proporcionado no es válido` }, { status: 400 });
        }

        // Conexión a la base de datos
        const conn = getConnection();
        if (!conn) {
            return NextResponse.json({ error: "Error de conexión a la base de datos" }, { status: 500 });
        }

        // Consulta DELETE para eliminar
        const deleteQuery = `DELETE FROM guardados WHERE id = ? AND type = ?;`;
        console.log(`Ejecutando DELETE con id: ${id}, type: ${entityType}`);

        // Ejecutar la consulta DELETE
        await new Promise((resolve, reject) => {
            conn.run(deleteQuery, String(id), entityType, (err) => {
                if (err) {
                    reject(err); // Manejar errores de la consulta
                } else {
                    resolve(null); // Resuelve la promesa si la consulta se ejecutó correctamente
                }
            });
        });

        // Verificar si el registro fue eliminado
        const checkQuery = `SELECT COUNT(*) AS count FROM guardados WHERE id = ? AND type = ?;`;
        console.log(`Verificando eliminación con id: ${id}, type: ${entityType}`);

        const results = await new Promise<any[]>((resolve, reject) => {
            conn.all(checkQuery, String(id), entityType, (err, rows) => {
                if (err) {
                    console.error("Error al ejecutar SELECT COUNT(*):", err);
                    reject(err); // Captura el error y lo muestra en consola
                } else {
                    console.log("Resultado de SELECT COUNT(*):", rows);
                    resolve(rows);
                }
            });
        });


        let count = results.length > 0 ? Number(results[0].count) : 0;
        if (isNaN(count)) count = 0;


        console.log(`Registros restantes: ${count}`);

        // Verificar si el registro fue eliminado
        if (count === 0) {
            console.log(`El registro con id: ${id} y type: ${entityType} fue eliminado correctamente.`);
            // Si la eliminación fue exitosa, se devuelve una respuesta positiva
            return NextResponse.json({ message: `Eliminado correctamente` }, { status: 200 });
        } else {
            console.error(`No se pudo eliminar el registro con id: ${id} y type: ${entityType}`);
            return NextResponse.json({ error: "No se pudo eliminar el registro" }, { status: 500 });
        }

    } catch (error) {
        console.error("Error al eliminar el favorito:", error);
        return NextResponse.json({ error: `Error al eliminar el favorito: ${error}` }, { status: 500 });
    }
}