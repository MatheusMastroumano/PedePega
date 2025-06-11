export default function Footer() {
    return (
        <>
            <footer id="footer" className="bg-gray-800 text-white pt-12 pb-6">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <h3 className="text-xl font-bold mb-4">Pede<span className="text-yellow-600">&amp;</span>Pega</h3>
                            <p className="text-gray-500 text-[15px] mb-4">Evite filas e peça já. Seu lanche do seu jeito.</p>
                            <div className="flex space-x-4">

                            </div>
                        </div>

                        <div>
                            <h4 className="text-lg font-semibold mb-4">Links Rápidos</h4>
                            <ul className="space-y-2 text-[15px] flex flex-col">
                                <a href="#" className="no-underline font-medium text-gray-300 hover:text-gray-500 trasition-colors duration-300">Ola</a>
                                <a href="#" className="no-underline font-medium text-gray-300 hover:text-gray-500 trasition-colors duration-300">Ola</a>
                                <a href="#" className="no-underline font-medium text-gray-300 hover:text-gray-500 trasition-colors duration-300">Ola</a>
                                <a href="#" className="no-underline font-medium text-gray-300 hover:text-gray-500 trasition-colors duration-300">Ola</a>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-lg font-semibold mb-4">Ajuda &amp; Suporte</h4>
                            <ul className="space-y-2 text-[15px] flex flex-col">
                                <li>
                                    <a href="#" className="no-underline font-medium text-gray-300 hover:text-gray-500 trasition-colors duration-300">Ola</a>
                                </li>
                                <li>
                                    <a href="#" className="no-underline font-medium text-gray-300 hover:text-gray-500 trasition-colors duration-300">Ola</a>
                                </li>
                                <li>
                                    <a href="#" className="no-underline font-medium text-gray-300 hover:text-gray-500 trasition-colors duration-300">Ola</a>
                                </li>
                                <li>
                                    <a href="#" className="no-underline font-medium text-gray-300 hover:text-gray-500 trasition-colors duration-300">Ola</a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-lg font-semibold mb-4">Contato</h4>
                            <ul className="space-y-2 text-[15px] ">
                                <li className="flex items-center">
                                    <a href="#" className="no-underline font-medium text-gray-300 hover:text-gray-500 trasition-colors duration-300">Ola</a>
                                </li>
                                <li className="flex items-center">
                                    <a href="#" className="no-underline font-medium text-gray-300 hover:text-gray-500 trasition-colors duration-300">Ola</a>
                                </li>
                                <li className="flex items-center">
                                    <a href="#" className="no-underline font-medium text-gray-300 hover:text-gray-500 trasition-colors duration-300">Ola</a>
                                </li>
                                <li className="flex items-center">
                                    <a href="#" className="no-underline font-medium text-gray-300 hover:text-gray-500 trasition-colors duration-300">Ola</a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-700 pt-6">
                        <p className="text-center text-gray-400 text-[15px]">© 2025 Pede&amp;Pega. Todos os direitos reservados</p>
                    </div>
                </div>
            </footer>
        </>
    )
}