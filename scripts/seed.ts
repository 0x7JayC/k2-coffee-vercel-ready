import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { products, ministries } from "../drizzle/schema";

async function seed() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const client = postgres(databaseUrl, { prepare: false });
  const db = drizzle(client);

  console.log("Seeding K2 Coffee database...\n");

  // Seed Products
  const seedProducts = [
    {
      name: "Yunnan Highland Reserve",
      description:
        "Our flagship single-origin from farms above 1,500m. Grown on volcanic red soil by smallholder families in Pu'er, this lot delivers a clean, bright cup with exceptional complexity.",
      price: 2499,
      weight: "12 oz / 340g",
      tastingNotes: "Stone Fruit, Jasmine, Raw Honey, Citrus Zest",
      imageUrl: null,
      active: true,
    },
    {
      name: "Binchuan Heritage Blend",
      description:
        "Named for the village where French missionary Alfred Liétard planted Yunnan's first Arabica trees in 1904. A medium roast honoring 120 years of Yunnan coffee heritage.",
      price: 1999,
      weight: "12 oz / 340g",
      tastingNotes: "Dark Chocolate, Brown Sugar, Toasted Almond",
      imageUrl: null,
      active: true,
    },
    {
      name: "Red Earth Espresso",
      description:
        "Crafted for espresso lovers. Lower-altitude beans from the Baoshan region, roasted to bring out deep, syrupy body with sweet cocoa undertones. Pulls a gorgeous crema.",
      price: 2199,
      weight: "12 oz / 340g",
      tastingNotes: "Cocoa, Caramel, Walnut, Molasses",
      imageUrl: null,
      active: true,
    },
    {
      name: "Morning Ritual — Light Roast",
      description:
        "High-altitude micro-lot from Menglian County. Delicate and floral — perfect for pour-over. Named for the daily intention that starts with your first sip.",
      price: 2799,
      weight: "8 oz / 227g",
      tastingNotes: "White Peach, Bergamot, Lavender, Lemon",
      imageUrl: null,
      active: true,
    },
  ];

  for (const product of seedProducts) {
    await db.insert(products).values(product);
    console.log(`  ✓ Product: ${product.name}`);
  }

  // Seed Ministries
  const seedMinistries = [
    {
      name: "Missions & Evangelism",
      description:
        "Supporting missionaries and church planters bringing the Gospel to unreached communities across Asia, Africa, and Latin America. Your purchase helps fund training, travel, and resources for frontline workers.",
      websiteUrl: null,
      imageUrl: null,
      active: true,
    },
    {
      name: "Community Outreach",
      description:
        "Partnering with local churches to serve their neighborhoods through food programs, disaster relief, counseling services, and community development initiatives that meet real needs.",
      websiteUrl: null,
      imageUrl: null,
      active: true,
    },
    {
      name: "Youth & Education",
      description:
        "Investing in the next generation through scholarship funds, after-school programs, mentorship, and youth ministry resources. Helping young people discover purpose and develop their God-given potential.",
      websiteUrl: null,
      imageUrl: null,
      active: true,
    },
  ];

  for (const ministry of seedMinistries) {
    await db.insert(ministries).values(ministry);
    console.log(`  ✓ Ministry: ${ministry.name}`);
  }

  console.log("\n✅ Seed complete!");
  await client.end();
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
