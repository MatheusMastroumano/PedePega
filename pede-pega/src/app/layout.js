
import "./globals.css";
import Footer from "./components/Footer/Footer.jsx";
import Header from "./components/Header/Header.jsx";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"], // ajuste conforme necessário
});

export const metadata = {
  title: "Pede&Pega",
};


export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={poppins.className}>
        <Header />
        
        {children}

        <Footer />
      </body>
    </html>
  );
}
