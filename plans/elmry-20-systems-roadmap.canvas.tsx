import {
  BarChart,
  Callout,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Grid,
  H1,
  H2,
  H3,
  Pill,
  Row,
  Spacer,
  Stack,
  Stat,
  Table,
  Text,
  UsageBar,
} from "cursor/canvas";

const SYSTEMS = [
  {
    rank: 1,
    name: "Satış POS",
    why: "Alış var, satış yok — döngü eksik; nakit ve stok buradan beslenir",
    scope: "Hızlı satış ekranı, sepet, barkod, kasa bağlama, fiş",
    effort: "L",
    weeks: 5,
    phase: "P1",
    score: 98,
  },
  {
    rank: 2,
    name: "Müşteri & Cari",
    why: "Tedarikçi var, müşteri yok; veresiye/alacak için zorunlu",
    scope: "Müşteri kartı, limit, şube görünürlüğü, cari bakiye",
    effort: "M",
    weeks: 3,
    phase: "P1",
    score: 95,
  },
  {
    rank: 3,
    name: "Satış İadesi",
    why: "Alış iadesi ayrıldı; satış tarafında simetri şart",
    scope: "Fiş/faturaya bağlı iade, stok geri alma, kasa çıkışı",
    effort: "M",
    weeks: 2,
    phase: "P1",
    score: 92,
  },
  {
    rank: 4,
    name: "Stok Transferi",
    why: "WarehouseStock var ama hareket UI/API yok",
    scope: "Anbar↔anbar, şube arası transfer, onay, hareket fişi",
    effort: "M",
    weeks: 3,
    phase: "P1",
    score: 90,
  },
  {
    rank: 5,
    name: "Stok Sayım & Düzeltme",
    why: "Gerçek envanter doğruluğu olmadan raporlar güvenilmez",
    scope: "Sayım oturumu, fark fişi, fire/surplus, kilitleme",
    effort: "M",
    weeks: 3,
    phase: "P1",
    score: 88,
  },
  {
    rank: 6,
    name: "Alacak Takibi (AR)",
    why: "Kasa customer counterparty hazır; resmi alacak defteri yok",
    scope: "Müşteri borcu, yaşlandırma, tahsilat, hatırlatma",
    effort: "M",
    weeks: 3,
    phase: "P2",
    score: 86,
  },
  {
    rank: 7,
    name: "Borç Defteri (AP)",
    why: "Tedarikçi bakiye var; kaldırılan Borclar yerine kaliteli AP",
    scope: "Vade, kısmi ödeme, yaşlandırma, alışa bağlama",
    effort: "M",
    weeks: 3,
    phase: "P2",
    score: 84,
  },
  {
    rank: 8,
    name: "Fiyat Listesi & Kampanya",
    why: "Tek salePrice yetersiz; toptan/perakende ayrımı gerekir",
    scope: "Liste, müşteri grubu, tarihli kampanya, öncelik",
    effort: "M",
    weeks: 3,
    phase: "P2",
    score: 82,
  },
  {
    rank: 9,
    name: "KDV / Vergi Katmanı",
    why: "Resmi rapor ve e-belge için vergi kırılımı şart",
    scope: "Ürün KDV oranı, fiş kırılımı, dönem özeti",
    effort: "M",
    weeks: 2,
    phase: "P2",
    score: 80,
  },
  {
    rank: 10,
    name: "Banka & Ödeme Kanalları",
    why: "Sadece kasa var; havale/POS terminal ayrımı yok",
    scope: "Banka hesabı, POS tahsilat, kasa-banka transfer",
    effort: "M",
    weeks: 3,
    phase: "P2",
    score: 78,
  },
  {
    rank: 11,
    name: "Barkod Etiket & Hızlı Okutma",
    why: "Barkod alanı var; operasyonel etiket/yazdırma yok",
    scope: "Etiket şablonu, toplu yazdırma, POS hızlı ekleme",
    effort: "S",
    weeks: 2,
    phase: "P2",
    score: 76,
  },
  {
    rank: 12,
    name: "Satış & Şube Analitiği",
    why: "Dashboard alış/kasa ağırlıklı; satış yoksa P&L yarım",
    scope: "Günlük satış, ürün/şube kar, marj, top ürünler",
    effort: "M",
    weeks: 3,
    phase: "P3",
    score: 74,
  },
  {
    rank: 13,
    name: "RBAC & Denetim İzi",
    why: "Permission modeli var; UI ve audit zayıf",
    scope: "Rol matrisi, ekran yetkisi, kim neyi değiştirdi",
    effort: "M",
    weeks: 3,
    phase: "P3",
    score: 72,
  },
  {
    rank: 14,
    name: "Stok Rezervasyonu",
    why: "Sipariş/POS çakışmasını önler",
    scope: "Sepet/sipariş rezervi, süre, serbest bırakma",
    effort: "M",
    weeks: 2,
    phase: "P3",
    score: 70,
  },
  {
    rank: 15,
    name: "Lot / SKT Takibi",
    why: "Gıda/eczane/kozmetik için kritik; genel retail’te değerli",
    scope: "Lot, son kullanma, FIFO çıkış, uyarı",
    effort: "L",
    weeks: 4,
    phase: "P3",
    score: 68,
  },
  {
    rank: 16,
    name: "Çoklu Para Birimi",
    why: "Till currency alanı var; kur ve dönüşüm yok",
    scope: "Kur tablosu, alış/satış kuru, rapor baz para",
    effort: "M",
    weeks: 3,
    phase: "P3",
    score: 66,
  },
  {
    rank: 17,
    name: "E-Belge Hazırlık",
    why: "Yasal uyum yolu; erken şema = az yeniden yazım",
    scope: "Fatura şeması, UUID, vergi kimliği, export adapter",
    effort: "L",
    weeks: 4,
    phase: "P4",
    score: 64,
  },
  {
    rank: 18,
    name: "Bildirim Merkezi",
    why: "Düşük stok, vade, onay bekleyenler operasyonu hızlandırır",
    scope: "In-app + e-posta kancaları, kural motoru",
    effort: "M",
    weeks: 2,
    phase: "P4",
    score: 62,
  },
  {
    rank: 19,
    name: "Özel Rapor Motoru",
    why: "Sabit hesabatlar yetmez; yönetim kendi kesitini ister",
    scope: "Boyut seçimi, kaydedilmiş görünüm, Excel export",
    effort: "L",
    weeks: 4,
    phase: "P4",
    score: 60,
  },
  {
    rank: 20,
    name: "Platform Ops Konsolu",
    why: "Admin şirket açıyor; sağlık, tenant izolasyonu, backup UX yok",
    scope: "Tenant health, migration durumu, feature flag, audit",
    effort: "M",
    weeks: 3,
    phase: "P4",
    score: 58,
  },
] as const;

