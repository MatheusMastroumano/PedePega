import Image from "next/image";

export default function Politicas() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-20 text-black mt-10">
      <h1 className="text-4xl font-bold text-yellow-500 text-center mb-10">
        Política de Privacidade
      </h1>

      <div className="space-y-10">
        {/* Section 1 - Imagem Direita */}
        <section className="flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-1/2 space-y-4">
            <h2 className="text-2xl font-semibold text-yellow-500">
              1. Quem Somos
            </h2>
            <p>
              Este sistema foi desenvolvido pelos alunos da{" "}
              <strong>ETEC Manoel Teodoro</strong> para otimizar o atendimento
              na cantina operada por <strong>Dona Alice</strong>. A missão é
              agilizar os pedidos e acabar com as filas nos intervalos.
            </p>
          </div>
          <div className="md:w-1/2">
            <Image
              src="/img/team.svg"
              width={300}
              height={300}
              alt="Privacidade"
            />
          </div>
        </section>

        {/* Section 2 - Imagem Esquerda */}
        <section className="flex flex-col md:flex-row-reverse items-center gap-8 mt-10">
          <div className="md:w-1/2 space-y-4">
            <h2 className="text-2xl font-semibold text-yellow-500">
              2. Dados Coletados
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Nome, CPF, matrícula, série e turno.</li>
              <li>Itens dos pedidos e horário de retirada.</li>
              <li>Informações de acesso para melhorias da plataforma.</li>
            </ul>
          </div>
          <div className="md:w-1/2">
            <Image
              src="/img/privacy.svg"
              width={300}
              height={300}
              alt="Dados Coletados"
            />
          </div>
        </section>

        {/* Section 3 - Imagem Direita */}
        <section className="flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-1/2 space-y-4">
            <h2 className="text-2xl font-semibold text-yellow-500">
              3. Finalidade
            </h2>
            <p>
              Utilizamos os dados para organizar os pedidos, otimizar os
              horários de retirada e melhorar a experiência de todos os alunos e
              da equipe da cantina.
            </p>
          </div>
          <div className="md:w-1/2">
            <Image
              src="/img/productivity.svg"
              width={300}
              height={300}
              alt="Finalidade"
            />
          </div>
        </section>

        {/* Section 4 - Imagem Esquerda */}
        <section className="flex flex-col md:flex-row-reverse items-center gap-8">
          <div className="md:w-1/2 space-y-4">
            <h2 className="text-2xl font-semibold text-yellow-500">
              4. Seus Direitos
            </h2>
            <p>
              Você pode acessar, corrigir ou excluir seus dados a qualquer
              momento. Basta procurar a gestão escolar para realizar qualquer
              solicitação sobre seus dados.
            </p>
          </div>
          <div className="md:w-1/2">
            <Image
              src="/img/security.svg"
              width={300}
              height={300}
              alt="Seus Direitos"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
