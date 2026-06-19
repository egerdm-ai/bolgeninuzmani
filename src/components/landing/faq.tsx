import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Bölgenin Uzmanı herkese açık mı?",
    a: "Hayır. Bölgenin Uzmanı, davetli ve doğrulanmış emlak profesyonellerine açık kapalı bir ağdır. Üyelik başvuruları doğrulama sürecinden geçer.",
  },
  {
    q: "Portföylerimdeki tam adres ve malik bilgisi kimlere görünür?",
    a: "Teaser bilgiler ağdaki doğrulanmış profesyonellere açıktır. Tam adres, malik bilgisi, telefon ve belgeler yalnızca sizin onayladığınız detay talepleri sonrası görünür.",
  },
  {
    q: "Arayış oluşturduğumda müşteri bilgilerim görünür mü?",
    a: "Hayır. Müşteri bilgisi yalnızca sizde kalır. Profilinizde arayış, müşteri kimliği olmadan anonim kriterler olarak görünür.",
  },
  {
    q: "Detay Talebi nasıl çalışır?",
    a: "İlgilenen profesyonel tek tıkla detay talebi gönderir. Talep eden kişinin profilini görür, onayladığınızda tam adres, malik bilgisi ve belgeler o kişiye açılır. Tüm erişim geçmişi kaydedilir.",
  },
  {
    q: "Hangi portföy tipleri paylaşılabilir?",
    a: "Konut, lüks villa, yalı, arsa, ticari mülk, fabrika, otel, restoran, işletme devri ve yatırım varlıkları dahil tüm gayrimenkul tiplerini paylaşabilirsiniz.",
  },
  {
    q: "Üyelik başvuruları nasıl onaylanır?",
    a: "Başvurunuzdaki profesyonel bilgiler, çalıştığınız bölgeler ve yetki belgeniz değerlendirilir. Doğrulama tamamlandığında üyelik erişiminiz açılır.",
  },
  {
    q: "Öne Çıkarma seçenekleri nasıl çalışır?",
    a: "Portföylerinizi, profilinizi ve arayışlarınızı ana sayfa, şehir ve bölge vitrinlerinde öne çıkarabilir; AI eşleşme önceliği ve aciliyet rozeti gibi ek görünürlük avantajları kullanabilirsiniz.",
  },
  {
    q: "AI Asistan hangi bilgileri kullanır?",
    a: "AI Asistan; portföyleri, açıklamaları, özellikleri ve arayışları analiz ederek en uygun eşleşmeleri getirir. Kilitli bilgiler ve müşteri kimlikleri analize dahil edilmez.",
  },
];

export function FaqSection() {
  return (
    <Accordion type="single" collapsible className="w-full">
      {faqs.map((f, i) => (
        <AccordionItem key={f.q} value={`item-${i}`} className="border-border/60">
          <AccordionTrigger className="text-left font-display text-base font-medium text-foreground hover:no-underline">
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
