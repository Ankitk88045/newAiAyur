// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding AyurAi database...");

  // Seed initial knowledge chunks (sample Ayurveda content)
  const chunks = [
    {
      source: "samhita" as const,
      title: "Tridosha Theory — Vata, Pitta, Kapha",
      content:
        "The Tridosha theory is the fundamental principle of Ayurveda. Vata (air+ether) governs movement and nervous system. Pitta (fire+water) governs transformation and metabolism. Kapha (earth+water) governs structure and immunity. Health is the balance of these three doshas.",
      shloka:
        "वायुः पित्तं कफश्चेति त्रयो दोषाः समासतः। विकृताऽविकृता देहं घ्नन्ति ते वर्तयन्ति च।।",
      reference: "Charaka Samhita, Sutra Sthana, Adhyaya 1, Shloka 57",
    },
    {
      source: "samhita" as const,
      title: "Ashwagandha — Properties and Benefits",
      content:
        "Ashwagandha (Withania somnifera) is a rasayana herb known for its adaptogenic, nervine tonic, and rejuvenating properties. It strengthens muscles, enhances immunity, improves sleep, and reduces stress. Rasa: Tikta, Kashaya; Guna: Laghu, Snigdha; Virya: Ushna.",
      shloka:
        "बल्यं च मेध्यं रसायनं च वातव्याधिहरं पुनः। अश्वगन्धा विशेषेण पुष्टिदा बलवर्धनी।।",
      reference: "Charaka Samhita, Chikitsa Sthana, Adhyaya 1",
    },
    {
      source: "samhita" as const,
      title: "Triphala — Three Fruits Formula",
      content:
        "Triphala consists of Amalaki (Emblica officinalis), Bibhitaki (Terminalia bellirica), and Haritaki (Terminalia chebula). It is a tridoshic rasayana used for digestive health, detoxification, and eye care. It gently cleanses the colon without being habit-forming.",
      shloka:
        "आमलकी विभीतकी हरीतकी च त्रीणि फलानि त्रिफला। सर्वदोषहरा नित्यं रसायनमिदं परम्।।",
      reference: "Ashtanga Hridayam, Sutra Sthana, Adhyaya 6",
    },
    {
      source: "samhita" as const,
      title: "Panchakarma — Five Purification Therapies",
      content:
        "Panchakarma is the five-fold Ayurvedic purification therapy: 1) Vamana (therapeutic emesis) for Kapha disorders, 2) Virechana (therapeutic purgation) for Pitta disorders, 3) Basti (medicated enema) for Vata disorders, 4) Nasya (nasal administration), 5) Raktamokshana (bloodletting). Preceded by Snehana and Swedana.",
      shloka:
        "वमनं विरेचनं बस्तिः नस्यं रक्तमोक्षणम्। पञ्चकर्म इति प्रोक्तं शोधनार्थं विशेषतः।।",
      reference: "Charaka Samhita, Kalpa Sthana, Adhyaya 1",
    },
    {
      source: "samhita" as const,
      title: "Swastha Lakshana — Definition of Health",
      content:
        "According to Sushruta, a healthy person is one whose doshas are in balance, agni (digestive fire) is proper, dhatus (tissues) are in correct proportion, malas (waste products) are eliminated properly, and who is cheerful in atma (soul), indriya (senses), and manas (mind).",
      shloka:
        "समदोषः समाग्निश्च समधातुमलक्रियः। प्रसन्नात्मेन्द्रियमनाः स्वस्थ इत्यभिधीयते।।",
      reference: "Sushruta Samhita, Sutra Sthana, Adhyaya 15, Shloka 41",
    },
  ];

  for (const chunk of chunks) {
    await prisma.knowledgeChunk.upsert({
      where: { queryLogId: null },
      update: {},
      create: chunk,
    }).catch(() => {
      // Skip duplicates
    });
  }

  // Create separate entries since upsert on null won't work for multiple rows
  for (const chunk of chunks) {
    const existing = await prisma.knowledgeChunk.findFirst({
      where: { title: chunk.title },
    });
    if (!existing) {
      await prisma.knowledgeChunk.create({ data: chunk });
    }
  }

  console.log(`✅ Seeded ${chunks.length} knowledge chunks`);
  console.log("✅ Database seeding complete!");
  console.log("\n📌 Next steps:");
  console.log("   1. Set ADMIN_EMAIL in .env.local");
  console.log("   2. Sign in with that Google account");
  console.log("   3. Access /admin panel");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
