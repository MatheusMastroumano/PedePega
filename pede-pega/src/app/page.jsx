import Image from "next/image";

 import
export default function Home() {
  return (
    <main className="bg-white min-h-screen">


      <section className="relative w-full h-[720px]">
        <Image
          src="/rectangle 1.png"
          alt="Lanches"
          layout="fill"
          objectFit="cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60 flex items-center justify-start px-8 text-white">
          <div className="max-w-xl text-left ml-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Pede&Pega</h1>
            <p className="text-5xl md:text-xl font-medium">
              Agiliza e economiza seu tempo do intervalo!
            </p>
          </div>
        </div>

      </section>



      {/* Como Funciona */}
      <section className="bg-gray-100 py-14 px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-3 text-black">
          Como funciona?
        </h2>

        <p className="text-black font-medium mb-10 max-w-2xl mx-auto">
          Entenda como funciona o seu melhor site de encomenda e retirada de lanches escolares!
        </p>

        <div className="ml-6 flex flex-col md:flex-row justify-center items-center gap-8 flex-wrap">
          {[
            {
              icon: "/Vector.png",
              title: "Entre no site e escolha seu lanche",
            },
            {
              icon: "/Vector (1).png",
              title: "Escolha o horário de retirada",
            },
            {
              icon: "/Vector (2).png",
              title: "Assim que pronto retire seu pedido!",
            },
          ].map((step, idx) => (
            <div
              key={idx}
              className="bg-white w-[350px] h-[300px] p-8 rounded-2xl shadow-lg flex flex-col items-center justify-center text-center"
            >
              <Image src={step.icon} alt="" width={70} height={70} className="mb-6" />
              <p className="text-xl font-semibold text-gray-800">{step.title}</p>
            </div>
          ))}
        </div>




        <h2 className="text-3xl md:text-4xl font-extrabold mb-10 mt-20 text-black text-center">
          Conheça os nossos mais pedidos
        </h2>



        <div className="flex flex-col items-center gap-10 mt-4">

          {/* Bloco 1 */}
          <div className="ml-6 flex flex-col md:flex-row justify-center items-center gap-8 flex-wrap">
            {[
              { icon: "/Frame 1.png", title: "Entre no site e escolha seu lanche" },
              { icon: "/Frame 2.png", title: "Escolha o horário de retirada" },
              { icon: "/Frame 7.png", title: "Assim que pronto retire seu pedido!" },
            ].map((step, idx) => (
              <div
                key={idx}
                className="bg-white w-[400px] h-[400px] p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center text-center"
              >
                <Image
                  src={step.icon}
                  alt={step.title}
                  width={600}
                  height={600}
                  style={{ objectFit: "contain" }}
                  className="mb-4"
                />
                <p className="text-xl font-semibold text-black">{step.title}</p>
              </div>
            ))}
          </div>

          {/* Bloco 2 */}
          <div className="ml-6 flex flex-col md:flex-row justify-center items-center gap-8 flex-wrap mt-2">
            {[
              { icon: "/Frame 6.png", title: "Entre no site e escolha seu lanche" },
              { icon: "/Frame 8.png", title: "Escolha o horário de retirada" },
              { icon: "/Frame 3.png", title: "Assim que pronto retire seu pedido!" },
            ].map((step, idx) => (
              <div
                key={idx}
                className="bg-white w-[400px] h-[400px] p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center text-center"
              >
                <Image
                  src={step.icon}
                  alt={step.title}
                  width={600}
                  height={600}
                  style={{ objectFit: "contain" }}
                  className="mb-4"
                />
                <p className="text-xl font-semibold text-black">{step.title}</p>
              </div>
            ))}
          </div>


        </div>
      </section>
    </main>
  );
}
