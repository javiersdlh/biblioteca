import { getConnection } from "../../../../lib/duckdb"; // Ajusta la ruta si es necesario

// Custom replacer function to handle BigInt serialization
const bigIntReplacer = (key: string, value: unknown): unknown => {
  if (typeof value === "bigint") {
    return value.toString(); // Convert BigInt to string
  }
  return value; // Return other values as is
};

// Definir la estructura de la respuesta esperada de la consulta
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
  created_by: { name: string; id: string }; // Ajustado para coincidir con la estructura
  num_comments: number;
  books: any[]; // Ajusta según la estructura real
}

export async function GET(
  req: Request,
  context: { params: { id: string } }
) {
  // Acceder a `params.id` de forma asíncrona
  const { id } = await context.params; // Aquí se debe usar `await`

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
    // Consulta SQL para obtener los detalles de la lista por ID
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
            // Asegúrate de que `tags` sea un array de cadenas
            tags: Array.isArray(row.tags) ? row.tags : [],
            num_likes: row.num_likes,
            // Asegúrate de que `created_by` sea un objeto con name e id
            created_by: row.created_by && typeof row.created_by === 'object' ? row.created_by : { name: "", id: "" },
            num_comments: row.num_comments,
            // Asegúrate de que `books` sea un array
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
