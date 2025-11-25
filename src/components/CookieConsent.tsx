import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";

type Consent = {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  timestamp: number;
  version: string;
};

const STORAGE_KEY = "pontedra_cookie_consent_v1";
const VERSION = "1.0";

export default function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [functional, setFunctional] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  const existing = useMemo(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Consent) : null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    setShowBanner(true);
    if (existing) {
      setAnalytics(Boolean(existing.analytics));
      setMarketing(Boolean(existing.marketing));
      setFunctional(Boolean(existing.functional));
    }
  }, [existing]);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener('open-cookie-preferences', onOpen);
    return () => window.removeEventListener('open-cookie-preferences', onOpen);
  }, []);

  const save = (value: Pick<Consent, "analytics" | "marketing" | "functional">) => {
    const data: Consent = {
      essential: true,
      analytics: value.analytics,
      marketing: value.marketing,
      functional: value.functional,
      timestamp: Date.now(),
      version: VERSION,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const onAcceptAll = () => {
    setAnalytics(true);
    setMarketing(true);
    setFunctional(true);
    save({ analytics: true, marketing: true, functional: true });
    setOpen(false);
    setShowBanner(false);
  };

  const onRejectAll = () => {
    setAnalytics(false);
    setMarketing(false);
    setFunctional(false);
    save({ analytics: false, marketing: false, functional: false });
    setOpen(false);
    setShowBanner(false);
  };

  const onSave = () => {
    save({ analytics, marketing, functional });
    setOpen(false);
    setShowBanner(false);
  };

  return (
    <>
      {showBanner && (
        <div className="fixed right-6 bottom-6 md:right-10 md:bottom-10 z-50 w-[calc(100%-3rem)] sm:w-auto">
          <div className="bg-[#0c1624] text-[#e1e8f0] border border-[#1d2c3f] rounded-2xl shadow-2xl p-6 md:p-7 max-w-md">
            <div className="space-y-3 text-left">
              <p className="text-xl font-extrabold text-white">Sua privacidade e escolhas valem muito para gente</p>
              <p className="text-sm md:text-base text-[#9ba8b5]">Nosso compromisso é com o bom uso dos seus dados. Usamos apenas para contato, atendimento e análises, garantindo a melhor experiência para nossos clientes. Seus direitos como titular são respeitados conforme a LGPD. Para detalhes, acesse nossa <Link to="/politica-privacidade" className="text-[#57e389] hover:text-[#4bc979] font-semibold">Política de Privacidade</Link>.</p>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={() => setOpen(true)} className="px-4 py-2 rounded-md border border-[#1d2c3f] text-[#e1e8f0] bg-transparent">Customizar</button>
              <button onClick={onRejectAll} className="px-4 py-2 rounded-md border border-[#1d2c3f] text-[#e1e8f0] bg-transparent">Rejeitar todos</button>
              <button onClick={onAcceptAll} className="px-4 py-2 rounded-md bg-[#57e389] text-[#0D1B2A] hover:bg-[#4bc979]">Aceitar todos</button>
            </div>
          </div>
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[640px] bg-[#0c1624] border-[#1d2c3f] text-[#e1e8f0] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Sua privacidade e escolhas valem muito para gente</DialogTitle>
            <DialogDescription className="text-[#9ba8b5]">Nosso compromisso é com o bom uso dos seus dados. Usamos apenas para contato, atendimento e análises, garantindo a melhor experiência para nossos clientes. Seus direitos como titular são respeitados conforme a LGPD. Para detalhes, acesse nossa <Link to="/politica-privacidade" className="text-[#57e389] hover:text-[#4bc979]">Política de Privacidade</Link>.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Essenciais</p>
                <p className="text-sm text-[#9ba8b5]">Necessários para o funcionamento do site.</p>
              </div>
              <Switch checked disabled />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-semibold text-white">Funcionais</Label>
                <p className="text-sm text-[#9ba8b5]">Melhorias de experiência (ex.: lembrar preferências).</p>
              </div>
              <Switch checked={functional} onCheckedChange={setFunctional} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-semibold text-white">Análise</Label>
                <p className="text-sm text-[#9ba8b5]">Medição de uso e desempenho sem identificação direta.</p>
              </div>
              <Switch checked={analytics} onCheckedChange={setAnalytics} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-semibold text-white">Marketing</Label>
                <p className="text-sm text-[#9ba8b5]">Personalização de conteúdo e anúncios.</p>
              </div>
              <Switch checked={marketing} onCheckedChange={setMarketing} />
            </div>
            <div className="flex flex-wrap gap-3 justify-end pt-2">
              <Button variant="outline" onClick={onRejectAll} className="bg-transparent border-[#1d2c3f] text-[#e1e8f0]">Rejeitar todos</Button>
              <Button variant="outline" onClick={onSave} className="bg-transparent border-[#1d2c3f] text-[#e1e8f0]">Salvar preferências</Button>
              <Button onClick={onAcceptAll} className="bg-[#57e389] text-[#0D1B2A] hover:bg-[#4bc979]">Aceitar todos</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}