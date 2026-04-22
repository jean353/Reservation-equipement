import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Démarrage du seed...');

  // --- Admin User ---
  const hashedPassword = await bcrypt.hash('Admin@1234', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@atelierit.com' },
    update: {},
    create: {
      email: 'admin@atelierit.com',
      name: 'Administrateur',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });
  console.log(`✅ Admin créé : ${admin.email}`);

  // --- Demo User ---
  const userPassword = await bcrypt.hash('User@1234', 10);
  const demoUser = await prisma.user.upsert({
    where: { email: 'user@atelierit.com' },
    update: {},
    create: {
      email: 'user@atelierit.com',
      name: 'Utilisateur Demo',
      password: userPassword,
      role: 'USER',
    },
  });
  console.log(`✅ Utilisateur demo créé : ${demoUser.email}`);

  // --- Rooms ---
  const roomsData = [
    { name: 'Akwaba', capacity: 20, location: 'Bâtiment A', description: 'Salle de réunion Akwaba.' },
    { name: 'Normandie', capacity: 15, location: 'Bâtiment A', description: 'Salle de réunion Normandie.' },
    { name: 'Cotonou', capacity: 10, location: 'Bâtiment B', description: 'Salle de réunion Cotonou.' },
    { name: 'Accra', capacity: 12, location: 'Bâtiment B', description: 'Salle de réunion Accra.' },
    { name: 'Silicon', capacity: 8, location: 'Bâtiment C', description: 'Salle de réunion Silicon.' },
    { name: 'Infotech', capacity: 25, location: 'Bâtiment C', description: 'Salle de réunion Infotech.' },
    { name: 'Ouagadougou', capacity: 18, location: 'Bâtiment D', description: 'Salle de réunion Ouagadougou.' },
    { name: 'Fablab', capacity: 30, location: 'Bâtiment D', description: 'Espace de fabrication Fablab.' },
    { name: 'DE', capacity: 5, location: 'Direction', description: 'Salle de réunion DE.' },
  ];

  for (const room of roomsData) {
    const existing = await prisma.room.findFirst({ where: { name: room.name } });
    if (!existing) {
      await prisma.room.create({ data: room });
      console.log(`🏠 Salle créée : ${room.name}`);
    }
  }

  // --- Equipment ---
  const equipmentData = [
    { name: 'Projecteur Sony VPL', type: 'Projecteur', serialNumber: 'PRJ-001', quantity: 5 },
    { name: 'Écran de projection 180"', type: 'Écran', serialNumber: 'SCR-001', quantity: 3 },
    { name: 'Système de sonorisation', type: 'Audio', serialNumber: 'AUD-001', quantity: 2 },
    { name: 'Webcam Logitech Brio', type: 'Caméra', serialNumber: 'CAM-001', quantity: 8 },
    { name: 'Tableau blanc interactif', type: 'Tableau', serialNumber: 'TWB-001', quantity: 4 },
    { name: 'Micro de conférence', type: 'Audio', serialNumber: 'MIC-001', quantity: 10 },
    { name: 'Laptop Dell XPS', type: 'Ordinateur', serialNumber: 'LAP-001', quantity: 6 },
    { name: 'Switch Réseau 24 ports', type: 'Réseau', serialNumber: 'NET-001', quantity: 2 },
  ];

  for (const eq of equipmentData) {
    const existing = await prisma.equipment.findFirst({ where: { serialNumber: eq.serialNumber } });
    if (!existing) {
      await prisma.equipment.create({ data: eq });
      console.log(`🖥️  Équipement créé : ${eq.name}`);
    }
  }

  console.log('\n✅ Seed terminé avec succès !');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Admin  : admin@atelierit.com / Admin@1234');
  console.log('  User   : user@atelierit.com  / User@1234');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
