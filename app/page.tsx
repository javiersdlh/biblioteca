"use client";

import Link from "next/link";

const HomePage = () => {
  return (
    <div className="h-full bg-gray-100 flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">
        Bienvenido a la Biblioteca Virtual
      </h1>
      <p className="text-xl text-gray-600 mb-10">
        Explora libros, autores, listas y series.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-4xl">
        <Link href="/books">
          <div className="bg-blue-500 text-white text-center py-4 px-6 rounded-lg shadow-lg transform transition duration-300 hover:scale-105">
            <h2 className="text-2xl font-semibold">Libros</h2>
            <p className="mt-2">Explora la colección de libros.</p>
          </div>
        </Link>
        <Link href="/authors">
          <div className="bg-green-500 text-white text-center py-4 px-6 rounded-lg shadow-lg transform transition duration-300 hover:scale-105">
            <h2 className="text-2xl font-semibold">Autores</h2>
            <p className="mt-2">Conoce a los autores más destacados.</p>
          </div>
        </Link>
        <Link href="/lists">
          <div className="bg-yellow-500 text-white text-center py-4 px-6 rounded-lg shadow-lg transform transition duration-300 hover:scale-105">
            <h2 className="text-2xl font-semibold">Listas</h2>
            <p className="mt-2">Descubre listas de la comunidad.</p>
          </div>
        </Link>
        <Link href="/series">
          <div className="bg-purple-500 text-white text-center py-4 px-6 rounded-lg shadow-lg transform transition duration-300 hover:scale-105">
            <h2 className="text-2xl font-semibold">Series</h2>
            <p className="mt-2">Explora las series de libros.</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
