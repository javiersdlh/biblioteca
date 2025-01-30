import duckdb

# Conectar a la base de datos (o crear una nueva si no existe)
conn = duckdb.connect('biblioteca.duckdb')

# Escribir las consultas SQL directamente en Python
sql = """
-- Crear una nueva tabla a partir de un archivo JSON
CREATE TABLE authors AS
    SELECT *
    FROM read_json_auto('authors.json');
"""

# Ejecutar las consultas SQL
conn.execute(sql)

# Confirmar la ejecución (opcional)
print("Consultas ejecutadas correctamente")

# Cerrar la conexión
conn.close()
