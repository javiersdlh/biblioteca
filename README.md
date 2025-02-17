## Pasos para usar la app

- Descargar e instalar python y node en el pc, estas son las URLs:
    
    * https://www.python.org/
    * https://nodejs.org/en

- Ahora en la línea de comandos dentro del proyecto se ejecuta el siguiente comando:

    * npm install

- Descargar los archivos en https://www.kaggle.com/datasets/opalskies/large-books-metadata-dataset-50-mill-entries/data

- AVISO: Aunque ponga que ocupan 90gb los archivos descomprimidos del dataset, al final la base de datos acaba ocupando 1,5gb aproximadamente después de filtrar todo y obtener solo los libros en español.

- Descomprimirlos y poner los 4 json en la carpeta scripts.

- Dentro de la carpeta scripts, se introducen los comandos por este orden:

    * python limpiar_libros.py
    * python load_books.py
    * python load_lists.py
    * python load_series.py
    * python load_authors.py
    * python execute_create_tables.py

- Mover el archivo biblioteca.duckdb a la carpeta lib.

- Se pueden eliminar ahora los json porque ya no se usan y ocupan mucho espacio.

- Ahora se puede ejecutar en la línea de comandos dentro del proyecto: npm run dev y aparecerá la url para usar la app.