import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "VAULT herkese açık mı?",
    a: "Hayır. VAULT davetli ve doğrulanmış emlak profesyonellerine açık private bir ağdır. Üyelik başvurusu onay sürecinden geçer.",
  },
  {
    q: "Portföy detaylarını kimler görebilir?",
    a: "Teaser bilgiler ağdaki doğrulanmış profesyonellere açıktır. Tam adres, telefon, tapu ve belgeler yalnızca portföy sahibinin onayladığı detay talepleri sonrası görünür.",
  },
  {
    q: "Tam adres ve telefon ne zaman görünür?",
    a: "Detay talebinizi gönderdiğinizde portföy sahibi talebi inceler. Onaylandığında tam adres, telefon ve belgeler size açılır.",
  },
  {
    q: "Arayışlarım nasıl çalışır?",
    a: "Müşterileriniz için arayış kaydedersiniz. Yeni bir portföy bu kriterlerle eşleştiğinde bildirim alır, doğrudan detay talebi gönderebilirsiniz.",
  },
  {
    q: "Bölge takibi nedir?",
    a: "Yalıkavak, Bebek, Riva veya Çeşme gibi bölgeleri takibe alırsınız. O bölgede yeni portföy, yeni arayış veya yeni bölge uzmanı aktivitesi olduğunda haberdar olursunuz.",
  },
  {
    q: "VAULT Asistan ne yapar?",
    a: "Doğal dille portföy arama, arayış oluşturma, eşleşme analizi, bölge uzmanı önerisi ve PDF hazırlama işlemlerini tek bir konuşma içinde yürütür.",
  },
  {
    q: "PDF ve WhatsApp paylaşımı nasıl çalışır?",
    a: "Share Studio ile portföyünüzü WhatsApp mesajı, teaser PDF, paylaşım linki ve QR koda dönüştürürsünüz. Kilitli bilgiler paylaşımda gizli kalır.",
  },
  {
    q: "Üyelik nasıl onaylanır?",
    a: "Başvurunuzdaki profesyonel bilgiler ve çalıştığınız bölgeler değerlendirilir. Doğrulama tamamlandığında kurucu üye erişiminiz açılır.",
  },
];

export function FaqSection() {
  return (
    <Accordion type="single" collapsible className="w-full">
      {faqs.map((f, i) => (
        <AccordionItem
          key={f.q}
          value={`item-${i}`}
          className="border-border/60"
        >
          <AccordionTrigger className="font-display text-base font-medium text-foreground hover:no-underline">
            {f.q}
          </AccordionTrigger>
          <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
            {f.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
