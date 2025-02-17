import os
import json
import time

# Ruta del archivo original
file_path = "books.json"
# Ruta del archivo temporal
temp_file_path = "books_temp.json"

# Registrar el tiempo de inicio
start_time = time.time()

# Contadores
total_lines = 0
valid_lines = 0

# Leer el archivo original y filtrar los libros
with open(file_path, "r", encoding="utf-8") as infile, open(temp_file_path, "w", encoding="utf-8") as tempfile:
    for line in infile:
        total_lines += 1
        try:
            book = json.loads(line.strip())  # Convertir la línea en JSON

            # Filtrar solo los libros en español
            if book.get("language") in ["es-MX", "spa"]:
                # Escribir el libro válido en el archivo temporal
                tempfile.write(line)  # Escribimos la línea tal como está, sin modificarla
                valid_lines += 1

        except json.JSONDecodeError:
            continue  # Ignorar líneas con errores

# Reemplazar el archivo original con la versión filtrada
os.replace(temp_file_path, file_path)

# Mostrar resultados
elapsed_time = time.time() - start_time
print(f"Se han mantenido {valid_lines} libros en español de {total_lines} líneas procesadas.")
print(f"Tiempo total: {elapsed_time:.2f} segundos.")
