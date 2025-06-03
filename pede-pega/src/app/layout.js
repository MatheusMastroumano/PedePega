
import "./globals.css";
import Footer from "./components/Footer/Footer.jsx";
import NavBar from "./components/NavBar/NavBar.jsx";
import { Poppins } from "next/font/google";
import { CartProvider } from "./components/Cart/contextoCart.js";
import { AuthProvider } from './components/AuthContexto/ContextoAuth.js';

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"], // ajuste conforme necessário
});

export const metadata = {
  title: "Pede&Pega",
  description: "O melhor site de lanches da sua escola!",
};


export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="../img/apple-touch-icon.png"></link>
        <link rel="icon" type="image/png" sizes="32x32" href="../img/favicon-32x32.png"></link>
        <link rel="icon" type="image/png" sizes="16x16" href="../img/favicon-16x16.png"></link>
      </head>
      <body className={poppins.className}>
        <div className="min-h-screen flex flex-col">
          <AuthProvider>
            <CartProvider>
              <NavBar />
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
            </CartProvider>
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
