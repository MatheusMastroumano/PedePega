import Image from "next/image";

 import
export default function Home() {
  const comoFunc = [
    {},
    {},
    {}
  ];
  const comidas = [ 
    {},
    {},
    {},
    {},
    {},
    {}
  ]
  return (
    <main className="bg-white min-h-screen">


      <section className="relative w-full h-[701px]">
        <Image
          src="/rectangle 1.png"
          alt="Lanches"
          layout="fill"
          objectFit="cover"
          priority
        />
        <div className="absolute inset-0 flex items-center justify-start px-8 text-white">
          <div className="max-w-xl text-left ml-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Pede&Pega</h1>
            <p className="text-5xl md:text-xl font-medium">
              Agiliza e economiza seu tempo do intervalo!
            </p>
          </div>
        </div>

      </section>



      {/* Como Funciona */}
      <section className="py-14 px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-3 text-black">
          Como funciona?
        </h2>

        <p className="text-black font-medium mb-10 max-w-2xl mx-auto">
          Entenda como funciona o seu melhor site de encomenda e retirada de lanches escolares!
        </p>

        <div className="ml-6 flex flex-col md:flex-row justify-center items-center gap-8 flex-wrap">
          {comoFunc.map((func, idx) => (
            <div
              key={idx}
              className="bg-white w-[350px] h-[300px] p-8 rounded-2xl flex flex-col items-center justify-center text-center max-w-xs bg-white overflow-hidden shadow-md"
            >
              <Image src={func.icon} alt="" width={70} height={70} className="mb-6" />
              <p className="text-[25px] font-semibold text-gray-800">{func.title}</p>
            </div>
          ))}
        </div>




        <h2 className="text-3xl md:text-4xl font-extrabold mb-10 mt-20 text-black text-center">
          Conheça os nossos mais pedidos
        </h2>

       <div className="flex flex-col items-center gap-10 mt-4">

          <div className="ml-6 flex flex-col md:flex-row justify-center items-center gap-8 flex-wrap max-w-[750px]">
            {comidas.map((comida, id) => (
              <div
                key={id}
                className="bg-white max-w-xs rounded-2xl overflow-hidden shadow-md text-center"
              >
                <Image
                  src={comida.icon}
                  alt={comida.title}
                  width={400}
                  height={400}
                  className="w-full object-contain"
                />
                <h2 className="text-xl font-bold p-4">{comida.title}</h2>
              </div>
            ))}
          </div>

        </div>
      </section>
    </main>
  );
}
