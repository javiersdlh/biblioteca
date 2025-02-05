import { getConnection } from "../../../../lib/duckdb";

const bigIntReplacer = (key: string, value: unknown): unknown => {
    if (typeof value === "bigint") {
        return value.toString();
    }
    return value;
};

// GET para buscar un autor
export async function GET(request: Request) {
    let conn;
    try {
        conn = getConnection();
        console.log("Conexión establecida:", conn);
    } catch (error) {
        console.error("Error al establecer la conexión:", error);
        return new Response(
            JSON.stringify({ error: "Error en la conexión a la base de datos" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }

    const url = new URL(request.url);
    const searchTerm = decodeURIComponent(url.pathname.split('/').pop()!); // Decodificar el término de búsqueda

    if (!searchTerm) {
        return new Response(
            JSON.stringify({ error: "Debe proporcionar un término de búsqueda" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    // Convierte el término de búsqueda a minúsculas y divide en palabras
    const searchWords = searchTerm.trim().toLowerCase().split(/\s+/);

    // Construir la parte de la consulta para cada palabra
    const conditions = searchWords
        .map(word => `LOWER(name) LIKE '%${word}%'`)
        .join(' AND ');

    // Consulta SQL para obtener solo un autor
    const query = `
    SELECT *
    FROM authors
    WHERE (${conditions})
    ORDER BY ratings_count DESC
    LIMIT 10;
  `;

    console.log("Consulta SQL de búsqueda:", query);

    try {
        const result = await new Promise<unknown>((resolve, reject) => {
            conn.all(query, (err, rows) => {
                if (err) {
                    console.error("Error en la consulta de búsqueda de autor:", err);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });

        console.log("Datos obtenidos de la búsqueda:", result);

        return new Response(JSON.stringify(result, bigIntReplacer), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error al buscar el autor:", error.message);
            return new Response(
                JSON.stringify({ error: "Error al buscar el autor", details: error.message }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        } else {
            console.error("Error desconocido:", error);
            return new Response(
                JSON.stringify({ error: "Error desconocido", details: "No se pudo obtener más detalles del error." }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }
    }
}
