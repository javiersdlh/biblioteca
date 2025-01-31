import { getConnection } from "../../../lib/duckdb";

const bigIntReplacer = (key: string, value: unknown): unknown => {
  if (typeof value === "bigint") {
    return value.toString();
  }
  return value;
};

export async function GET(req: Request) {
  const conn = getConnection();
  console.log("Conexión establecida:", conn);

  // Obtener los parámetros de la URL
  const url = new URL(req.url);
  const search = url.searchParams.get("search") || "";

  // Validación del parámetro search
  if (!search.trim()) {
    return new Response(
      JSON.stringify({ error: "El parámetro de búsqueda es obligatorio" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Ejecutar la consulta
    const result = await new Promise<unknown>((resolve, reject) => {
      const query = `
        SELECT 
          id, 
          title, 
          description, 
          series_works_count, 
          json_extract(works, '$') AS works -- Extraer works como JSON
        FROM series
        WHERE LOWER(title) LIKE LOWER('%${search}%') -- Coincidencias parciales sin importar mayúsculas/minúsculas
        LIMIT 10; -- Limitar los resultados para sugerencias
      `;

      conn.all(query, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const parsedRows = rows.map((row) => ({
            ...row,
            works: JSON.parse(row.works || '[]'), // Parsear works como JSON
          }));
          resolve(parsedRows);
        }
      });
    });

    console.log("Datos obtenidos:", result);

    // Devolver los resultados como JSON
    return new Response(JSON.stringify(result, bigIntReplacer), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error al buscar las series:", error);
    return new Response(
      JSON.stringify({ error: "Error al buscar las series" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}