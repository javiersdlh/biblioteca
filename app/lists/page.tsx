'use client';

import { useState } from "react";
import { useRouter } from "next/navigation"; // Importa useRouter
import { Range } from "react-range";

// Definir los tipos de datos
interface Book {
  book_id: string;
  title: string;
  author_id: string;
  author: string;
  position: {
    ranking: number;
    score: number;
    votes: number;
  };
}

interface ListItem {
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
  created_by: {
    name: string;
    id: string;
  };
  num_comments: number;
  books: Book[];
}

const Lists = () => {
  const [listItems, setListItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [offset, setOffset] = useState<number>(0); // Estado para el offset
  const [sortBy, setSortBy] = useState<string>('num_books'); // Estado para el orden
  const [sortOrder, setSortOrder] = useState<string>('asc'); // Estado para la dirección de orden

  // Filtros
  const [numVoters, setNumVoters] = useState<[number, number]>([0, 99382]);
  const [numBooks, setNumBooks] = useState<[number, number]>([0, 29066]);
  const [numLikes, setNumLikes] = useState<[number, number]>([0, 16830]);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const router = useRouter(); // Inicializa el router

  // Función para buscar
  const handleSearch = async () => {
    setLoading(true);
    setOffset(0);
    setHasMore(true); // Reinicia hasMore
    try {
      const query = new URLSearchParams({
        minVoters: numVoters[0].toString(),
        maxVoters: numVoters[1].toString(),
        minBooks: numBooks[0].toString(),
        maxBooks: numBooks[1].toString(),
        minLikes: numLikes[0].toString(),
        maxLikes: numLikes[1].toString(),
        offset: "0",
        sortBy: sortBy,
        sortOrder: sortOrder,
      });

      const response = await fetch(`/api/lists?${query.toString()}`);
      if (!response.ok) {
        throw new Error("Error al cargar los datos");
      }
      const data: ListItem[] = await response.json();
      setListItems(data);

      // Si la longitud inicial es menor que 25, no hay más datos
      if (data.length < 25) {
        setHasMore(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    const newOffset = offset + 30;
    setOffset(newOffset);
    setLoading(true);
    try {
      const query = new URLSearchParams({
        minVoters: numVoters[0].toString(),
        maxVoters: numVoters[1].toString(),
        minBooks: numBooks[0].toString(),
        maxBooks: numBooks[1].toString(),
        minLikes: numLikes[0].toString(),
        maxLikes: numLikes[1].toString(),
        offset: newOffset.toString(),
        sortBy: sortBy,
        sortOrder: sortOrder,
      });

      const response = await fetch(`/api/lists?${query.toString()}`);
      if (!response.ok) {
        throw new Error("Error al cargar los datos");
      }
      const data: ListItem[] = await response.json();

      // Si la longitud de los datos es menor que 25, no hay más datos
      if (data.length < 25) {
        setHasMore(false);
      }

      // Agregar los nuevos datos a la lista existente
      setListItems((prevItems) => [...prevItems, ...data]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar el clic en una lista y redirigir a la página
  const handleItemClick = (id: number) => {
    router.push(`/lists/${id}`); // Redirige a la página
  };

  return (
    <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-lg mt-8 mb-4">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-semibold mb-8 text-center text-gray-800">Filtrar Listas de Libros</h1>

        {/* Controles de filtros */}
        <div className="bg-white p-8 rounded-lg shadow-xl mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">Filtros de Búsqueda</h2>

          {/* Filtro de votantes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Número de votantes: {numVoters[0]} - {numVoters[1]}
            </label>
            <Range
              step={100}
              min={0}
              max={99382}
              values={numVoters}
              onChange={(values) => setNumVoters(values as [number, number])}
              renderTrack={({ props, children }) => (
                <div
                  {...props}
                  style={{
                    ...props.style,
                    height: "6px",
                    background: "#ddd",
                    borderRadius: "4px",
                  }}
                >
                  {children}
                </div>
              )}
              renderThumb={({ props }) => {
                const { key, ...restProps } = props; // Extraer key
                return (
                  <div
                    key={key} // Pasar key
                    {...restProps}
                    style={{
                      ...restProps.style,
                      height: "16px",
                      width: "16px",
                      backgroundColor: "#007bff",
                      borderRadius: "50%",
                    }}
                  />
                );
              }}
            />
          </div>

          {/* Filtro de libros */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Número de libros: {numBooks[0]} - {numBooks[1]}
            </label>
            <Range
              step={100}
              min={0}
              max={29066}
              values={numBooks}
              onChange={(values) => setNumBooks(values as [number, number])}
              renderTrack={({ props, children }) => (
                <div
                  {...props}
                  style={{
                    ...props.style,
                    height: "6px",
                    background: "#ddd",
                    borderRadius: "4px",
                  }}
                >
                  {children}
                </div>
              )}
              renderThumb={({ props }) => {
                const { key, ...restProps } = props; // Extraer key
                return (
                  <div
                    key={key} // Pasar key
                    {...restProps}
                    style={{
                      ...restProps.style,
                      height: "16px",
                      width: "16px",
                      backgroundColor: "#007bff",
                      borderRadius: "50%",
                    }}
                  />
                );
              }}
            />
          </div>

          {/* Filtro de me gusta */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Número de me gusta: {numLikes[0]} - {numLikes[1]}
            </label>
            <Range
              step={100}
              min={0}
              max={16830}
              values={numLikes}
              onChange={(values) => setNumLikes(values as [number, number])}
              renderTrack={({ props, children }) => (
                <div
                  {...props}
                  style={{
                    ...props.style,
                    height: "6px",
                    background: "#ddd",
                    borderRadius: "4px",
                  }}
                >
                  {children}
                </div>
              )}
              renderThumb={({ props }) => {
                const { key, ...restProps } = props; // Extraer key
                return (
                  <div
                    key={key} // Pasar key
                    {...restProps}
                    style={{
                      ...restProps.style,
                      height: "16px",
                      width: "16px",
                      backgroundColor: "#007bff",
                      borderRadius: "50%",
                    }}
                  />
                );
              }}
            />
          </div>

          {/* Selector de ordenación */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Ordenar por:
            </label>
            <select
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white text-gray-700"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="num_books">Número de libros</option>
              <option value="num_voters">Número de votantes</option>
              <option value="title">Título</option>
              <option value="num_likes">Número de me gusta</option>
            </select>
          </div>

          {/* Selector de dirección */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Dirección de orden:
            </label>
            <select
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white text-gray-700"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="asc">Ascendente</option>
              <option value="desc">Descendente</option>
            </select>
          </div>

          {/* Botón de buscar */}
          <button
            onClick={handleSearch}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-200"
          >
            Buscar
          </button>
        </div>
      </div>
      {/* Resultados filtrados */}
      <section className="space-y-8 mt-8">
        {listItems.map((item) => (
          <article
            key={item.id}
            className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition duration-300 cursor-pointer"
            onClick={() => handleItemClick(item.id)} // Maneja el clic
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">{item.title}</h2>
            <p className="text-gray-600">{item.description}</p>
            <div className="text-sm text-gray-500 mt-4">
              <p>
                <span className="font-semibold">Votantes:</span> {item.num_voters}
              </p>
              <p>
                <span className="font-semibold">Libros:</span> {item.num_books}
              </p>
              <p>
                <span className="font-semibold">Me gusta:</span> {item.num_likes}
              </p>
            </div>
          </article>
        ))}
      </section>

      {loading && (
        <p className="text-center text-blue-600 mt-6">Cargando elementos...</p>
      )}

      {/* Botón para cargar más elementos */}
      {listItems.length > 0 && hasMore && !loading && (
        <div className="text-center mt-6">
          <button
            onClick={loadMore}
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-200"
          >
            Cargar más
          </button>
        </div>
      )}
    </div>
  );
};

export default Lists;
