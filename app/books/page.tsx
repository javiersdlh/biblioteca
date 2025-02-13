'use client';

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Range } from "react-range";
import Image from "next/image";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Book {
  title: string;
  author_name: string;
  work_id: string;
  average_rating: number;
  ratings_count: number;
  num_pages: number;
  image_url: string;
}

interface RatingProps {
  value: number;
  onChange: (value: number) => void;
}

const Rating: React.FC<RatingProps> = ({ value, onChange }) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const starRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    starRefs.current = starRefs.current.slice(0, 5);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLSpanElement>, i: number) => {
    const starWidth = starRefs.current[i]?.offsetWidth || 0;
    const clickPosition = e.nativeEvent.offsetX;
    const newValue = i + (clickPosition > starWidth / 2 ? 1 : 0.5);
    onChange(newValue);
  };

  const handleMouseEnter = (i: number, clickPosition: number) => {
    const starWidth = starRefs.current[i]?.offsetWidth || 0;
    const newHoverValue = i + (clickPosition > starWidth / 2 ? 1 : 0.5);
    setHoverValue(newHoverValue);
  };

  const handleMouseLeave = () => {
    setHoverValue(null);
  };

  const stars = [];
  for (let i = 0; i < 5; i++) {
    const starValue = i + 1;
    const isFullStar = starValue <= Math.floor(value);
    const isHalfStar = starValue <= Math.ceil(value) && value % 1 !== 0 && starValue > Math.floor(value);

    stars.push(
      <span
        key={i}
        className="cursor-pointer"
        onClick={(e) => handleClick(e, i)}
        onMouseEnter={(e) => handleMouseEnter(i, e.nativeEvent.offsetX)}
        onMouseLeave={handleMouseLeave}
        ref={(el) => { starRefs.current[i] = el }}
        style={{
          color: hoverValue !== null
            ? (starValue <= Math.floor(hoverValue) ? 'gold' :
              (starValue <= hoverValue ? 'gold' : 'gray'))
            : (starValue <= Math.floor(value) ? 'gold' : 'gray'),
          fontSize: '2rem',  // Aumentar el tamaño de las estrellas
        }}
      >
        {hoverValue !== null && i + 1 <= hoverValue
          ? (hoverValue - i >= 1 ? '★' : '½')
          : (isFullStar ? '★' : isHalfStar ? '½' : '☆')}
      </span>
    );
  }

  return (
    <div className="inline-flex">
      {stars}
    </div>
  );
};

const STEP_RATING_COUNT = 10000;
const STEP_AVERAGE_RATING = 0.1;
const STEP_NUM_PAGES = 10;
const MIN_RATING_COUNT = 0;
const MAX_RATING_COUNT = 7431094;
const MIN_AVERAGE_RATING = 0;
const MAX_AVERAGE_RATING = 5;
const MIN_NUM_PAGES = 0;
const MAX_NUM_PAGES = 13000;

