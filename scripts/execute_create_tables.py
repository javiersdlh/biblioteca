import duckdb
import os

# Función para ejecutar el SQL
def execute_sql_from_file(file_path):
    # Conectar a la base de datos (si no existe, se crea)
    conn = duckdb.connect('./biblioteca.duckdb')

    # Leer el archivo SQL
    with open(file_path, 'r') as file:
        sql_query = file.read()

    # Ejecutar el SQL
    try:
        conn.execute(sql_query)
        print("SQL ejecutado con éxito.")
    except Exception as e:
        print(f"Hubo un error al ejecutar el SQL: {e}")
    finally:
        # Cerrar la conexión
        conn.close()

# Ruta al archivo SQL
sql_file_path = os.path.join(os.path.dirname(__file__), 'create_tables.sql')

# Ejecutar el SQL desde el archivo
execute_sql_from_file(sql_file_path)
