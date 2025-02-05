import { getConnection } from "../../../../lib/duckdb";

const bigIntReplacer = (key: string, value: unknown): unknown => {
    if (typeof value === "bigint") {
        return value.toString();
    }
    return value;
};

// GET para buscar un libro específico
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

    // Condicion de la consulta
    const conditions = searchWords
        .map(word => `LOWER(title) LIKE '%${word}%'`)
        .join(' AND ');

    // Consulta SQL
    const query = `
    WITH RankedBooks AS (
        SELECT work_id, title, author_name, average_rating, num_pages, image_url, ratings_count,
               ROW_NUMBER() OVER (PARTITION BY work_id ORDER BY average_rating DESC) AS row_num
        FROM books
        WHERE (${conditions})
        AND (language LIKE 'es-MX' OR language LIKE 'spa')
    )
    SELECT work_id, title, author_name, average_rating, num_pages, image_url, ratings_count
    FROM RankedBooks
    WHERE row_num = 1
    ORDER BY ratings_count DESC
    LIMIT 10;
  `;

    console.log("Consulta SQL de búsqueda:", query);

    try {
        const result = await new Promise<unknown>((resolve, reject) => {
            conn.all(query, (err, rows) => {
                if (err) {
                    console.error("Error en la consulta de búsqueda de libro:", err);
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
            console.error("Error al buscar el libro:", error.message);
            return new Response(
                JSON.stringify({ error: "Error al buscar el libro", details: error.message }),
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
