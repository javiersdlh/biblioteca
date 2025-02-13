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
        // Consulta para obtener todos los registros de la tabla guardados
        const guardadosQuery = `
            SELECT * 
            FROM guardados;
        `;

        const guardados = await new Promise((resolve, reject) => {
            connFavorites.all(guardadosQuery, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        return new NextResponse(
            JSON.stringify({ guardados }, bigIntReplacer),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error: unknown) {
        console.error("Error al obtener los datos de la tabla guardados:", error);
        return NextResponse.json(
            { error: "Error al obtener los datos de la tabla guardados" },
            { status: 500 }
        );
    }
}
