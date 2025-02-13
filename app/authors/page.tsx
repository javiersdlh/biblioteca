"use client";
import { useEffect, useState } from "react";
import { Range } from "react-range";
import Image from "next/image";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Author {
  id: string;
  name: string;
  image_url: string;
  fans_count: number;
  average_rating: number;
  ratings_count: number;
}

const STEP_RATING_COUNT = 10000;
const STEP_AVERAGE_RATING = 0.1;
const MIN_RATING_COUNT = 0;
const MAX_RATING_COUNT = 27003752;
const MIN_AVERAGE_RATING = 0;
const MAX_AVERAGE_RATING = 5;

const AuthorsList = () => {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [offset, setOffset] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);

  const [ratingCountRange, setRatingCountRange] = useState<number[]>([
    MIN_RATING_COUNT,
    MAX_RATING_COUNT,
  ]);
  const [averageRatingRange, setAverageRatingRange] = useState<number[]>([
    MIN_AVERAGE_RATING,
    MAX_AVERAGE_RATING,
  ]);

  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<string>("asc");
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [suggestions, setSuggestions] = useState<Author[]>([]);

  const fetchAuthors = async (reset: boolean = false) => {
    if (loading || (!reset && !hasMore)) return;
    setLoading(true);

    const response = await fetch(
      `/api/authors?offset=${reset ? 0 : offset}&minRatingCount=${ratingCountRange[0]}&maxRatingCount=${ratingCountRange[1]}&minAverageRating=${averageRatingRange[0]}&maxAverageRating=${averageRatingRange[1]}&sortBy=${sortBy}&sortOrder=${sortOrder}`
    );

    if (!response.ok) {
      console.error("Error en la API:", response.statusText);
      setLoading(false);
      return;
    }

    const data = await response.json();
    console.log("Respuesta de la API:", data);

    if (reset) {
      setAuthors(data);
      setOffset(25);
      setHasMore(data.length === 25);
    } else {
      setAuthors((prevAuthors) => {
        const newAuthors = data.filter(
          (author: Author) => !prevAuthors.some((prev) => prev.id === author.id)
        );
        return [...prevAuthors, ...newAuthors];
      });
      setOffset((prevOffset) => prevOffset + 25);
      setHasMore(data.length === 25);
    }

    setLoading(false);
  };

  const handleSearch = () => {
    setHasSearched(true);
    fetchAuthors(true);
  };

  const loadMoreAuthors = () => {
    fetchAuthors();
  };

  const handleSuggestionClick = (author: Author) => {
    setSelectedAuthor(author);
    setSearchQuery(author.name);
    setSuggestions([]);  // Limpiar las sugerencias después de seleccionar una
  };

  useEffect(() => {
    if (selectedAuthor) {
      setAuthors([selectedAuthor]); // Mostrar solo el autor seleccionado
    }
  }, [selectedAuthor]);

  const handleSearchQueryChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);

    if (query.length > 0.5) {
      try {
        const response = await fetch(`/api/authors/${query}`);
        const data = await response.json();
        setSuggestions(data);
      } catch (error) {
        console.error("Error al obtener las sugerencias:", error);
      }
    } else {
      setSuggestions([]);
    }
  };

  const [userRatings, setUserRatings] = useState<{ id: string; rating: number }[]>([]);

  useEffect(() => {
    const fetchUserRatings = async () => {
      try {
        const response = await fetch('/api/user/obtain/todos');
        if (!response.ok) {
          throw new Error(`Error al obtener los datos del usuario: ${response.statusText}`);
        }
        const data = await response.json();

        if (Array.isArray(data.guardados)) {
          // Filtrar los autores guardados
          const filteredAuthors = data.guardados.filter((item: any) => item.type === 'author');
          setUserRatings(filteredAuthors);  // Guardar solo los autores
        }
      } catch (error) {
        console.error('Error al obtener los datos del usuario:', error);
      }
    };

    fetchUserRatings();
  }, []);

  const handleAddToFavorites = async (authorId: string, type: string) => {
    try {
      const response = await fetch('/api/user/obtain/todos');
      if (!response.ok) {
        throw new Error(`Error al obtener los datos del usuario: ${response.statusText}`);
      }
      const data = await response.json();

      // Verificar si la respuesta contiene un array de guardados
      if (Array.isArray(data.guardados)) {
        // Filtrar los autores guardados
        const filteredAuthors = data.guardados.filter((item: any) => item.type === 'author');

        // Verificar si el autor ya está en la lista
        const existingAuthor = filteredAuthors.find((author: any) => String(author.id) === String(authorId));

        console.log('Autores guardados:', filteredAuthors);
        console.log('Autor existente:', existingAuthor);

        if (existingAuthor) {
          // Si el autor ya está en la lista, mostrar un mensaje de éxito
          toast.info('Este autor ya está guardado', {
            position: 'top-right',
            autoClose: 3000,
          });
        } else {
          // Si el autor no está en la lista, insertar el nuevo autor
          const payload = {
            favorite_id: authorId,
            type,
          };

          const insertResponse = await fetch('/api/user/insert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          if (!insertResponse.ok) {
            throw new Error('Error al insertar el autor');
          }

          toast.success('Autor añadido correctamente', {
            position: 'top-right',
            autoClose: 3000,
          });
        }
      } else {
        console.error('La respuesta de la API no contiene un array de guardados:', data);
        toast.error('Hubo un problema con los datos obtenidos de la API', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error('Error al manejar el autor:', error);
      toast.error('Hubo un problema al manejar el autor', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-lg mt-8 mb-4">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-semibold mb-8 text-center text-gray-800">Filtrar Autores</h1>
        <div className="space-y-6">
          {/* Búsqueda por nombre de autor */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Buscar por nombre:</label>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchQueryChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white text-gray-700 placeholder-gray-400"
              placeholder="Escribe el nombre aquí."
            />
            {suggestions.length > 0 && (
              <div className="mt-2 bg-white border border-gray-300 rounded-md shadow-md">
                {suggestions.map((author, index) => (
                  <div
                    key={index}
                    className="p-2 hover:bg-gray-100 cursor-pointer text-gray-700"
                    onClick={() => handleSuggestionClick(author)}
                  >
                    {author.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rating Count Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Número de puntuaciones:</label>
            <Range
              step={STEP_RATING_COUNT}
              min={MIN_RATING_COUNT}
              max={MAX_RATING_COUNT}
              values={ratingCountRange}
              onChange={(values) => setRatingCountRange(values)}
              renderTrack={({ props, children }) => (
                <div {...props} className="h-2 bg-gray-300 rounded-full my-4">
                  {children}
                </div>
              )}
              renderThumb={({ props }) => {
                const { key, ...restProps } = props; // Extraer key
                return (
                  <div
                    key={key} // Pasar key
                    {...restProps}
                    className={`h-6 w-6 bg-blue-500 rounded-full`}
                  />
                );
              }}
            />
            <div className="text-sm text-gray-600">
              Min: {ratingCountRange[0]}, Max: {ratingCountRange[1]}
            </div>
          </div>

          {/* Average Rating Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Puntuación media:</label>
            <Range
              step={STEP_AVERAGE_RATING}
              min={MIN_AVERAGE_RATING}
              max={MAX_AVERAGE_RATING}
              values={averageRatingRange}
              onChange={(values) => setAverageRatingRange(values)}
              renderTrack={({ props, children }) => (
                <div {...props} className="h-2 bg-gray-300 rounded-full my-2">
                  {children}
                </div>
              )}
              renderThumb={({ props }) => {
                const { key, ...restProps } = props; // Extraer key
                return (
                  <div
                    key={key} // Pasar key
                    {...restProps}
                    className={`h-6 w-6 bg-blue-500 rounded-full`}
                  />
                );
              }}
            />
            <div className="text-sm text-gray-600">
              Min: {averageRatingRange[0].toFixed(1)}, Max: {averageRatingRange[1].toFixed(1)}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Ordenar por:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white text-gray-700"
              >
                <option value="name">Nombre</option>
                <option value="fans_count">Número de fans</option>
                <option value="ratings_count">Número de puntuaciones</option>
                <option value="average_rating">Puntuación media</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Orden:</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white text-gray-700"
              >
                <option value="asc">Ascendente</option>
                <option value="desc">Descendente</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSearch}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Buscar
          </button>
        </div>
      </div>

      {(hasSearched || selectedAuthor) && (
        <div className="mt-6 bg-white rounded-lg shadow-lg mx-auto max-w-7xl p-6">
          <ToastContainer />
          <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {authors.map((author) => (
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

                {/* Botón de favoritos */}
                <button
                  onClick={() => handleAddToFavorites(author.id, 'author')}
                  className="w-full py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition duration-300 mt-2"
                >
                  Añadir a Favoritos
                </button>
              </article>
            ))}
          </section>

          {loading && <p className="text-center text-gray-500">Cargando más autores...</p>}
          {!loading && hasMore && !selectedAuthor && (
            <button
              onClick={loadMoreAuthors}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 mt-6"
            >
              Cargar más
            </button>
          )}
        </div>
      )}
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

export default AuthorsList;
