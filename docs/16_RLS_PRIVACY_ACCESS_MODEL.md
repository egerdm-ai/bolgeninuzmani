# RLS, Privacy & Access Model

## Privacy levels
- Public teaser: link ile sınırlı görünür.
- Network visible: doğrulanmış üyeler görür.
- Request required: detaylar için talep gerekir.
- Invite only: sadece seçili kişiler.
- Owner only: draft/private.

## Locked fields
- exact address
- owner phone/email
- malik/sahip bilgisi
- tapu/belgeler
- full PDF
- private notes
- exact coordinates

## Access flow
1. Viewer portföy teaser'ı görür.
2. Detay Talebi gönderir.
3. Owner approve/reject eder.
4. Onaylanırsa `portfolio_access_grants` kaydı oluşur.
5. Signed URLs / locked fields access kontrollü açılır.

## RLS prensipleri
- Kullanıcı kendi profiline ve portföylerine full access.
- Published/network visible portföylerde sadece public fields görünür.
- Locked fields sadece owner veya active access grant ile görünür.
- Documents private bucket'ta; signed URL kısa süreli.
- Detail requests sadece requester ve owner tarafından görülür.
- Admin role moderation için geniş yetkiye sahip olabilir.

## Backend kuralı
Frontend hiçbir zaman locked veriyi alıp saklamamalı. Masking backend/RLS seviyesinde yapılmalı.
