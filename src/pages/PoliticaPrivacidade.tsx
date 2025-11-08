import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import LandingNavbar from "@/components/LandingNavbar"; // Importar LandingNavbar
import Footer from "@/sections/Footer"; // Importar Footer

export default function PoliticaPrivacidade() {
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
              <Shield className="w-8 h-8 text-[#57e389]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#57e389] mb-4">
              POLÍTICA DE PRIVACIDADE
            </h1>
            <p className="text-[#9ba8b5]">
              Pontedra - Conectamos sua empresa a pessoas
            </p>
          </div>

          {/* Conteúdo da Política */}
          <div className="bg-[#111d2e]/50 backdrop-blur-xl border border-[#1d2c3f] rounded-2xl p-8 md:p-12 space-y-8">
            <section>
              <p className="text-[#9ba8b5] leading-relaxed mb-6">
                Esta política de privacidade aplica-se aos usuários, empresas e profissionais do nosso site que utilizam nossa plataforma digital. Estamos sujeitos à Lei Geral de Proteção de Dados Pessoais (LGPD) - Lei 13.709/2018 e elaboramos políticas responsáveis e transparentes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Quem deve utilizar este site</h2>
              <p className="text-[#9ba8b5] leading-relaxed">
                Este site é voltado para empresários e empreendedores, profissionais liberais e autônomos que buscam presença digital, marketing, tráfego pago, conteúdo e estratégias para crescer no ambiente online.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Dados que coletamos e motivos da coleta</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-[#57e389] mb-3">Dados fornecidos por você:</h3>
                  <ul className="list-disc list-inside text-[#9ba8b5] space-y-2 ml-4">
                    <li>Nome completo</li>
                    <li>E-mail</li>
                    <li>Telefone</li>
                    <li>Mensagens ou solicitações através de formulários</li>
                  </ul>
                </div>
                <p className="text-[#9ba8b5] leading-relaxed">
                  Esses dados são coletados para permitir a comunicação com você, entender suas necessidades e apresentar propostas sob medida para serviços.
                </p>

                <div className="mt-6">
                  <h3 className="text-xl font-semibold text-[#57e389] mb-3">Dados coletados automaticamente:</h3>
                  <ul className="list-disc list-inside text-[#9ba8b5] space-y-2 ml-4">
                    <li>Endereço IP</li>
                    <li>Dados de navegação (páginas visitadas, tempo de permanência)</li>
                    <li>Cookies e tecnologias semelhantes</li>
                  </ul>
                </div>
                <p className="text-[#9ba8b5] leading-relaxed">
                  Esses dados nos ajudam a melhorar a sua experiência, personalizar conteúdos, entender o desempenho do site e otimizar nossos serviços.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Cookies</h2>
              <p className="text-[#9ba8b5] leading-relaxed">
                Usamos cookies para reconhecimento de dispositivo, análise de uso, preferências de usuário e anúncios personalizados. Você pode gerenciar ou desativar cookies no seu navegador, porém isso pode afetar a funcionalidade de algumas partes do site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Compartilhamento de dados</h2>
              <p className="text-[#9ba8b5] leading-relaxed">
                Não compartilhamos seus dados pessoais com terceiros para fins comerciais sem seu consentimento. Podemos compartilhar dados apenas quando necessário para cumprir obrigações legais ou regulatórias.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Por quanto tempo armazenamos seus dados</h2>
              <p className="text-[#9ba8b5] leading-relaxed">
                Seus dados são mantidos pelo tempo necessário para cumprir a proposta para a qual foram coletados, requisições de suporte legais e regulatórias. Após esses períodos, os dados são excluídos ou anonimizados, salvo obrigação legal em contrário.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Bases legais para o tratamento de dados</h2>
              <p className="text-[#9ba8b5] leading-relaxed">
                Todas as operações de tratamento de dados que realizamos têm fundamento legal previsto na LGPD. Os dados são tratados para atender sua demanda, cumprir obrigações legais ou agir com base em legítimos interesses.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Seus direitos</h2>
              <p className="text-[#9ba8b5] leading-relaxed">
                Você tem o direito de: confirmação de tratamento, acesso aos dados, correção de dados incompletos, anonimização, bloqueio ou eliminação de dados desnecessários, portabilidade de dados (quando aplicável), eliminação de dados tratados com consentimento, informações sobre o compartilhamento de dados públicos ou privados, informação sobre a possibilidade de não fornecer o consentimento direto ou as bases legais de tratamento.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Como exercer seus direitos</h2>
              <p className="text-[#9ba8b5] leading-relaxed">
                Para exercer esses direitos, entre em contato conosco pelo e-mail ou endereço abaixo. Podemos solicitar confirmação de identidade para garantir que tratamos somente com o titular dos dados.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Medidas de segurança</h2>
              <p className="text-[#9ba8b5] leading-relaxed">
                Adotamos medidas técnicas e organizacionais para proteger seus dados contra acessos não autorizados, destruição, perda de informação, fraude, roubo, vazamento, criptografia e registros de acesso.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Reclamação à autoridade de controle</h2>
              <p className="text-[#9ba8b5] leading-relaxed">
                Caso se sinta lesado em tratamento de seus dados pessoais, você pode apresentar reclamação à Autoridade Nacional de Proteção de Dados (ANPD) ou outro órgão competente.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Alterações nesta política</h2>
              <p className="text-[#9ba8b5] leading-relaxed">
                Podemos atualizar esta política de privacidade a qualquer momento. A data da última atualização será indicada no topo da base deste documento. Caso hajam modificações relevantes, informaremos os usuários.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">12. Como entrar em contato conosco</h2>
              <p className="text-[#9ba8b5] leading-relaxed mb-4">
                Se tiver dúvidas, quiser exercer seus direitos ou obter informações adicionais, entre em contato:
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