# Ruta del archivo original
file_path = "books.json"
# Ruta del archivo limpio
clean_file_path = "books.json"

# Caracteres de terminación de línea inusuales
unusual_terminators = ["\u2028", "\u2029"]  # LS y PS

# Leer el archivo original y escribirlo limpio
with open(file_path, "r", encoding="utf-8") as infile, open(clean_file_path, "w", encoding="utf-8") as outfile:
    for line in infile:
        # Reemplazar terminadores inusuales por líneas estándar
        for terminator in unusual_terminators:
            line = line.replace(terminator, "\n")
        outfile.write(line)

print(f"Archivo limpio creado: {clean_file_path}")
