## Pasos para usar la app

- Descargar e instalar python y node en el pc.

- Descargar los archivos en https://www.kaggle.com/datasets/opalskies/large-books-metadata-dataset-50-mill-entries/data

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

- Ahora en la línea de comandos dentro del proyecto se ejecutan los siguientes comandos:

    * npm install

- Ahora se puede ejecutar en la línea de comandos dentro del proyecto: npm run dev y aparecerá la url para usar la app.
