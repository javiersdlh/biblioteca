CREATE TABLE guardados (
    "type" VARCHAR(50),  -- Tipo de favorito
    id VARCHAR(50),  -- ID del favorito
    puntuacion DOUBLE,  -- Puntuación
    CONSTRAINT unique_favorite UNIQUE ("type", id)
);

/*
-- Tabla de libros favoritos
CREATE TABLE books (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255),
    author_name VARCHAR(255),
    author_id VARCHAR(50),
    work_id VARCHAR(50),
    isbn VARCHAR(20),
    isbn13 VARCHAR(20),
    asin VARCHAR(20),
    "language" VARCHAR(20),
    average_rating DECIMAL(3,2),
    rating_dist TEXT,
    ratings_count INT,
    text_reviews_count INT,
    publication_date DATE,
    original_publication_date DATE,
    format VARCHAR(50),
    edition_information VARCHAR(255),
    image_url VARCHAR(255),
    publisher VARCHAR(255),
    num_pages INT,
    series_id VARCHAR(50),
    series_name VARCHAR(255),
    series_position INT,
    "description" TEXT,
    shelves JSON,
    authors JSON
);

-- Tabla de autores favoritos
CREATE TABLE authors (
    id VARCHAR(50) PRIMARY KEY,
    "name" VARCHAR(255),
    gender VARCHAR(50),
    image_url VARCHAR(255),
    about TEXT,
    fans_count INT,
    ratings_count INT,
    average_rating DECIMAL(3,2),
    text_reviews_count INT,
    works_count INT,
    work_ids JSON,
    book_ids JSON
);

-- Tabla de series favoritas
CREATE TABLE series (
    id INT PRIMARY KEY,
    title VARCHAR(255),
    "description" TEXT,
    note TEXT,
    series_works_count INT,
    primary_work_count INT,
    numbered BOOLEAN,
    works JSON   -- Almacena los trabajos como un objeto JSON
);

-- Tabla de listas favoritas
CREATE TABLE list (
    id INT PRIMARY KEY,
    title VARCHAR(255),
    "description" TEXT,
    description_html TEXT,
    num_pages INT,
    num_books INT,
    num_voters INT,
    created_date DATE,
    num_likes INT,
    num_comments INT,
    created_by_name VARCHAR(255),
    created_by_id INT,
    tags TEXT,  -- Almacena las etiquetas como un string separado por comas
    books JSON   -- Almacena los libros como un objeto JSON
);
*/