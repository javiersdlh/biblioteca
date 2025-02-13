"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Definimos interfaces para cada tipo de dato
interface Author {
  id: string;
  name: string;
  image_url: string;
  fans_count: number;
  average_rating: number;
  ratings_count: number;
}

interface Book {
  id: string;
  title: string;
  author_name: string;
  work_id: string;
  average_rating: number;
  ratings_count: number;
  num_pages: number;
  image_url: string;
}

interface List {
  id: number;
  title: string;
  description: string;
  description_html: string;
  num_pages: number;
  num_books: number;
  num_voters: number;
  created_date: string;
  tags: string[];
  num_likes: number;
}

interface Series {
  id: string;
  title: string;
  description: string;
  series_works_count: string;
}

interface RatingProps {
  value: number;
  onChange: (value: number) => void;
}

const DataList = () => {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [lists, setLists] = useState<List[]>([]);
  const [series, setSeries] = useState<Series[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null); // Para controlar la categoría activa
  const [userRatings, setUserRatings] = useState<{ id: string; rating: number }[]>([]);
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
            fontSize: '2rem',  // Tamaño de las estrellas
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

  // Función para obtener los datos de la API
  const fetchData = async (category: string) => {
    setLoading(true);
    try {
      let response;
      switch (category) {
        case "authors":
          response = await fetch('/api/user/obtain/authors');
          break;
        case "books":
          response = await fetch('/api/user/obtain/books');
          break;
        case "lists":
          response = await fetch('/api/user/obtain/list');
          break;
        case "series":
          response = await fetch('/api/user/obtain/series');
          break;
        default:
          throw new Error("Categoría no válida");
      }

      if (!response.ok) {
        throw new Error("Error al obtener los datos");
      }

      const data = await response.json();

      switch (category) {
        case "authors":
          setAuthors(data.authors || []);
          break;
        case "books":
          setBooks(data.books || []);
          break;
        case "lists":
          setLists(data.lists || []);
          break;
        case "series":
          setSeries(data.series || []);
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar un elemento
  const deleteItem = async (type: string, id: string) => {
    try {
      const response = await fetch(`/api/user/delete/${type}?id_${type}=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || "Error al eliminar el elemento");
      }

      toast.success("Elemento eliminado correctamente", {
        position: "top-right",
        autoClose: 3000,
      });

      // Si la eliminación es exitosa, recargamos los datos
      fetchData(type);
    } catch (err) {
      console.error("Error al eliminar el elemento:", err);
      toast.error("Error al eliminar el elemento", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

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

  return (
    <div className="mt-8 mb-8 max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-xl">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-xl">
        <ToastContainer />
        <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-lg shadow-lg">
          📚 Datos de Autores, Libros, Listas y Series ✨
        </h1>

        {activeCategory === null ? (
          // Mostrar botones
          <div className="text-center space-y-4">
            <button
              onClick={() => { setActiveCategory("authors"); fetchData("authors"); }}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-full shadow-lg hover:scale-105 transform transition duration-300"
            >
              Ver Autores
            </button>
            <button
              onClick={() => { setActiveCategory("books"); fetchData("books"); }}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-full shadow-lg hover:scale-105 transform transition duration-300"
            >
              Ver Libros
            </button>
            <button
              onClick={() => { setActiveCategory("lists"); fetchData("lists"); }}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-full shadow-lg hover:scale-105 transform transition duration-300"
            >
              Ver Listas
            </button>
            <button
              onClick={() => { setActiveCategory("series"); fetchData("series"); }}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-full shadow-lg hover:scale-105 transform transition duration-300"
            >
              Ver Series
            </button>
          </div>
        ) : (
          // Mostrar los datos de la categoría activa
          <>
            {loading ? (
              <div className="text-center text-gray-500 text-lg">Cargando datos...</div>
            ) : error ? (
              <div className="text-center text-red-500 text-lg">{error}</div>
            ) : (
              <>
                <h2
                  className="text-3xl font-extrabold text-center text-white bg-gradient-to-r from-blue-500 to-indigo-600 py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                >
                  {activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}
                </h2>
                <button
                  onClick={() => setActiveCategory(null)}
                  className="bg-gray-600 text-white px-6 py-2 rounded-full mt-6 mx-auto block hover:bg-gray-700 transition duration-300"
                >
                  Volver a las opciones
                </button>
                <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 mt-6 px-4">
                  {activeCategory === "authors" && authors.length > 0 ? (
                    authors.map((author) => (
                      <article key={author.id} className="flex flex-col items-center bg-white p-6 rounded-lg shadow-lg hover:scale-105 transition-transform duration-300">
                        {/* Imagen del autor */}
                        <div className="w-[120px] h-[120px] mb-4 flex justify-center items-center">
                          <ImageWithFallback
                            src={author.image_url}
                            fallbackSrc="/images/placeholder.png"
                            alt={author.name}
                            width={120}
                            height={120}
                            className="rounded-full object-cover w-full h-full"
                          />
                        </div>

                        {/* Información del autor */}
                        <div className="flex flex-col items-center justify-between w-full flex-grow">
                          {/* Nombre del autor */}
                          <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center w-full">{author.name}</h3>

                          {/* Calificación promedio y número de ratings */}
                          <div className="flex flex-col items-center justify-between w-full mb-2">
                            <div className="flex justify-center items-center text-yellow-500 mb-1">
                              <span className="text-2xl font-extrabold">{author.average_rating}</span>
                              <span className="ml-1 text-sm font-medium">/ 5</span>
                            </div>

                            <div className="text-center text-sm text-gray-600">
                              <span className="font-medium">Ratings:</span>
                              <div className="text-lg font-semibold text-gray-800 mt-1">{author.ratings_count}</div>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => deleteItem("authors", author.id)}
                          className="bg-red-500 text-white px-4 py-2 rounded-full mt-4 hover:bg-red-600 transition duration-300"
                        >
                          Eliminar
                        </button>
                      </article>
                    ))
                  ) : activeCategory === "books" && books.length > 0 ? (
                    <article>
                      {
                        books.map((book, index) => {
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
                                title={book.title} // Tooltip
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
                              <button
                                onClick={() => deleteItem("books", book.work_id)}
                                className="bg-red-500 text-white px-4 py-2 rounded-full mt-4 hover:bg-red-600 transition duration-300"
                              >
                                Eliminar
                              </button>
                            </div>
                          );
                        })
                      }
                    </article>
                  ) : activeCategory === "lists" && lists.length > 0 ? (
                    lists.map((list) => (
                      <article
                        key={list.id}
                        className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition duration-300">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-2">{list.title}</h2>
                        <div className="text-sm text-gray-500 mt-4">
                          <p>
                            <span className="font-semibold">Votantes:</span> {list.num_voters}
                          </p>
                          <p>
                            <span className="font-semibold">Libros:</span> {list.num_books}
                          </p>
                          <p>
                            <span className="font-semibold">Me gusta:</span> {list.num_likes}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteItem("lists", list.id.toString())}
                          className="bg-red-500 text-white px-4 py-2 rounded-full mt-4 hover:bg-red-600 transition duration-300"
                        >
                          Eliminar
                        </button>
                      </article>
                    ))
                  ) : activeCategory === "series" && series.length > 0 ? (
                    series.map((serie) => (
                      <article
                        key={serie.id}
                        className="p-6 bg-white rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition duration-300"
                      >
                        <h2 className="text-2xl font-semibold text-gray-800 mb-3">{serie.title}</h2>
                        <button
                          onClick={() => deleteItem("series", serie.id)}
                          className="bg-red-500 text-white px-4 py-2 rounded-full mt-4 hover:bg-red-600 transition duration-300"
                        >
                          Eliminar
                        </button>
                      </article>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 p-4 rounded-lg bg-gray-100 shadow">
                      📭 No hay datos disponibles
                    </p>
                  )}
                </section>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

interface ImageWithFallbackProps {
  src: string;
  fallbackSrc: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  fallbackSrc,
  alt,
  width,
  height,
  className,
}) => {
  const [imgSrc, setImgSrc] = useState(src);

  const handleError = () => {
    setImgSrc(fallbackSrc);
  };

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      onError={handleError}
      unoptimized
      className={className}
    />
  );
};

export default DataList;