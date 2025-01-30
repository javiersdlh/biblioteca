import os
import json
import time

# Ruta del archivo JSON original
file_path = "books.json"
# Ruta del archivo temporal
temp_file_path = "libros_temp.json"

# Registrar el tiempo de inicio
start_time = time.time()

# Caracteres de terminación de línea inusuales
unusual_terminators = ["\u2028", "\u2029"]  # LS y PS

# Abrir el archivo original para leer y un archivo temporal para escribir
with open(file_path, "r", encoding="utf-8") as infile, open(temp_file_path, "w", encoding="utf-8") as tempfile:
    total_lines = 0
    processed_lines = 0
    for line in infile:
        total_lines += 1
        # Reemplazar terminadores de línea inusuales
        for terminator in unusual_terminators:
            line = line.replace(terminator, "")
        try:
            # Intentar cargar cada línea como JSON
            book = json.loads(line.strip())
            
            # Filtrar los libros que cumplen con la condición
            if book.get("language") in ["es-MX", "spa"]:
                # Escribir los datos filtrados en el archivo temporal
                tempfile.write(json.dumps(book, ensure_ascii=False) + "\n")
        except json.JSONDecodeError:
            # Ignorar líneas que no sean JSON válidos
            continue
        
        # Incrementar el contador de líneas procesadas
        processed_lines += 1

# Reemplazar el archivo original con el archivo temporal
os.replace(temp_file_path, file_path)

# Calcular el tiempo total transcurrido
end_time = time.time()
elapsed_time = end_time - start_time

# Mostrar resultados
print(f"Se han eliminado los datos que no cumplen la condición.")
print(f"Tiempo total: {elapsed_time:.2f} segundos.")
print(f"Líneas procesadas: {processed_lines}/{total_lines}")
