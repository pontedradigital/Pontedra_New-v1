import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import LandingNavbar from "@/components/LandingNavbar"; // Importar LandingNavbar
import Footer from "@/sections/Footer"; // Importar Footer

export default function TermosUso() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0D1B2A]">
      <LandingNavbar /> {/* Adicionado LandingNavbar */}
      {/* Header */}
      <header className="border-b border-[#1d2c3f] bg-[#0a1520] pt-24"> {/* Adicionado pt-24 para compensar a navbar fixa */}
        <div className="container mx-auto px-4 md:px-8 py-6">
          <Link to="/" className="inline-flex items-center gap-2 text-[#57e389] hover:text-[#4bc979] transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar para Home</span>
          </Link>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="container mx-auto px-4 md:px-8 py-16 flex-grow"> {/* Adicionado flex-grow */}
        <div className="max-w-4xl mx-auto">
          {/* Título */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1d3a2f] mb-6">
              <FileText className="w-8 h-8 text-[#57e389]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#57e389] mb-4">
              TERMOS DE USO
            </h1>
            <p className="text-[#9ba8b5]">
              Pontedra - Marketing Digital e Desenvolvimento Web
            </p>
          </div>

          {/* Conteúdo dos Termos */}
          <div className="bg-[#111d2e]/50 backdrop-blur-xl border border-[#1d2c3f] rounded-2xl p-8 md:p-12 space-y-8">
            <section>
              <p className="text-[#9ba8b5] leading-relaxed mb-6">
                Bem-vindo ao site da Pontedra. Ao acessar e utilizar este site, você concorda com os seguintes Termos de Uso. Leia atentamente antes de navegar ou utilizar nossos serviços.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Aceitação dos Termos</h2>
              <p className="text-[#9ba8b5] leading-relaxed">
                Ao acessar este site, você declara que leu, compreendeu e concorda com estes Termos de Uso e com nossa Política de Privacidade. Caso não concorde, recomendamos que não utilize este site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Uso do Site</h2>
              <p className="text-[#9ba8b5] leading-relaxed mb-4">
                Este site destina-se a fornecer informações sobre nossos serviços de marketing digital, desenvolvimento web e consultoria. Você concorda em:
              </p>
              <ul className="list-disc list-inside text-[#9ba8b5] space-y-2 ml-4">
                <li>Utilizar o site apenas para fins legítimos e legais</li>
                <li>Não violar direitos de propriedade intelectual</li>
                <li>Não transmitir vírus, malware ou códigos maliciosos</li>
                <li>Não tentar acessar áreas restritas do site sem autorização</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Propriedade Intelectual</h2>
              <p className="text-[#9ba8b5] leading-relaxed">
                Todo o conteúdo deste site, incluindo textos, imagens, logotipos, gráficos e código-fonte, é de propriedade exclusiva da Pontedra ou de seus licenciadores e está protegido por leis de direitos autorais e propriedade intelectual. É proibida a reprodução, distribuição ou modificação sem autorização prévia por escrito.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Serviços Oferecidos</h2>
              <p className="text-[#9ba8b5] leading-relaxed">
                A Pontedra oferece serviços de desenvolvimento web, marketing digital, criação de conteúdo e consultoria estratégica. As especificações, prazos e valores de cada serviço serão acordados mediante proposta comercial específica.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Limitação de Responsabilidade</h2>
              <p className="text-[#9ba8b5] leading-relaxed">
                A Pontedra não se responsabiliza por danos diretos ou indiretos decorrentes do uso deste site, incluindo perda de dados, interrupção de negócios ou lucros cessantes. Não garantimos que o site estará disponível ininterruptamente ou livre de erros.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Links para Sites de Terceiros</h2>
              <p className="text-[#9ba8b5] leading-relaxed">
                Este site pode conter links para sites de terceiros. Não nos responsabilizamos pelo conteúdo, políticas de privacidade ou práticas desses sites. O acesso a links externos é por sua conta e risco.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Coleta e Uso de Dados</h2>
              <p className="text-[#9ba8b5] leading-relaxed">
                A coleta e o uso de informações pessoais são regidos por nossa Política de Privacidade. Ao utilizar este site, você concorda com a coleta e o tratamento de dados conforme descrito na política.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Modificações nos Termos</h2>
              <p className="text-[#9ba8b5] leading-relaxed">
                A Pontedra reserva-se o direito de modificar estes Termos de Uso a qualquer momento. As alterações entrarão em vigor imediatamente após sua publicação no site. Recomendamos revisar periodicamente esta página.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Lei Aplicável</h2>
              <p className="text-[#9ba8b5] leading-relaxed">
                Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil. Qualquer disputa decorrente destes termos será submetida à jurisdição exclusiva dos tribunais de São Paulo/SP.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Contato</h2>
              <p className="text-[#9ba8b5] leading-relaxed mb-4">
                Se você tiver dúvidas sobre estes Termos de Uso, entre em contato conosco:
              </p>
              <ul className="list-disc list-inside text-[#9ba8b5] space-y-2 ml-4">
                <li>
                  <strong className="text-white">E-mail:</strong>{" "}
                  <a href="mailto:contato@pontedra.com" className="text-[#57e389] hover:underline">
                    contato@pontedra.com
                  </a>
                </li>
                <li>
                  <strong className="text-white">Telefone:</strong>{" "}
                  <a href="tel:+5511978777308" className="text-[#57e389] hover:underline">
                    +55 11 97877-7308
                  </a>
                </li>
                <li>
                  <strong className="text-white">Endereço:</strong> Avenida Vila Ema 4191 - Vila Ema - São Paulo/SP
                </li>
              </ul>
            </section>

            <div className="pt-8 border-t border-[#1d2c3f]">
              <p className="text-[#9ba8b5] text-sm text-center">
                Data da última atualização: 01/12/2025
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer /> {/* Adicionado Footer */}
    </div>
  );
}