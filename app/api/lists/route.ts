import { getConnection } from "../../../lib/duckdb";

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
  const minVoters = parseInt(url.searchParams.get("minVoters") || "0", 10);
  const maxVoters = parseInt(url.searchParams.get("maxVoters") || "100000", 10);
  const minBooks = parseInt(url.searchParams.get("minBooks") || "0", 10);
  const maxBooks = parseInt(url.searchParams.get("maxBooks") || "10000", 10);
  const minLikes = parseInt(url.searchParams.get("minLikes") || "0", 10);
  const maxLikes = parseInt(url.searchParams.get("maxLikes") || "10000", 10);
  const sortBy = url.searchParams.get("sortBy") || "title"; // Ordenar por defecto por title
  const sortOrder = url.searchParams.get("sortOrder") || "asc"; // Orden ascendente por defecto

  console.log({
    offset,
    minVoters,
    maxVoters,
    minBooks,
    maxBooks,
    minLikes,
    maxLikes,
    sortBy,
    sortOrder,
  });

  // Validar que los valores son válidos
  if (
    isNaN(minVoters) ||
    isNaN(maxVoters) ||
    isNaN(minBooks) ||
    isNaN(maxBooks) ||
    isNaN(minLikes) ||
    isNaN(maxLikes)
  ) {
    return new Response(JSON.stringify({ error: "Parámetros inválidos" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Validar columnas de ordenación
  const validSortColumns = ["title", "num_voters", "num_books", "num_likes"];
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
    // Consulta SQL
    const query = `
      SELECT * FROM list
      WHERE num_voters BETWEEN ${minVoters} AND ${maxVoters}
        AND num_books BETWEEN ${minBooks} AND ${maxBooks}
        AND num_likes BETWEEN ${minLikes} AND ${maxLikes}
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
    console.error("Error al obtener las listas:", error);
    return new Response(
      JSON.stringify({ error: "Error al obtener las listas" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
