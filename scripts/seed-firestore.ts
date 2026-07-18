import { auth, db } from '../lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const ADMIN_USER = {
  name: 'Admin User',
  email: 'chillzonestore1@gmail.com',
  password: 'admin123',
  phone: '1234567890',
};

const products = [
  // ── Vasos ───────────────────────────────────────────────
  {
    slug: 'vaso-stanley-flip-straw-safe-grey',
    name: 'Vaso Stanley Flip Straw Safe Grey',
    description: 'Vaso Stanley con tapa flip straw. Doble pared de vacío, mantiene bebidas frías por horas. Perfecto para el día a día.',
    price: 117000,
    category: 'vasos',
    modelo: 'Stanley IceFlow Flip Straw',
    capacity: '887ml',
    color: 'Safe Grey',
    image_url: '/images/vaso-grey.jpg',
    stock: 15,
    discountPct: 0,
    discountLabel: null,
  },
  {
    slug: 'vaso-stanley-flip-straw-black',
    name: 'Vaso Stanley Flip Straw Black',
    description: 'Vaso Stanley con tapa flip straw en negro mate. Acero inoxidable 18/8, libre de BPA.',
    price: 117000,
    category: 'vasos',
    modelo: 'Stanley IceFlow Flip Straw',
    capacity: '887ml',
    color: 'Black',
    image_url: '/images/vaso-black.jpg',
    stock: 12,
    discountPct: 10,
    discountLabel: '10% OFF',
  },
  {
    slug: 'vaso-stanley-quencher-peony',
    name: 'Vaso Stanley Quencher Peony',
    description: 'El icónico Quencher de Stanley en color Peony. Con asa ergonómica y ranura para sorbete.',
    price: 115000,
    category: 'vasos',
    modelo: 'Stanley Quencher H2.0',
    capacity: '887ml',
    color: 'Peony',
    image_url: '/images/vaso-peony.jpg',
    stock: 8,
    discountPct: 0,
    discountLabel: null,
  },

  // ── Termos ──────────────────────────────────────────────
  {
    slug: 'termo-stanley-system-black-800ml',
    name: 'Termo Stanley System Black 800ml',
    description: 'Termo clásico Stanley con pico cebador incluido. La tapa sirve como vaso. Ideal para el mate en el campo.',
    price: 143000,
    category: 'termos',
    modelo: 'Stanley Classic Vacuum Bottle',
    capacity: '800ml',
    color: 'Black',
    image_url: '/images/termo-system-black-800.jpg',
    stock: 10,
    discountPct: 15,
    discountLabel: 'PROMO',
  },
  {
    slug: 'termo-stanley-system-verde-800ml',
    name: 'Termo Stanley System Verde 800ml',
    description: 'Termo Stanley con pico cebador. La tapa es un mate. Mantenimiento térmico de hasta 24hs.',
    price: 143000,
    category: 'termos',
    modelo: 'Stanley Classic Vacuum Bottle',
    capacity: '800ml',
    color: 'Verde',
    image_url: '/images/termo-system-verde-800.jpg',
    stock: 10,
    discountPct: 0,
    discountLabel: null,
  },
  {
    slug: 'termo-stanley-system-black-1200ml',
    name: 'Termo Stanley System Black 1.2lt',
    description: 'Mayor capacidad para grupos. Con pico cebador y tapa-mate incluidos.',
    price: 169000,
    category: 'termos',
    modelo: 'Stanley Classic Vacuum Bottle',
    capacity: '1200ml',
    color: 'Black',
    image_url: '/images/termo-system-black-1200.jpg',
    stock: 7,
    discountPct: 0,
    discountLabel: null,
  },
  {
    slug: 'termo-stanley-system-verde-1200ml',
    name: 'Termo Stanley System Verde 1.2lt',
    description: 'Mayor capacidad en verde. Con pico cebador y tapa-mate. Para toda la jornada.',
    price: 169000,
    category: 'termos',
    modelo: 'Stanley Classic Vacuum Bottle',
    capacity: '1200ml',
    color: 'Verde',
    image_url: '/images/termo-system-verde-1200.jpg',
    stock: 7,
    discountPct: 20,
    discountLabel: '20% OFF',
  },
  {
    slug: 'termo-stanley-classic-negro-950ml',
    name: 'Termo Stanley Classic Negro 950ml',
    description: 'El clásico indestructible de Stanley. Acero inoxidable, resistente a golpes y caídas.',
    price: 131000,
    category: 'termos',
    modelo: 'Stanley Classic Legendary',
    capacity: '950ml',
    color: 'Negro',
    image_url: '/images/termo-classic-negro.jpg',
    stock: 20,
    discountPct: 0,
    discountLabel: null,
  },
  {
    slug: 'termo-stanley-adventure-to-go-1lt',
    name: 'Termo Stanley Adventure To Go 1lt',
    description: 'Liviano con asa de transporte. Boca ancha para fácil limpieza. Ideal para excursiones.',
    price: 122000,
    category: 'termos',
    modelo: 'Stanley Adventure To-Go',
    capacity: '1000ml',
    color: 'Beige/Marrón',
    image_url: '/images/termo-adventure-1lt.jpg',
    stock: 9,
    discountPct: 0,
    discountLabel: null,
  },
  {
    slug: 'termo-stanley-adventure-to-go-1300ml',
    name: 'Termo Stanley Adventure To Go 1.3lt',
    description: 'Máxima capacidad para expediciones largas. Diseño robusto con asa y boca ancha.',
    price: 135000,
    category: 'termos',
    modelo: 'Stanley Adventure To-Go',
    capacity: '1300ml',
    color: 'Blanco',
    image_url: '/images/termo-adventure-1300.jpg',
    stock: 6,
    discountPct: 0,
    discountLabel: null,
  },

  // ── Mates ───────────────────────────────────────────────
  {
    slug: 'mate-stanley-mesi-black',
    name: 'Mate Stanley Mesi Black 237ml',
    description: 'Mate de acero inoxidable con tapa de madera. Mantiene la temperatura. Diseño premium.',
    price: 67000,
    category: 'mates',
    modelo: 'Stanley Camp Mate',
    capacity: '237ml',
    color: 'Black',
    image_url: '/images/mate-mesi-black.jpg',
    stock: 25,
    discountPct: 0,
    discountLabel: null,
  },

  // ── Accesorios ──────────────────────────────────────────
  {
    slug: 'bombilla-mate-stanley-spoon',
    name: 'Bombilla Mate Stanley Spoon',
    description: 'Bombilla cuchara original Stanley. Compatible con todos los mates Stanley. Acero inoxidable.',
    price: 39900,
    category: 'accesorios',
    modelo: 'Stanley Accessories',
    capacity: null,
    color: 'Verde/Plateado',
    image_url: '/images/bombilla-spoon.jpg',
    stock: 30,
    discountPct: 0,
    discountLabel: null,
  },
];

async function main() {
  console.log('🌱 Seeding Firestore...');

  for (const p of products) {
    const { slug, ...data } = p;
    await db.collection('products').doc(slug).set({ ...data, createdAt: FieldValue.serverTimestamp() }, { merge: true });
    console.log(`  ✓ ${p.name}`);
  }
  console.log(`✅ Seeded ${products.length} products.`);

  let adminUser;
  try {
    adminUser = await auth.getUserByEmail(ADMIN_USER.email);
    console.log(`  · Admin user already exists (${adminUser.uid})`);
  } catch {
    adminUser = await auth.createUser({
      email: ADMIN_USER.email,
      password: ADMIN_USER.password,
      displayName: ADMIN_USER.name,
    });
    console.log(`  ✓ Created admin user (${adminUser.uid})`);
  }

  await db.collection('users').doc(adminUser.uid).set({
    name: ADMIN_USER.name,
    email: ADMIN_USER.email,
    phone: ADMIN_USER.phone,
    isAdmin: true,
    createdAt: FieldValue.serverTimestamp(),
  }, { merge: true });
  console.log('✅ Seeded admin user.');
}

main().catch(e => { console.error(e); process.exit(1); });