const BooksList = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [offset, setOffset] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const [activeFilters, setActiveFilters] = useState({
    ratingCountRange: [MIN_RATING_COUNT, MAX_RATING_COUNT],
    averageRatingRange: [MIN_AVERAGE_RATING, MAX_AVERAGE_RATING],
    numPagesRange: [MIN_NUM_PAGES, MAX_NUM_PAGES],
    sortBy: "averageRating" as "averageRating" | "ratingsCount" | "numPages",
    order: "desc" as "asc" | "desc",
  });

  const [ratingCountRange, setRatingCountRange] = useState<number[]>([
    MIN_RATING_COUNT,
    MAX_RATING_COUNT,
  ]);
  const [averageRatingRange, setAverageRatingRange] = useState<number[]>([
    MIN_AVERAGE_RATING,
    MAX_AVERAGE_RATING,
  ]);
  const [numPagesRange, setNumPagesRange] = useState<number[]>([
    MIN_NUM_PAGES,
    MAX_NUM_PAGES,
  ]);
  const [sortBy, setSortBy] = useState<"averageRating" | "ratingsCount" | "numPages">("averageRating");
  const [order, setOrder] = useState<"asc" | "desc">("desc");

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [suggestions, setSuggestions] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const [userRatings, setUserRatings] = useState<{ id: string; rating: number }[]>([]);

  const fetchBooks = useCallback(async () => {
    setLoading(true);

    const { ratingCountRange, averageRatingRange, numPagesRange, sortBy, order } = activeFilters;

    try {
      const response = await fetch(
        `/api/books?offset=${offset}&minRatingCount=${ratingCountRange[0]}&maxRatingCount=${ratingCountRange[1]}&minAverageRating=${averageRatingRange[0]}&maxAverageRating=${averageRatingRange[1]}&minPages=${numPagesRange[0]}&maxPages=${numPagesRange[1]}&sortBy=${sortBy}&order=${order}`
      );

      if (!response.ok) {
        throw new Error(`Error en la API: ${response.statusText}`);
      }

      const data = await response.json();
      const filteredBooks = data.map((book: any) => ({
        title: book.title,
        author_name: book.author_name,
        work_id: book.work_id,
        average_rating: book.average_rating,
        ratings_count: book.ratings_count,
        num_pages: book.num_pages,
        image_url: book.image_url,
      }));

      setBooks((prevBooks) => (offset === 0 ? filteredBooks : [...prevBooks, ...filteredBooks]));
      setHasMore(data.length === 25);
    } catch (error) {
      console.error("Error al obtener los libros:", error);
    } finally {
      setLoading(false);
    }
  }, [offset, activeFilters]);

  useEffect(() => {
    const fetchUserRatings = async () => {
      try {
        const response = await fetch('/api/user/obtain/todos');
        if (!response.ok) {
          throw new Error(`Error al obtener los datos del usuario: ${response.statusText}`);
        }
        const data = await response.json();

        if (Array.isArray(data.guardados)) {
          const filteredBooks = data.guardados.filter((item: any) => item.type === 'book');
          const ratings = filteredBooks.map((rating: any) => ({
            id: rating.id,
            rating: rating.puntuacion,
          }));
          setUserRatings(ratings);
        }
      } catch (error) {
        console.error('Error al obtener las puntuaciones del usuario:', error);
      }
    };

    fetchUserRatings();
  }, []);

  const handleSearch = () => {
    setActiveFilters({
      ratingCountRange,
      averageRatingRange,
      numPagesRange,
      sortBy,
      order,
    });
    setOffset(0);
    setBooks([]);
    setHasMore(true);
    setHasSearched(true);
    setSelectedBook(null);
  };

  const handleSearchQueryChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);

    if (query.length > 2) {
      try {
        const response = await fetch(`/api/books/${query}`);
        const data = await response.json();
        setSuggestions(data);
      } catch (error) {
        console.error("Error al obtener las sugerencias:", error);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (book: Book) => {
    setSelectedBook(book);
    setSearchQuery(book.title);
    setSuggestions([]);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setOffset((prevOffset) => prevOffset + 25);
    }
  };

  useEffect(() => {
    if (hasSearched) {
      fetchBooks();
    }
  }, [offset, hasSearched, fetchBooks]);

  useEffect(() => {
    if (selectedBook) {
      setBooks([selectedBook]);
    }
  }, [selectedBook]);

  const handleRatingChange = async (newRating: number, bookId: string, type: string) => {
    try {
      const response = await fetch('/api/user/obtain/todos');
      if (!response.ok) {
        throw new Error(`Error al obtener los datos del usuario: ${response.statusText}`);
      }
      const data = await response.json();

      if (Array.isArray(data.guardados)) {
        const filteredBooks = data.guardados.filter((item: any) => item.type === 'book');
        const existingRating = filteredBooks.find((rating: any) => rating.id === bookId);

        const endpoint = existingRating ? '/api/user/update' : '/api/user/insert';

        const payload = {
          favorite_id: bookId,
          type,
          puntuacionValue: newRating,
        };

        const updateResponse = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!updateResponse.ok) {
          throw new Error(`Error al ${existingRating ? 'actualizar' : 'insertar'} la puntuación`);
        }

        toast.success(
          `Puntuación ${existingRating ? 'actualizada' : 'añadida'} correctamente`,
          { position: 'top-right', autoClose: 3000 }
        );

        // Actualizar el estado de las calificaciones en el frontend
        setUserRatings((prevRatings) =>
          existingRating
            ? prevRatings.map((rating) =>
              rating.id === bookId ? { ...rating, rating: newRating } : rating
            )
            : [...prevRatings, { id: bookId, rating: newRating }]
        );
      } else {
        console.error('La respuesta de la API no contiene un array de guardados:', data);
        toast.error('Hubo un problema con los datos obtenidos de la API', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error('Error al manejar la puntuación:', error);
      toast.error('Hubo un problema al manejar la puntuación', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-lg mt-8 mb-4">
      {/* Filtros */}
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-semibold mb-8 text-center text-gray-800">Filtrar Libros</h1>
        <div className="space-y-8">
          {/* Búsqueda por nombre de libro */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Buscar por nombre:</label>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchQueryChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white text-gray-700 placeholder-gray-400"
              placeholder="Escribe el nombre del libro"
            />
            {suggestions.length > 0 && (
              <div className="mt-2 bg-white border border-gray-300 rounded-md shadow-md">
                {suggestions.map((book, index) => (
                  <div
                    key={index}
                    className="p-2 hover:bg-gray-100 cursor-pointer text-gray-700"
                    onClick={() => handleSuggestionClick(book)}
                  >
                    {book.title}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rango de Ratings */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Número de puntuaciones:</label>
            <Range
              step={STEP_RATING_COUNT}
              min={MIN_RATING_COUNT}
              max={MAX_RATING_COUNT}
              values={ratingCountRange}
              onChange={(values) => setRatingCountRange(values)}
              renderTrack={({ props, children }) => (
                <div {...props} className="h-2 bg-gray-300 rounded-full my-4">{children}</div>
              )}
              renderThumb={({ props }) => {
                const { key, ...restProps } = props; // Extraer la propiedad key
                return <div {...restProps} key={key} className="h-6 w-6 bg-blue-500 rounded-full" />;
              }}
            />
            <div className="text-sm text-gray-600">
              Min: {ratingCountRange[0]}, Max: {ratingCountRange[1]}
            </div>
          </div>

          {/* Rango de Ratings Promedio */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Puntuación media:</label>
            <Range
              step={STEP_AVERAGE_RATING}
              min={MIN_AVERAGE_RATING}
              max={MAX_AVERAGE_RATING}
              values={averageRatingRange}
              onChange={(values) => setAverageRatingRange(values)}
              renderTrack={({ props, children }) => (
                <div {...props} className="h-2 bg-gray-300 rounded-full my-4">{children}</div>
              )}
              renderThumb={({ props }) => {
                const { key, ...restProps } = props; // Extraer la propiedad key
                return <div {...restProps} key={key} className="h-6 w-6 bg-blue-500 rounded-full" />;
              }}
            />
            <div className="text-sm text-gray-600">
              Min: {averageRatingRange[0].toFixed(1)}, Max: {averageRatingRange[1].toFixed(1)}
            </div>
          </div>

          {/* Rango de Número de Páginas */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Número de Páginas:</label>
            <Range
              step={STEP_NUM_PAGES}
              min={MIN_NUM_PAGES}
              max={MAX_NUM_PAGES}
              values={numPagesRange}
              onChange={(values) => setNumPagesRange(values)}
              renderTrack={({ props, children }) => (
                <div {...props} className="h-2 bg-gray-300 rounded-full my-4">{children}</div>
              )}
              renderThumb={({ props }) => {
                const { key, ...restProps } = props; // Extraer la propiedad key
                return <div {...restProps} key={key} className="h-6 w-6 bg-blue-500 rounded-full" />;
              }}
            />
            <div className="text-sm text-gray-600">
              Min: {numPagesRange[0]}, Max: {numPagesRange[1]}
            </div>
          </div>

          {/* Ordenar por */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Ordenar por:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "averageRating" | "ratingsCount" | "numPages")}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white text-gray-700"
            >
              <option value="averageRating" className="text-gray-700">Rating</option>
              <option value="ratingsCount" className="text-gray-700">Número de Ratings</option>
              <option value="numPages" className="text-gray-700">Número de Páginas</option>
            </select>
          </div>

          {/* Orden */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Ordenar:</label>
            <select
              value={order}
              onChange={(e) => setOrder(e.target.value as "asc" | "desc")}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white text-gray-700"
            >
              <option value="desc" className="text-gray-700">Descendente</option>
              <option value="asc" className="text-gray-700">Ascendente</option>
            </select>
          </div>


          <button
            onClick={handleSearch}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Buscar
          </button>
        </div>
      </div>

      {/* Resultados */}
      {(hasSearched || selectedBook) && (
        <div className="mt-8 p-6 bg-white rounded-lg shadow-lg mx-auto max-w-7xl overflow-y-auto">
          <ToastContainer />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {books.map((book, index) => {
              const userRating = userRatings.find((rating) => rating.id === book.work_id)?.rating || 0;

              return (
                <div
                  key={`${book.work_id}-${index}`}
                  className="p-4 bg-white shadow-lg rounded-2xl hover:shadow-2xl transition-shadow duration-300 flex flex-col items-center"
                >
                  {/* Image */}
                  <div className="w-[150px] h-[225px] mb-4">
                    <Image
                      src={book.image_url || "/default-image.png"}
                      alt={book.title}
                      width={150}
                      height={225}
                      className="rounded-lg object-cover w-full h-full"
                    />
                  </div>
                  {/* Title */}
                  <h3
                    className="text-lg font-semibold text-gray-800 text-center line-clamp-2 w-full h-[60px] mb-2 overflow-hidden"
                    title={book.title}
                  >
                    {book.title}
                  </h3>

                  {/* Ratings Info */}
                  <div className="mt-2 text-center flex flex-col items-center flex-grow">
                    <p className="text-sm text-gray-600">
                      Average Rating: <span className="font-bold">{book.average_rating}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Ratings Count: <span className="font-bold">{book.ratings_count}</span>
                    </p>
                  </div>
                  {/* User Rating */}
                  <div className="mt-4 flex justify-center w-full">
                    <Rating
                      value={userRating}
                      onChange={(newRating) => handleRatingChange(newRating, book.work_id, 'book')}
                    />
                  </div>
                </div>
              );
            })}
          </div>


          {hasMore && !loading && !selectedBook && (
            <button
              onClick={handleLoadMore}
              className="mt-8 w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Cargar más
            </button>
          )}
          {loading && <p className="text-center mt-4">Cargando...</p>}
        </div>
      )}
    </div>
  );
};

export default BooksList;
