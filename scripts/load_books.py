import duckdb

# Conectar a la base de datos (o crear una nueva si no existe)
conn = duckdb.connect('biblioteca.duckdb')

# Escribir las consultas SQL
sql = """
-- Crear una nueva tabla a partir de un archivo JSON
CREATE TABLE books AS
    SELECT *
    FROM read_json_auto('books.json');
"""

# Ejecutar las consultas SQL
conn.execute(sql)

# Confirmar la ejecución
print("Consultas ejecutadas correctamente")

# Cerrar la conexión
conn.close()
