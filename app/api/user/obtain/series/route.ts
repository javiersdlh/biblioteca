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
        const seriesQuery = `
            SELECT * 
            FROM series s
            JOIN guardados g ON g.id = s.id
            WHERE g.type = 'series';
        `;

        const series = await new Promise((resolve, reject) => {
            connFavorites.all(seriesQuery, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        return new NextResponse(
            JSON.stringify({ series }, bigIntReplacer),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error: unknown) {
        console.error("Error al obtener las series favoritas:", error);
        return NextResponse.json(
            { error: "Error al obtener las series favoritas" },
            { status: 500 }
        );
    }
}
