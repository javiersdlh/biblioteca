import { getConnection } from "../../../lib/duckdb";

const bigIntReplacer = (key: string, value: unknown): unknown => {
  if (typeof value === "bigint") {
    return value.toString();
  }
  return value;
};

// GET para obtener todos los libros con filtros
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

  // Obtener parámetros de filtros
  const minRating = parseFloat(url.searchParams.get("minAverageRating") || "0");
  const maxRating = parseFloat(url.searchParams.get("maxAverageRating") || "5");
  const minRatingsCount = parseInt(url.searchParams.get("minRatingCount") || "0", 10);
  const maxRatingsCount = parseInt(url.searchParams.get("maxRatingCount") || "27003752", 10);
  const minPages = parseInt(url.searchParams.get("minPages") || "0", 10);
  const maxPages = parseInt(url.searchParams.get("maxPages") || "1000", 10);
  const offset = parseInt(url.searchParams.get("offset") || "0", 10);

  // Parámetros de ordenación
  const sortBy = url.searchParams.get("sortBy") || "averageRating";
  const order = url.searchParams.get("order") || "desc";

  if (
    isNaN(minRating) ||
    isNaN(maxRating) ||
    isNaN(minRatingsCount) ||
    isNaN(maxRatingsCount) ||
    isNaN(minPages) ||
    isNaN(maxPages) ||
    isNaN(offset)
  ) {
    return new Response(
      JSON.stringify({ error: "Parámetros inválidos" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Validar que solo se pase un parámetro de ordenación
  const validOrderParams = [sortBy, order].filter(order => order);
  if (validOrderParams.length !== 2) {
    return new Response(
      JSON.stringify({ error: "Debe seleccionar solo un parámetro de ordenación" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Determinar cuál es el parámetro de ordenación activo
  let orderClause = "";
  if (sortBy === "averageRating") {
    orderClause = `ORDER BY average_rating ${order}`;
  } else if (sortBy === "ratingsCount") {
    orderClause = `ORDER BY ratings_count ${order}`;
  } else if (sortBy === "numPages") {
    orderClause = `ORDER BY num_pages ${order}`;
  }

  // Consulta SQL
  let query = `
      WITH RankedBooks AS (
  SELECT work_id, title, author_name, average_rating, num_pages, image_url, ratings_count,
         ROW_NUMBER() OVER (PARTITION BY work_id) AS row_num
  FROM books
  WHERE average_rating BETWEEN ${minRating} AND ${maxRating}
    AND ratings_count BETWEEN ${minRatingsCount} AND ${maxRatingsCount}
    AND num_pages IS NOT NULL
    AND num_pages ~ '^[0-9]+$'
    AND CAST(num_pages AS INTEGER) BETWEEN ${minPages} AND ${maxPages}
    AND (language LIKE 'es-MX' OR language LIKE 'spa')
)
SELECT work_id, title, author_name, average_rating, num_pages, image_url, ratings_count
FROM RankedBooks
WHERE row_num = 1
${orderClause}
LIMIT 25 OFFSET ${offset};
  `;

  console.log("Consulta SQL:", query);

  try {
    const result = await new Promise<unknown>((resolve, reject) => {
      conn.all(query, (err, rows) => {
        if (err) {
          console.error("Error en la consulta de libros:", err);
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
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error al obtener los libros:", error.message);
      return new Response(
        JSON.stringify({ error: "Error al obtener los libros", details: error.message }),
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
