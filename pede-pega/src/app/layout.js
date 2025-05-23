
import "./globals.css";
import Footer from "./components/Footer/Footer.jsx";
import NavBar from "./components/NavBar/NavBar.jsx";
import { Poppins } from "next/font/google";

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
    <html lang="en">
      <body className={poppins.className}>
        <div className="min-h-screen flex flex-col">
          <NavBar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
