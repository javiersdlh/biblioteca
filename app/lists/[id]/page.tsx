'use client';

import { useRouter } from 'next/navigation'; // Importa useRouter
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface CreatedBy {
    name: string;
    id: string;
}

interface Book {
    title: string;
    author: string;
    position: {
        ranking: number;
        score: number;
        votes: number;
    };
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
    created_by: CreatedBy;
    num_comments: number;
    books: Book[];
}

const ListPage = () => {
    const { id } = useParams(); // Obtener el ID
    const [List, setList] = useState<List | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter(); // Inicializar el router

    // Función para volver atrás y mantener los filtros
    const handleGoBack = () => {
        router.back(); // Vuelve a la página anterior
    };

    useEffect(() => {
        const fetchList = async () => {
            if (!id) {
                setError('No se proporcionó un ID válido.');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`/api/lists/${id}`);
                if (!response.ok) {
                    throw new Error('Error al cargar los detalles de la lista.');
                }

                const data: List = await response.json();
                setList(data);
            } catch (err) {
                console.error(err);
                setError('Error al cargar los datos de la lista.');
            } finally {
                setLoading(false);
            }
        };

        fetchList();
    }, [id]);

    const handleAddToFavorites = async (id: number) => {
        try {
            // Obtener los favoritos del usuario
            const response = await fetch('/api/user/obtain/todos');
            if (!response.ok) {
                throw new Error(`Error al obtener los datos del usuario: ${response.statusText}`);
            }

            const data = await response.json();

            // Verificar si la respuesta contiene un array
            if (Array.isArray(data.guardados)) {
                // Filtrar los favoritos por tipo list
                const filteredLists = data.guardados.filter((item: any) => item.type === 'list');

                // Verificar si la lista ya está en los favoritos
                const existingList = filteredLists.find((list: any) => String(list.id) === String(id));

                if (existingList) {
                    // Si la lista ya está guardada, mostrar un mensaje
                    toast.info('Esta lista ya está en tus favoritos', {
                        position: 'top-right',
                        autoClose: 3000,
                    });
                    return; // Salir de la función para evitar la inserción
                }

                // Si la lista no está guardada, proceder con la inserción
                const insertResponse = await fetch('/api/user/insert', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'list', // Tipo de favorito
                        favorite_id: id, // ID del favorito
                    }),
                });

                if (!insertResponse.ok) {
                    throw new Error('Error al añadir a favoritos');
                }

                toast.success('Lista añadida a favoritos', {
                    position: 'top-right',
                    autoClose: 3000, // Se cierra automáticamente después de 3 segundos
                });
            } else {
                console.error('La respuesta de la API no contiene un array de guardados:', data);
                toast.error('Hubo un problema con los datos obtenidos de la API', {
                    position: 'top-right',
                    autoClose: 3000,
                });
            }
        } catch (error) {
            console.error('Error al manejar los favoritos:', error);
            toast.error('Hubo un problema al manejar los favoritos', {
                position: 'top-right',
                autoClose: 3000,
            });
        }
    };

    if (loading) {
        return <div className="text-center text-blue-600">Cargando detalles de la lista...</div>;
    }

    if (error) {
        return <div className="text-center text-red-600">Error: {error}</div>;
    }

    if (!List) {
        return <div className="text-center text-gray-600">No se encontraron detalles para esta lista.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
            {/* Botón de Volver Atrás */}
            <button
                onClick={handleGoBack}
                className="mt-4 mb-2 py-2 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg shadow-md transform transition-all hover:scale-105 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50"
            >
                ← Volver atrás
            </button>
            <h1 className="text-3xl font-semibold text-gray-800 mb-4">{List.title}</h1>
            <div className="text-lg text-gray-600 mb-6">
                <p>{List.description}</p>
            </div>

            <div className="mb-6">
                <p className="text-lg text-gray-700"><strong>Fecha de creación:</strong> {List.created_date}</p>
                <p className="text-lg text-gray-700"><strong>Número de libros:</strong> {List.num_books}</p>
                <p className="text-lg text-gray-700"><strong>Número de votantes:</strong> {List.num_voters}</p>
                <p className="text-lg text-gray-700"><strong>Número de likes:</strong> {List.num_likes}</p>

                <ToastContainer />
                <button
                    onClick={() => handleAddToFavorites(List.id)}
                    className="mt-4 w-full py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition duration-300"
                >
                    Añadir a Favoritos
                </button>
            </div>

            <div className="mb-6">
                <strong className="text-lg text-gray-700">Tags:</strong>
                <ul className="flex flex-wrap gap-2 mt-2">
                    {List.tags.map((tag, index) => (
                        <li key={index} className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm">{tag}</li>
                    ))}
                </ul>
            </div>

            <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Libros</h2>
                {List.books.length > 0 ? (
                    <section className="space-y-4">
                        {List.books.map((book, index) => (
                            <article key={index} className="p-4 bg-gray-100 rounded-lg shadow-sm">
                                <h3 className="text-xl font-medium text-gray-800">{book.title}</h3>
                                <p className="text-lg text-gray-600"><strong>Autor:</strong> {book.author}</p>
                                <p className="text-lg text-gray-600"><strong>Ranking:</strong> {book.position.ranking}</p>
                                <p className="text-lg text-gray-600"><strong>Puntaje:</strong> {book.position.score}</p>
                                <p className="text-lg text-gray-600"><strong>Votos:</strong> {book.position.votes}</p>
                            </article>
                        ))}
                    </section>
                ) : (
                    <p className="text-center text-gray-600">No hay libros en esta lista.</p>
                )}
            </div>
        </div>
    );
};

export default ListPage;
