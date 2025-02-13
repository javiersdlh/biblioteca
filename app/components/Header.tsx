import Link from "next/link";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-2xl z-50">
      <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="text-2xl font-bold tracking-wide">
          <Link href="/" className="text-white hover:text-gray-100 transition duration-300">
            Biblioteca
          </Link>
        </div>
        <nav>
          <ul className="flex space-x-8">
            <li>
              <Link href="/books" className="text-white hover:text-yellow-300 transition duration-300">
                Libros
              </Link>
            </li>
            <li>
              <Link href="/authors" className="text-white hover:text-yellow-300 transition duration-300">
                Autores
              </Link>
            </li>
            <li>
              <Link href="/lists" className="text-white hover:text-yellow-300 transition duration-300">
                Listas
              </Link>
            </li>
            <li>
              <Link href="/series" className="text-white hover:text-yellow-300 transition duration-300">
                Series
              </Link>
            </li>
            <li>
              <Link
                href="/user"
                className="bg-yellow-300 text-black font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-yellow-400 transition duration-300"
              >
                Mis datos
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
