import duckdb from "duckdb";

const globalForDuckDBLibrary = global as unknown as { conn: duckdb.Database | null };

// Inicializa la conexión si no existe
if (!globalForDuckDBLibrary.conn) {
  globalForDuckDBLibrary.conn = new duckdb.Database("./lib/biblioteca.duckdb"); // Ruta al archivo
  console.log("Conexión a DuckDB de biblioteca inicializada.");
}

// Exporta la conexión
export const getConnection = (): duckdb.Database => {
  if (!globalForDuckDBLibrary.conn) {
    throw new Error("La conexión a DuckDB de biblioteca no se inicializó correctamente.");
  }
  return globalForDuckDBLibrary.conn;
};