const PHASE_COUNTS = {
  P1: SYSTEMS.filter((s) => s.phase === "P1").length,
  P2: SYSTEMS.filter((s) => s.phase === "P2").length,
  P3: SYSTEMS.filter((s) => s.phase === "P3").length,
  P4: SYSTEMS.filter((s) => s.phase === "P4").length,
} as const;

export default function ElmrySystemsRoadmapCanvas() {
  const totalWeeks = SYSTEMS.reduce((sum, s) => sum + s.weeks, 0);
  const p1 = PHASE_COUNTS.P1;
  const p2 = PHASE_COUNTS.P2;
  const p3 = PHASE_COUNTS.P3;
  const p4 = PHASE_COUNTS.P4;

  return (
    <Stack gap={24}>
      <Stack gap={8}>
        <H1>Elmry ERP — 20 Sistem Geliştirme Planı</H1>
        <Text tone="secondary">
          Mevcut güçlü çekirdek (ürün, alış/iade, tedarikçi, kassa, şube
          görünürlüğü, admin şirket hub) üzerine; perakende/toptan ERP için
          en yüksek getirili 20 sistem, öncelik sırasıyla.
        </Text>
      </Stack>

      <Grid columns={4} gap={12}>
        <Stat value="20" label="Hedef sistem" />
        <Stat value="4" label="Teslimat fazı" tone="info" />
        <Stat value={`~${totalWeeks}hf`} label="Toplam efor (kaba)" tone="warning" />
        <Stat value="P1" label="İlk kilit taşı: Satış POS" tone="success" />
      </Grid>

      <Callout tone="info" title="Planlama ilkesi">
        Önce para ve stoku hareket ettiren döngüyü kapat (alış → stok → satış →
        kasa/cari), sonra fiyat/vergi/banka, ardından kontrol ve yasal ölçek.
        Her sistem kendi başına ship edilebilir; bağımlılıklar P1→P2→P3→P4.
      </Callout>

      <Stack gap={8}>
        <H2>Faz dağılımı</H2>
        <UsageBar
          total={20}
          topLeftLabel={`${p1 + p2 + p3 + p4} sistem`}
          topRightLabel="P1 → P4"
          segments={[
            { id: "p1", value: p1, color: "green" },
            { id: "p2", value: p2, color: "blue" },
            { id: "p3", value: p3, color: "orange" },
            { id: "p4", value: p4, color: "purple" },
          ]}
        />
        <Text tone="tertiary" size="small">
          Yeşil P1 · Mavi P2 · Turuncu P3 · Mor P4 — segmentler sistem adedi
        </Text>
      </Stack>

      <Grid columns={2} gap={16}>
        <Card>
          <CardHeader>Öncelik skoru (1–10)</CardHeader>
          <CardBody>
            <BarChart
              categories={SYSTEMS.slice(0, 10).map((s) => `#${s.rank}`)}
              series={[
                {
                  name: "İş değeri skoru",
                  data: SYSTEMS.slice(0, 10).map((s) => s.score),
                  tone: "info",
                },
              ]}
              height={220}
              valueSuffix=""
            />
            <Text tone="tertiary" size="small">
              Kaynak: ürün boşluk analizi · Top 10 · skor 0–100
            </Text>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>Faz hedefleri</CardHeader>
          <CardBody>
            <Stack gap={12}>
              <Row gap={8} align="center">
                <Pill size="sm" tone="success">
                  P1
                </Pill>
                <Stack gap={2}>
                  <Text weight="semibold">Faz 1 — Ticari çekirdek</Text>
                  <Text tone="secondary" size="small">
                    Alış→stok→satış döngüsünü kapat · Sistem 1–5 · 12–14 hafta
                  </Text>
                </Stack>
              </Row>
              <Row gap={8} align="center">
                <Pill size="sm" tone="info">
                  P2
                </Pill>
                <Stack gap={2}>
                  <Text weight="semibold">Faz 2 — Para & fiyat</Text>
                  <Text tone="secondary" size="small">
                    Cari, vergi, banka, fiyat disiplini · Sistem 6–11 · 11–13
                    hafta
                  </Text>
                </Stack>
              </Row>
              <Row gap={8} align="center">
                <Pill size="sm" tone="warning">
                  P3
                </Pill>
                <Stack gap={2}>
                  <Text weight="semibold">Faz 3 — Kontrol & derinlik</Text>
                  <Text tone="secondary" size="small">
                    Analitik, yetki, lot, kur · Sistem 12–16 · 12–14 hafta
                  </Text>
                </Stack>
              </Row>
              <Row gap={8} align="center">
                <Pill size="sm" tone="neutral">
                  P4
                </Pill>
                <Stack gap={2}>
                  <Text weight="semibold">Faz 4 — Ölçek & uyum</Text>
                  <Text tone="secondary" size="small">
                    E-belge, bildirim, rapor, platform · Sistem 17–20 · 11–13
                    hafta
                  </Text>
                </Stack>
              </Row>
            </Stack>
          </CardBody>
        </Card>
      </Grid>

      <Divider />

      <Stack gap={8}>
        <H2>Sıralı sistem kataloğu</H2>
        <Text tone="secondary" size="small">
          S = küçük · M = orta · L = büyük efor
        </Text>
        <Table
          headers={[
            "#",
            "Sistem",
            "Faz",
            "Efor",
            "Hf",
            "Neden / kapsam",
          ]}
          columnAlign={["right", "left", "left", "left", "right", "left"]}
          rows={SYSTEMS.map((s) => [
            String(s.rank),
            s.name,
            s.phase,
            s.effort,
            String(s.weeks),
            `${s.why} — ${s.scope}`,
          ])}
          rowTone={SYSTEMS.map((s) =>
            s.rank <= 5 ? ("success" as const) : undefined,
          )}
        />
      </Stack>

      <Divider />

      <H2>Faz planı — nasıl geliştirilir</H2>

      <Grid columns={2} gap={16}>
        <Card>
          <CardHeader trailing={<Pill tone="success">P1</Pill>}>
            Ticari çekirdek
          </CardHeader>
          <CardBody>
            <Stack gap={10}>
              <H3>Sıra</H3>
              <Text size="small">
                1) Müşteri kartı → 2) POS satış → 3) Satış iadesi → 4) Transfer →
                5) Sayım
              </Text>
              <H3>Teslimat tanımı</H3>
              <Text size="small" tone="secondary">
                Şubede barkodla satış, kasa hareketi, stok düşümü, iade ve
                anbarlar arası hareket. Dashboard’da gerçek satış KPI.
              </Text>
              <H3>Teknik not</H3>
              <Text size="small" tone="secondary">
                Yeni modeller: Customer, SaleVoucher/Line, StockTransfer,
                StockCount. TillTransaction customer bağını resmi hale getir.
              </Text>
            </Stack>
          </CardBody>
        </Card>

        <Card>
          <CardHeader trailing={<Pill tone="info">P2</Pill>}>
            Para & fiyat
          </CardHeader>
          <CardBody>
            <Stack gap={10}>
              <H3>Sıra</H3>
              <Text size="small">
                6) AR → 7) AP → 8) Fiyat listesi → 9) KDV → 10) Banka → 11)
                Etiket
              </Text>
              <H3>Teslimat tanımı</H3>
              <Text size="small" tone="secondary">
                Veresiye satış, tedarikçi vade/ödeme, kampanyalı fiyat, vergi
                kırılımlı fiş, banka tahsilat.
              </Text>
              <H3>Teknik not</H3>
              <Text size="small" tone="secondary">
                Ledger tarzı hareket tabloları (AR/AP), PriceList, TaxRate,
                BankAccount. Finance raporlarını satış + vergi ile genişlet.
              </Text>
            </Stack>
          </CardBody>
        </Card>

        <Card>
          <CardHeader trailing={<Pill tone="warning">P3</Pill>}>
            Kontrol & derinlik
          </CardHeader>
          <CardBody>
            <Stack gap={10}>
              <H3>Sıra</H3>
              <Text size="small">
                12) Analitik → 13) RBAC/audit → 14) Rezerv → 15) Lot/SKT → 16)
                Kur
              </Text>
              <H3>Teslimat tanımı</H3>
              <Text size="small" tone="secondary">
                Şube/ürün karlılık, yetki matrisi, sipariş rezervi, son kullanma
                uyarısı, çoklu para.
              </Text>
              <H3>Teknik not</H3>
              <Text size="small" tone="secondary">
                AuditLog, StockReservation, ProductLot, ExchangeRate. Permission
                UI’yi admin + ERP ayarlarına taşı.
              </Text>
            </Stack>
          </CardBody>
        </Card>

        <Card>
          <CardHeader trailing={<Pill>P4</Pill>}>Ölçek & uyum</CardHeader>
          <CardBody>
            <Stack gap={10}>
              <H3>Sıra</H3>
              <Text size="small">
                17) E-belge şema → 18) Bildirim → 19) Rapor motoru → 20)
                Platform ops
              </Text>
              <H3>Teslimat tanımı</H3>
              <Text size="small" tone="secondary">
                Yasal belgeye hazır fatura modeli, operasyon uyarıları, özelleşir
                raporlar, tenant sağlık paneli.
              </Text>
              <H3>Teknik not</H3>
              <Text size="small" tone="secondary">
                DocumentExport adapter, NotificationRule, SavedReport,
                AdminHealth. Feature flag ile kademeli açılış.
              </Text>
            </Stack>
          </CardBody>
        </Card>
      </Grid>

      <Spacer height={8} />

      <Card>
        <CardHeader>Önerilen ilk 90 gün (sprint çerçevesi)</CardHeader>
        <CardBody>
          <Grid columns={3} gap={12}>
            <Stack gap={6}>
              <Text weight="semibold">Gün 1–30</Text>
              <Text size="small" tone="secondary">
                Müşteri CRUD + cari iskelet · POS MVP (nakit satış + stok düşümü)
                · Satış listesi ekranı
              </Text>
            </Stack>
            <Stack gap={6}>
              <Text weight="semibold">Gün 31–60</Text>
              <Text size="small" tone="secondary">
                Satış iadesi · Kasa entegrasyonu sertleştirme · Stok transfer
                fişi · Dashboard satış KPI
              </Text>
            </Stack>
            <Stack gap={6}>
              <Text weight="semibold">Gün 61–90</Text>
              <Text size="small" tone="secondary">
                Stok sayım · Basit alacak tahsilatı · Etiket yazdırma · P2 için
                fiyat listesi tasarımı
              </Text>
            </Stack>
          </Grid>
        </CardBody>
      </Card>

      <Callout tone="success" title="Başarı kriteri (P1 bitişi)">
        Demo şirkette bir ürün alınıp anbara girer, başka şubeye transfer
        edilir, POS’tan satılır, iade alınır; kasa bakiyesi ve stok miktarı uçtan
        uca tutarlı kalır.
      </Callout>

      <Text tone="tertiary" size="small">
        Kaynak: mevcut Elmry monorepo envanteri (web/api/admin/prisma) · Plan
        tarihi: 2026-08-11 · Eforlar tek ekip varsayımıyla kabadır
      </Text>
    </Stack>
  );
}
