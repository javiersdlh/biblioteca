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
        const listQuery = `
            SELECT * 
            FROM list l
            JOIN guardados g ON g.id = l.id
            WHERE g.type = 'list';
        `;

        const lists = await new Promise((resolve, reject) => {
            connFavorites.all(listQuery, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        return new NextResponse(
            JSON.stringify({ lists }, bigIntReplacer),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error: unknown) {
        console.error("Error al obtener las listas favoritas:", error);
        return NextResponse.json(
            { error: "Error al obtener las listas favoritas" },
            { status: 500 }
        );
    }
}
