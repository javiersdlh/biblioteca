import { getConnection } from "../../../lib/duckdb";

// BigInt serialization
const bigIntReplacer = (key: string, value: unknown): unknown => {
  if (typeof value === "bigint") {
    return value.toString(); // Convertir BigInt a string
  }
  return value;
};

export async function GET(req: Request) {
  let conn;
  try {
    conn = getConnection();
    console.log("Conexión establecida:", conn);
  } catch (error) {
    console.error("Error al establecer la conexión:", error);
    return new Response(JSON.stringify({ error: "Error en la conexión a la base de datos" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const url = new URL(req.url);
  const offset = parseInt(url.searchParams.get("offset") || "0", 10);
  const minRatingCount = parseInt(url.searchParams.get("minRatingCount") || "0", 10);
  const maxRatingCount = parseInt(url.searchParams.get("maxRatingCount") || "10000", 10);
  const minAverageRating = parseFloat(url.searchParams.get("minAverageRating") || "0");
  const maxAverageRating = parseFloat(url.searchParams.get("maxAverageRating") || "10");
  const sortBy = url.searchParams.get("sortBy") || "name"; // Ordenar por defecto por "name"
  const sortOrder = url.searchParams.get("sortOrder") || "asc"; // Orden ascendente por defecto

  console.log({
    offset,
    minRatingCount,
    maxRatingCount,
    minAverageRating,
    maxAverageRating,
    sortBy,
    sortOrder,
  });

  if (
    isNaN(minRatingCount) ||
    isNaN(maxRatingCount) ||
    isNaN(minAverageRating) ||
    isNaN(maxAverageRating)
  ) {
    return new Response(JSON.stringify({ error: "Parámetros inválidos" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Validar columnas de ordenación
  const validSortColumns = ["name", "fans_count", "ratings_count", "average_rating"];
  if (!validSortColumns.includes(sortBy)) {
    return new Response(JSON.stringify({ error: "Columna de ordenación inválida" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Validar orden (asc o desc)
  if (sortOrder !== "asc" && sortOrder !== "desc") {
    return new Response(JSON.stringify({ error: "Orden de ordenación inválido" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Construir la consulta
    const query = `
      SELECT * FROM authors
      WHERE ratings_count BETWEEN ${minRatingCount} AND ${maxRatingCount}
        AND average_rating BETWEEN ${minAverageRating} AND ${maxAverageRating}
      ORDER BY ${sortBy} ${sortOrder.toUpperCase()}
      LIMIT 25 OFFSET ${offset}
    `;

    console.log("Consulta SQL:", query);

    // Ejecutar la consulta
    const result = await new Promise<unknown>((resolve, reject) => {
      conn.all(query, (err, rows) => {
        if (err) {
          console.error("Error en la consulta SQL:", err.message);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

    console.log("Datos obtenidos:", result);

    return new Response(JSON.stringify(result, bigIntReplacer), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error al obtener las authors:", error);
    return new Response(
      JSON.stringify({ error: "Error al obtener las authors" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
