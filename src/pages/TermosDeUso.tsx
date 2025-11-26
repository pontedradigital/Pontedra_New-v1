import React, { useEffect, useRef } from "react"
import { format } from "date-fns"
import LandingNavbar from "@/components/LandingNavbar"
import Footer from "@/sections/Footer"
import CookieConsent from "@/components/CookieConsent"
import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"

export default function TermosDeUso() {
  useEffect(() => { document.title = "Pontedra • Termos de Uso" }, [])
  const articleRef = useRef<HTMLDivElement | null>(null)
  const exportPdf = async () => {
    const el = articleRef.current
    if (!el) return
    const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#0D1B2A" })
    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF("p", "mm", "a4")
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = pageWidth
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 0
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }
    pdf.save("Termos-de-Uso.pdf")
  }
  return (
    <div className="font-sans bg-bgMain text-textPrimary min-h-screen">
      <LandingNavbar mode="backOnly" />
      <main className="pt-24">
        <section className="relative w-full py-12 md:py-20 bg-[#0c1624]">
          <div className="container mx-auto px-4 md:px-8 max-w-5xl text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-[#57e389] opacity-90 shadow-[0_0_24px_rgba(87,227,137,0.45)]" />
            <h1 className="mt-5 text-3xl md:text-5xl font-extrabold text-[#57e389]">TERMOS DE USO</h1>
            <p className="mt-2 text-[#9ba8b5]">Pontedra – Marketing Digital e Desenvolvimento Web</p>
          </div>
        </section>

        <section className="relative w-full py-4 md:py-8 bg-[#0c1624]">
          <div className="container mx-auto px-4 md:px-8 max-w-4xl">
            <div className="flex justify-end mb-3">
              <button onClick={exportPdf} className="px-4 py-2 rounded-md bg-[#57e389] text-[#0D1B2A] hover:bg-[#4bc979]">Baixar PDF</button>
            </div>
            <article ref={articleRef} className="rounded-2xl border border-[#1d2c3f] bg-[#0D1B2A] shadow-2xl p-6 md:p-8">
              <p className="text-[#c8d5e0]">Bem‑vindo ao site da Pontedra. Ao acessar e utilizar este site, você concorda com os seguintes Termos de Uso. Leia atentamente antes de navegar ou utilizar nossos serviços.</p>

              <h2 className="mt-6 text-2xl font-bold text-white">1. Aceitação dos Termos</h2>
              <p className="mt-2 text-[#c8d5e0]">Ao acessar este site, você declara que leu, compreendeu e concorda com estes Termos de Uso e com nossa Política de Privacidade. Caso não concorde, recomendamos que não utilize este site.</p>

              <h2 className="mt-6 text-2xl font-bold text-white">2. Uso do Site</h2>
              <p className="mt-2 text-[#c8d5e0]">Este site destina‑se a fornecer informações sobre nossos serviços de marketing digital, desenvolvimento web e consultoria. Você concorda em:</p>
              <ul className="list-disc pl-6 text-[#c8d5e0]">
                <li>Utilizar o site apenas para fins legítimos e informativos.</li>
                <li>Não violar direitos de propriedade intelectual.</li>
                <li>Não transmitir vírus, malware ou conteúdo malicioso.</li>
                <li>Não tentar acessar áreas restritas do site sem autorização.</li>
              </ul>

              <h2 className="mt-6 text-2xl font-bold text-white">3. Propriedade Intelectual</h2>
              <p className="mt-2 text-[#c8d5e0]">Todo conteúdo deste site, incluindo textos, imagens, logotipos, gráficos e código‑fonte, é de propriedade exclusiva da Pontedra ou de seus licenciadores e está protegido por leis de direitos autorais e propriedade intelectual. É proibida a reprodução, distribuição ou modificação sem autorização prévia por escrito.</p>

              <h2 className="mt-6 text-2xl font-bold text-white">4. Serviços Oferecidos</h2>
              <p className="mt-2 text-[#c8d5e0]">A Pontedra oferece serviços de desenvolvimento web, marketing digital, criação de conteúdo e consultoria estratégica. As especificações, prazos e valores de cada serviço serão acordados mediante proposta comercial específica.</p>

              <h2 className="mt-6 text-2xl font-bold text-white">5. Limitações de Responsabilidade</h2>
              <p className="mt-2 text-[#c8d5e0]">A Pontedra não se responsabiliza por danos diretos ou indiretos decorrentes do uso deste site, incluindo perda de dados, indisponibilidade do serviço ou lucros cessantes. Não garantimos que o site estará disponível ininterruptamente ou livre de erros.</p>

              <h2 className="mt-6 text-2xl font-bold text-white">6. Links para Sites de Terceiros</h2>
              <p className="mt-2 text-[#c8d5e0]">Este site pode conter links para sites externos. Não nos responsabilizamos pelo conteúdo, políticas de privacidade ou práticas desses sites. O acesso a links externos é feito por conta e risco do usuário.</p>

              <h2 className="mt-6 text-2xl font-bold text-white">7. Coleta e Uso de Dados</h2>
              <p className="mt-2 text-[#c8d5e0]">A coleta e o uso de informações pessoais são regidos por nossa Política de Privacidade. Ao utilizar este site, você concorda com o consentimento e tratamento de dados conforme descrito na política.</p>

              <h2 className="mt-6 text-2xl font-bold text-white">8. Modificações nos Termos</h2>
              <p className="mt-2 text-[#c8d5e0]">A Pontedra reserva‑se o direito de modificar estes Termos de Uso a qualquer momento. As alterações entram em vigor imediatamente após publicação no site. Recomendamos revisar periodicamente este conteúdo.</p>

              <h2 className="mt-6 text-2xl font-bold text-white">9. Lei Aplicável</h2>
              <p className="mt-2 text-[#c8d5e0]">Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil. Qualquer disputa decorrente destes termos será submetida à jurisdição exclusiva dos tribunais de São Paulo/SP.</p>

              <h2 className="mt-6 text-2xl font-bold text-white">10. Contato</h2>
              <ul className="list-disc pl-6 text-[#c8d5e0]">
                <li>E‑mail: <span className="text-white font-semibold">contato@pontedra.com</span></li>
                <li>Telefone: <span className="text-white font-semibold">+55 11 97877‑7308</span></li>
                <li>Endereço: <span className="text-white font-semibold">Avenida Vila Ema 4191 – Vila Ema – São Paulo/SP</span></li>
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
