# VAULT Asistan — AI Architecture

## Ana modüller
1. AI ile Portföy Oluştur
2. Akıllı Portföy Arama
3. Arayış Oluşturma / Filtreye Çevirme
4. Eşleşme Açıklama
5. Bölge Uzmanı Bulma
6. PDF & Paylaşım Hazırlama
7. Değerleme / piyasa içgörüsü V1 placeholder

## V1 Search architecture
User query → LLM parser → structured filters JSON → SQL query → rank + explain → UI cards.

Örnek parser çıktısı:
```json
{
  "intent": "portfolio_search",
  "locations": ["Bodrum", "Yalıkavak"],
  "property_types": ["Villa"],
  "max_price": 100000000,
  "currency": "TRY",
  "min_rooms": 5,
  "must_have": ["Deniz Manzarası", "Havuz"]
}
```

## V1 Import architecture
Raw WhatsApp/PDF text → structured extraction → confidence/missing fields → draft review → portfolio draft.

## V1.5 Semantic
- `portfolio_search_documents`
- embeddings via pgvector
- hybrid rank: structured filters + vector similarity + freshness + data score.

## Guardrails
- AI taslağı otomatik yayınlamaz.
- AI locked bilgiyi unauthorized kullanıcıya göstermez.
- AI açıklamaları source fields ve match reasons üzerinden üretir.
- AI import confidence + missing_fields her zaman gösterilir.
