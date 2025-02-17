import { getConnection } from "../../../../lib/duckdb";

const bigIntReplacer = (key: string, value: unknown): unknown => {
  if (typeof value === "bigint") {
    return value.toString(); // Convertir BigInt a string
  }
  return value;
};

// Definir la estructura de la respuesta
interface ListDetails {
  id: number;
  title: string;
  description: string;
  description_html: string;
  num_pages: number;
  num_books: number;
  num_voters: number;
  created_date: string;
  tags: string[];
  num_likes: number;
  created_by: { name: string; id: string };
  num_comments: number;
  books: any[];
}

export async function GET(
  req: Request,
  context: { params: { id: string } }
) {
  // Acceder a params.id
  const { id } = await context.params;

  if (!id) {
    return new Response(JSON.stringify({ error: "ID no proporcionado" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

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

  console.log("ID recibido:", id);

  try {
    // Consulta SQL
    const query = `
      SELECT
        id,
        title,
        description,
        description_html,
        num_pages,
        num_books,
        num_voters,
        created_date,
        tags,
        num_likes,
        created_by, -- Asegúrate de que esta columna exista
        num_comments,
        books
      FROM list
      WHERE id = ${id}
    `;

    console.log("Consulta SQL:", query);

    const result = await new Promise<ListDetails | null>((resolve, reject) => {
      conn.all(query, (err: Error | null, rows: any[]) => {
        if (err) {
          console.error("Error en la consulta SQL:", err.message);
          reject(err);
        } else {
          const mappedRows = rows.map(row => ({
            id: row.id,
            title: row.title,
            description: row.description,
            description_html: row.description_html,
            num_pages: row.num_pages,
            num_books: row.num_books,
            num_voters: row.num_voters,
            created_date: row.created_date,
            tags: Array.isArray(row.tags) ? row.tags : [],
            num_likes: row.num_likes,
            created_by: row.created_by && typeof row.created_by === 'object' ? row.created_by : { name: "", id: "" },
            num_comments: row.num_comments,
            books: Array.isArray(row.books) ? row.books : [],
          }));
          resolve(mappedRows[0] || null);
        }
      });
    });

    if (!result) {
      return new Response(JSON.stringify({ error: "Lista no encontrada" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("Datos obtenidos:", result);

    return new Response(JSON.stringify(result, bigIntReplacer), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error al obtener los detalles de la lista:", error);
    return new Response(
      JSON.stringify({ error: "Error al obtener los detalles de la lista" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
