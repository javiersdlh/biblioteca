import { NextResponse } from "next/server";
import { getConnection } from "../../../../../lib/duckdb";

const bigIntReplacer = (key: string, value: unknown): unknown => {
    if (typeof value === "bigint") {
        return value.toString();
    }
    return value;
};

export async function GET() {
    const connFavorites = getConnection();

    if (!connFavorites) {
        console.error("Error: No se pudo establecer la conexión con DuckDB");
        return NextResponse.json(
            { error: "No se pudo conectar con la base de datos" },
            { status: 500 }
        );
    }

    try {
        const authorsQuery = `
            SELECT * 
            FROM authors a
            JOIN guardados g ON g.id = a.id
            WHERE g.type = 'author';
        `;

        const authors = await new Promise((resolve, reject) => {
            connFavorites.all(authorsQuery, (err, rows) => {
                if (err) {
                    console.error("Error al ejecutar la consulta:", err);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });

        // Manejo si no hay autores favoritos
        if (!authors || (Array.isArray(authors) && authors.length === 0)) {
            return NextResponse.json(
                { message: "No se encontraron autores favoritos" },
                { status: 200 }
            );
        }

        return new NextResponse(
            JSON.stringify({ authors }, bigIntReplacer),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error al obtener los autores favoritos:", error);
        return NextResponse.json(
            { error: "Error al obtener los autores favoritos" },
            { status: 500 }
        );
    }
}
