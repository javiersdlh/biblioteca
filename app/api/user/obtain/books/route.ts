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

    try {
        const booksQuery = `
           WITH ranked_books AS (
            SELECT b.*, g.*, ROW_NUMBER() OVER (PARTITION BY b.work_id ORDER BY b.work_id) AS rn
            FROM books b
            JOIN guardados g ON g.id = b.work_id
            WHERE b.language IN ('es-MX', 'spa')
            AND g.type = 'book'
            )
        SELECT *
        FROM ranked_books
        WHERE rn = 1;
        `;

        const books = await new Promise((resolve, reject) => {
            connFavorites.all(booksQuery, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        return new NextResponse(
            JSON.stringify({ books }, bigIntReplacer),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error: unknown) {
        console.error("Error al obtener los libros favoritos:", error);
        return NextResponse.json(
            { error: "Error al obtener los libros favoritos" },
            { status: 500 }
        );
    }
}
