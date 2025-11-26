import React, { useEffect } from "react"
import { format } from "date-fns"
import LandingNavbar from "@/components/LandingNavbar"
import Footer from "@/sections/Footer"
import CookieConsent from "@/components/CookieConsent"

export default function PoliticaPrivacidade() {
  useEffect(() => { document.title = "Pontedra • Política de Privacidade" }, [])
  return (
    <div className="font-sans bg-bgMain text-textPrimary min-h-screen">
      <LandingNavbar mode="backOnly" />
      <main className="pt-24">
        <section className="relative w-full py-12 md:py-20 bg-[#0c1624]">
          <div className="container mx-auto px-4 md:px-8 max-w-5xl text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-[#57e389] opacity-90 shadow-[0_0_24px_rgba(87,227,137,0.45)]" />
            <h1 className="mt-5 text-3xl md:text-5xl font-extrabold text-[#57e389]">POLÍTICA DE PRIVACIDADE</h1>
            <p className="mt-2 text-[#9ba8b5]">Pontedra – Conectamos sua empresa a pessoas</p>
          </div>
        </section>

        <section className="relative w-full py-4 md:py-8 bg-[#0c1624]">
          <div className="container mx-auto px-4 md:px-8 max-w-4xl">
            <article className="rounded-2xl border border-[#1d2c3f] bg-[#0D1B2A] shadow-2xl p-6 md:p-8">
              <p className="text-[#c8d5e0]">Esta política de privacidade explica de forma clara como coletamos, tratamos e protegemos os dados das pessoas que utilizam nosso ambiente digital. Estamos alinhados à Lei Geral de Proteção de Dados Pessoais (LGPD) – Lei nº 13.709/2018 e adotamos práticas transparentes e responsáveis.</p>

              <h2 className="mt-6 text-2xl font-bold text-white">1. Quem deve utilizar este site</h2>
              <p className="mt-2 text-[#c8d5e0]">Este site é voltado para empresas e empreendedores, profissionais liberais e autônomos que buscam presença digital, marketing estratégico, comunicação e tecnologia para crescer no ambiente online.</p>

              <h2 className="mt-6 text-2xl font-bold text-white">2. Dados que coletamos e motivos da coleta</h2>
              <p className="mt-2 text-[#c8d5e0]">Coletamos dados para permitir a comunicação com você, entender suas necessidades e apresentar propostas sob medida para negócios.</p>
              <p className="mt-3 font-semibold text-[#57e389]">Dados fornecidos por você:</p>
              <ul className="list-disc pl-6 text-[#c8d5e0]">
                <li>Nome completo</li>
                <li>E‑mail</li>
                <li>Telefone</li>
                <li>Mensagens ou solicitações através de formulários</li>
              </ul>
              <p className="mt-4 font-semibold text-[#57e389]">Dados coletados automaticamente:</p>
              <ul className="list-disc pl-6 text-[#c8d5e0]">
                <li>Endereço IP</li>
                <li>Dados de navegação (páginas visitadas, tempo de permanência)</li>
                <li>Cookies e tecnologias semelhantes</li>
              </ul>

              <h2 className="mt-6 text-2xl font-bold text-white">3. Cookies</h2>
              <p className="mt-2 text-[#c8d5e0]">Usamos cookies para reconhecimento de dispositivo, análise de uso, preferências de usuário e experiência personalizada. Você pode gerenciar ou desativar cookies no seu navegador; porém isso pode afetar a funcionalidade de algumas partes do site.</p>

              <h2 className="mt-6 text-2xl font-bold text-white">4. Compartilhamento de dados</h2>
              <p className="mt-2 text-[#c8d5e0]">Não compartilhamos seus dados pessoais com terceiros sem seu consentimento. Podemos compartilhar dados quando necessário para cumprir obrigações legais ou regulatórias.</p>

              <h2 className="mt-6 text-2xl font-bold text-white">5. Por quanto tempo armazenamos seus dados</h2>
              <p className="mt-2 text-[#c8d5e0]">Seus dados são mantidos pelo tempo necessário para cumprir o propósito para o qual foram coletados, respeitando os suportes legais aplicáveis. Após esses períodos, os dados são excluídos ou anonimizados, salvo obrigação legal de retenção.</p>

              <h2 className="mt-6 text-2xl font-bold text-white">6. Bases legais para o tratamento de dados</h2>
              <p className="mt-2 text-[#c8d5e0]">Todas as operações de tratamento de dados que realizamos têm fundamento legal previsto na LGPD: dados são tratados para atender sua demanda, cumprir obrigações legais ou agir com base em interesses legítimos.</p>

              <h2 className="mt-6 text-2xl font-bold text-white">7. Seus direitos</h2>
              <p className="mt-2 text-[#c8d5e0]">Você tem direito à confirmação de tratamento, acesso aos dados, correção de dados incompletos, anonimização, bloqueio ou eliminação de dados desnecessários, portabilidade de dados (quando aplicável), eliminação de dados tratados com consentimento, informação sobre compartilhamentos de dados públicos ou privados, informação sobre a possibilidade de não fornecer o consentimento e sobre as consequências de não fornecer, e consentimento direto ou as bases legais de tratamento.</p>

              <h2 className="mt-6 text-2xl font-bold text-white">8. Como exercer seus direitos</h2>
              <p className="mt-2 text-[#c8d5e0]">Para exercer seus direitos, entre em contato conosco pelo e‑mail ou endereço abaixo. Podemos solicitar confirmação de identidade para garantir que tratamos somente com o titular dos dados.</p>

              <h2 className="mt-6 text-2xl font-bold text-white">9. Medidas de segurança</h2>
              <p className="mt-2 text-[#c8d5e0]">Adotamos medidas técnicas e organizacionais para proteger seus dados contra acessos não autorizados, destruição, perda de informação, roubo, vazamentos, criptografia e registros de acesso.</p>

              <h2 className="mt-6 text-2xl font-bold text-white">10. Reclamação à autoridade de controle</h2>
              <p className="mt-2 text-[#c8d5e0]">Caso se sinta lesado em tratamento de seus dados pessoais, você pode apresentar reclamação à Autoridade Nacional de Proteção de Dados (ANPD) ou outro órgão competente.</p>

              <h2 className="mt-6 text-2xl font-bold text-white">11. Alterações nesta política</h2>
              <p className="mt-2 text-[#c8d5e0]">Podemos atualizar esta política de privacidade a qualquer momento. A data da última atualização está informada no rodapé desta página. Caso haja modificações relevantes, informaremos os usuários.</p>

              <h2 className="mt-6 text-2xl font-bold text-white">12. Como entrar em contato conosco</h2>
              <p className="mt-2 text-[#c8d5e0]">Se tiver dúvidas, quiser exercer seus direitos ou obter mais informações adicionais, entre em contato:</p>
              <ul className="list-disc pl-6 text-[#c8d5e0]">
                <li>E‑mail: <span className="text-white font-semibold">contato@pontedra.com</span></li>
                <li>Telefone: <span className="text-white font-semibold">+55 11 97877‑7308</span></li>
              </ul>

              {(() => {
                const desired = new Date(2025, 11, 9)
                const now = new Date()
                const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
                const safe = desired.getTime() < todayStart.getTime()
                  ? desired
                  : new Date(todayStart.getTime() - 24 * 60 * 60 * 1000)
                const text = format(safe, 'dd/MM/yyyy')
                return <div className="mt-8 text-[#9ba8b5] text-sm">{`Data da última atualização: ${text}`}</div>
              })()}
            </article>
          </div>
        </section>
      </main>
      <Footer />
      <CookieConsent />
    </div>
  )
}
