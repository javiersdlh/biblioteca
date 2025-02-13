"use client";

import { useState, useEffect, useCallback } from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface WorkItem {
  title: string;
  work_id: string;
  edition_id: string;
  user_position: string;
  books_count: string;
}

interface SeriesItem {
  id: string;
  title: string;
  description: string;
  series_works_count: string;
  works: WorkItem[];
}

const Series = () => {
  const [seriesItems, setSeriesItems] = useState<SeriesItem[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<SeriesItem | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const fetchSeriesItems = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSeriesItems([]); // Si no hay búsqueda, limpia las sugerencias
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/series?search=${query}`);
      if (!response.ok) {
        throw new Error("Error al buscar las series");
      }
      const data: SeriesItem[] = await response.json();
      setSeriesItems(data);
    } catch (error) {
      console.error("Error fetching series:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Usar debounce para limitar las solicitudes al servidor
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchSeriesItems(searchQuery);
    }, 300); // Esperar 300 ms después de que el usuario deje de escribir

    return () => clearTimeout(delayDebounceFn); // Limpiar el temporizador si cambia el query
  }, [searchQuery, fetchSeriesItems]);

  const handleSeriesClick = (series: SeriesItem) => {
    // Asegurarse de que works sea un array
    const parsedWorks = Array.isArray(series.works)
      ? series.works
      : JSON.parse(series.works);
    setSelectedSeries({ ...series, works: parsedWorks });
  };

  const handleAddToFavorites = async (id: number) => {
    try {
      // Obtener la lista de favoritos del usuario
      const response = await fetch('/api/user/obtain/todos');
      if (!response.ok) {
        throw new Error(`Error al obtener los datos del usuario: ${response.statusText}`);
      }
      const data = await response.json();

      // Verificar si la respuesta contiene un array
      if (Array.isArray(data.guardados)) {
        // Filtrar las series guardadas
        const filteredSeries = data.guardados.filter((item: any) => item.type === 'series');

        // Verificar si la serie ya está en la lista
        const existingSeries = filteredSeries.find((series: any) => String(series.id) === String(id));

        if (existingSeries) {
          // Si la serie ya está en la lista, mostrar un mensaje
          toast.info('Esta serie ya está guardada en tus favoritos', {
            position: 'top-right',
            autoClose: 3000,
          });
        } else {
          // Si la serie no está en la lista, intentar añadirla
          const insertResponse = await fetch('/api/user/insert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'series',  // Tipo de favorito
              favorite_id: id,  // ID de la serie
            }),
          });

          if (!insertResponse.ok) {
            throw new Error('Error al añadir la serie a favoritos');
          }

          toast.success('Serie añadida a favoritos', {
            position: 'top-right',
            autoClose: 3000, // Se cierra automáticamente después de 3 segundos
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
      console.error('Error al manejar la serie:', error);
      toast.error('Hubo un problema al añadir la serie a favoritos', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="mt-8 max-w-5xl mx-auto bg-white p-8 rounded-lg shadow-2xl">
      {/* Barra de búsqueda */}
      <div className="mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar series por nombre"
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white text-gray-700"
        />
      </div>

      {/* Lista de sugerencias */}
      {selectedSeries ? (
        <div>
          <button
            onClick={() => setSelectedSeries(null)}
            className="mb-6 text-blue-500 hover:text-blue-700 transition duration-300 text-lg font-semibold"
          >
            ← Volver a la lista
          </button>
          <h2 className="text-3xl font-extrabold mb-4 text-gray-800">{selectedSeries.title}</h2>
          <p className="text-lg text-gray-700 mb-6">{selectedSeries.description}</p>
          <ToastContainer />
          <button
            onClick={() => handleAddToFavorites(Number(selectedSeries.id))}
            className="w-full py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition duration-300 shadow-md"
          >
            Añadir a Favoritos
          </button>
          <h3 className="text-2xl font-semibold mt-8 mb-4 text-gray-800">Libros en la serie:</h3>
          {Array.isArray(selectedSeries.works) && selectedSeries.works.length > 0 ? (
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedSeries.works.map((work) => (
                <article
                  key={work.work_id}
                  className="p-6 bg-white rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition duration-300"
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{work.title}</h3>
                  <p className="text-gray-600">Posición en la serie: {work.user_position}</p>
                  <p className="text-gray-600">Cantidad de ediciones: {work.books_count}</p>
                </article>
              ))}
            </section>
          ) : (
            <p className="text-center text-gray-500 mt-4">No se encontraron libros para esta serie.</p>
          )}
        </div>
      ) : (
        <div className="overflow-y-auto">
          {loading ? (
            <p className="text-center text-blue-600 text-xl font-semibold">Cargando sugerencias...</p>
          ) : seriesItems.length > 0 ? (
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {seriesItems.map((series) => (
                <article
                  key={series.id}
                  onClick={() => handleSeriesClick(series)}
                  className="p-6 bg-white rounded-lg shadow-lg border border-gray-200 hover:shadow-xl cursor-pointer transition duration-300"
                >
                  <h2 className="text-2xl font-semibold text-gray-800 mb-3">{series.title}</h2>
                  <p className="text-gray-600">{series.description}</p>
                </article>
              ))}
            </section>
          ) : searchQuery.trim() ? (
            <p className="text-center text-gray-500 mt-4">No se encontraron series.</p>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default Series;
