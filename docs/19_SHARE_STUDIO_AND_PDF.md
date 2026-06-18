# Share Studio & PDF

## Amaç
Portföyü sadece listelemek değil, profesyonel şekilde paylaşmak.

## Paylaşım kanalları
- WhatsApp message
- Copy link
- PDF export
- Email
- QR/link preview

## PDF türleri
1. Teaser PDF — public/network, locked fields yok.
2. Full PDF — owner veya approved access grant.
3. Match PDF — belirli arayışa göre uyum analizi.
4. Region PDF — P1/P2.

## Share Studio UI
- Left: WhatsApp preview
- Center: message composer + channel buttons
- Right: link preview, analytics, controlled access rules

## Locked access logic
- Teaser bilgiler herkese açık.
- Tam adres talep sonrası açılır.
- Belgeler onayla görünür.

## Backend V1
- Server-side HTML template → PDF.
- Storage private bucket.
- Signed URL.
- Share event logging.
