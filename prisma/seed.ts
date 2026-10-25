import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";
import type {
  BatchStatus,
  EquipmentType,
  PhysicalState,
  Role,
  TrackingStatus,
} from "../src/generated/prisma/enums.js";

const databaseUrl = process.env["DATABASE_URL"];
if (!databaseUrl) throw new Error("DATABASE_URL não definida no .env");

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

const ADMIN_EMAIL = process.env["ADMIN_EMAIL"] ?? "admin@greencode.com";
const ADMIN_PASSWORD = process.env["ADMIN_PASSWORD"] ?? "Admin@1234";
const USER_PASSWORD = process.env["SEED_USER_PASSWORD"] ?? "Demo@1234";

const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n: number) => new Date(Date.now() - n * DAY);
const daysAhead = (n: number) => new Date(Date.now() + n * DAY);

const TRIAGEM: TrackingStatus[] = ["EM_TRIAGEM"];
const DESMONTE: TrackingStatus[] = [
  "EM_TRIAGEM",
  "AGUARDANDO_DESMONTE",
  "EM_DESMONTE",
];
const PATH: Record<TrackingStatus, TrackingStatus[]> = {
  AGUARDANDO_TRIAGEM: [],
  EM_TRIAGEM: TRIAGEM,
  AGUARDANDO_DESMONTE: ["EM_TRIAGEM", "AGUARDANDO_DESMONTE"],
  EM_DESMONTE: DESMONTE,
  PECAS_REAPROVEITADAS: [...DESMONTE, "PECAS_REAPROVEITADAS"],
  MATERIAL_RECICLAVEL: [...DESMONTE, "MATERIAL_RECICLAVEL"],
  DESCARTE_SEGURO: ["EM_TRIAGEM", "DESCARTE_SEGURO"],
  BAIXA_DEFINITIVA: ["EM_TRIAGEM", "DESCARTE_SEGURO", "BAIXA_DEFINITIVA"],
};

type EquipmentSeed = {
  type: EquipmentType;
  brand: string;
  model: string;
  year: number;
  state: PhysicalState;
  weight: number;
  status: TrackingStatus;
  drop?: { from: PhysicalState; justification: string };
};

type MovementSeed = {
  origin: string;
  destination: string;
  fromStatus: TrackingStatus;
  toStatus: TrackingStatus;
  performedById: string;
  performedAt: Date;
  fromPhysicalState?: PhysicalState;
  toPhysicalState?: PhysicalState;
  justification?: string;
};

type BatchSeed = {
  invoice: string;
  carrier: string;
  status: BatchStatus;
  enteredDaysAgo: number;
  obs?: string;
  deactivate?: boolean;
  equipments: EquipmentSeed[];
};

async function seedUsers() {
  const roles: { role: Role; username: string; email: string; pass: string }[] =
    [
      {
        role: "ADMIN",
        username: "Administrador",
        email: ADMIN_EMAIL,
        pass: ADMIN_PASSWORD,
      },
      {
        role: "OPERADOR",
        username: "Olívia Operadora",
        email: "operador@greencode.com",
        pass: USER_PASSWORD,
      },
      {
        role: "GESTOR",
        username: "Gabriel Gestor",
        email: "gestor@greencode.com",
        pass: USER_PASSWORD,
      },
      {
        role: "AUDITOR",
        username: "Alice Auditora",
        email: "auditor@greencode.com",
        pass: USER_PASSWORD,
      },
    ];

  const users: Record<string, { id: string }> = {};

  for (const u of roles) {
    const admin = users["ADMIN"];
    users[u.role] = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        username: u.username,
        email: u.email,
        passwordHash: await bcrypt.hash(u.pass, 10),
        role: u.role,
        ...(admin && { createdById: admin.id }),
      },
      select: { id: true },
    });
  }

  return users as Record<Role, { id: string }>;
}

async function seedSettings(adminId: string) {
  const existing = await prisma.systemSetting.findFirst();
  if (existing) return;
  await prisma.systemSetting.create({
    data: { taxRate: 10, depreciationRate: 15, updatedById: adminId },
  });
}

async function seedOrganization(
  adminId: string,
  org: {
    name: string;
    cnpj: string;
    email: string;
    city: string;
    uf: string;
    contract?: { signedDaysAgo: number; expiresInDays: number; value: number };
  },
) {
  const { contract, ...data } = org;

  const created = await prisma.organization.upsert({
    where: { cnpj: org.cnpj },
    update: {},
    create: {
      ...data,
      stateRegistration: "123456789",
      phoneNumber: "(11) 4002-8922",
      cep: "01310-100",
      publicPlace: "Avenida Paulista",
      number: "1000",
      neighbourhood: "Bela Vista",
      createdById: adminId,
    },
    select: { id: true },
  });

  if (contract) {
    await prisma.contract.upsert({
      where: { orgId: created.id },
      update: {},
      create: {
        orgId: created.id,
        signedAt: daysAgo(contract.signedDaysAgo),
        expiresAt:
          contract.expiresInDays >= 0
            ? daysAhead(contract.expiresInDays)
            : daysAgo(-contract.expiresInDays),
        clauses: [
          { title: "Coleta", description: "Coleta semanal de equipamentos" },
          {
            title: "Certificação",
            description: "Emissão de certificado de destinação",
          },
        ],
        monthlyValue: contract.value,
        autoRenewal: contract.expiresInDays >= 0,
        createdById: adminId,
      },
    });
  }

  return created.id;
}

async function seedBatch(
  orgId: string,
  b: BatchSeed,
  creatorId: string,
  performerId: string,
) {
  const enteredAt = daysAgo(b.enteredDaysAgo);

  const batch = await prisma.batch.create({
    data: {
      orgId,
      enteredAt,
      invoice: b.invoice,
      carrier: b.carrier,
      status: b.status,
      obs: b.obs,
      createdById: creatorId,
    },
    select: { id: true },
  });

  for (const [index, e] of b.equipments.entries()) {
    const steps = PATH[e.status];
    let from: TrackingStatus = "AGUARDANDO_TRIAGEM";

    const movements: MovementSeed[] = steps.map((to, i) => {
      const movement: MovementSeed = {
        origin: from,
        destination: to,
        fromStatus: from,
        toStatus: to,
        performedById: performerId,
        performedAt: new Date(
          enteredAt.getTime() + (i + 1) * 6 * 60 * 60 * 1000,
        ),
      };
      from = to;
      return movement;
    });

    if (e.drop) {
      movements.push({
        origin: e.status,
        destination: e.status,
        fromStatus: e.status,
        toStatus: e.status,
        performedById: performerId,
        performedAt: new Date(
          enteredAt.getTime() + (movements.length + 1) * 6 * 60 * 60 * 1000,
        ),
        fromPhysicalState: e.drop.from,
        toPhysicalState: e.state,
        justification: e.drop.justification,
      });
    }

    await prisma.equipment.create({
      data: {
        batchId: batch.id,
        type: e.type,
        brand: e.brand,
        model: e.model,
        manufacturingYear: e.year,
        physicalState: e.state,
        weightKG: e.weight,
        status: e.status,
        batchPosition: index + 1,
        createdById: creatorId,
        version: movements.length,
        movements: { create: movements },
      },
    });
  }

  if (b.deactivate) {
    await prisma.batch.update({
      where: { id: batch.id },
      data: {
        active: false,
        version: { increment: 1 },
        updatedById: creatorId,
      },
    });
  }
}

async function main() {
  const users = await seedUsers();
  const adminId = users.ADMIN.id;
  const operadorId = users.OPERADOR.id;
  const gestorId = users.GESTOR.id;

  await seedSettings(adminId);

  const orgValida = await seedOrganization(operadorId, {
    name: "EcoTech Soluções Ltda",
    cnpj: "11222333000181",
    email: "contato@ecotech.com.br",
    city: "São Paulo",
    uf: "SP",
    contract: { signedDaysAgo: 120, expiresInDays: 245, value: 8500 },
  });

  const orgVencida = await seedOrganization(operadorId, {
    name: "Reciclar Informática S.A.",
    cnpj: "11444777000161",
    email: "financeiro@reciclar.com.br",
    city: "Campinas",
    uf: "SP",
    contract: { signedDaysAgo: 400, expiresInDays: -30, value: 4200.5 },
  });

  await seedOrganization(operadorId, {
    name: "Verde Hardware ME",
    cnpj: "45723174000110",
    email: "oi@verdehardware.com.br",
    city: "Curitiba",
    uf: "PR",
  });

  const orgInativa = await seedOrganization(operadorId, {
    name: "Antiga Data Center Ltda",
    cnpj: "06040988000107",
    email: "adm@antigadc.com.br",
    city: "Rio de Janeiro",
    uf: "RJ",
    contract: { signedDaysAgo: 200, expiresInDays: 165, value: 12000 },
  });

  await prisma.batch.deleteMany({
    where: { orgId: { in: [orgValida, orgVencida, orgInativa] } },
  });

  const lotes: { orgId: string; batch: BatchSeed }[] = [
    {
      orgId: orgValida,
      batch: {
        invoice: "NF-2026-0001",
        carrier: "TransVerde Logística",
        status: "RECEBIDO",
        enteredDaysAgo: 3,
        obs: "Lote recém-chegado, aguardando triagem",
        equipments: [
          {
            type: "NOTEBOOK",
            brand: "Dell",
            model: "Latitude 5420",
            year: 2021,
            state: "BOM_ESTADO",
            weight: 1.65,
            status: "AGUARDANDO_TRIAGEM",
          },
          {
            type: "MONITOR",
            brand: "LG",
            model: "24MK430H",
            year: 2020,
            state: "USADO_LEVE",
            weight: 3.2,
            status: "AGUARDANDO_TRIAGEM",
          },
          {
            type: "COMPUTADOR_MESA",
            brand: "HP",
            model: "ProDesk 400",
            year: 2019,
            state: "USADO_MODERADO",
            weight: 6.8,
            status: "AGUARDANDO_TRIAGEM",
          },
        ],
      },
    },
    {
      orgId: orgValida,
      batch: {
        invoice: "NF-2026-0002",
        carrier: "TransVerde Logística",
        status: "EM_TRIAGEM",
        enteredDaysAgo: 12,
        equipments: [
          {
            type: "SERVIDOR",
            brand: "Dell",
            model: "PowerEdge R340",
            year: 2018,
            state: "USADO_MODERADO",
            weight: 14.5,
            status: "EM_TRIAGEM",
          },
          {
            type: "NOTEBOOK",
            brand: "Lenovo",
            model: "ThinkPad T480",
            year: 2018,
            state: "DANIFICADO_GRAVE",
            weight: 1.9,
            status: "EM_TRIAGEM",
            drop: {
              from: "BOM_ESTADO",
              justification:
                "Placa-mãe com oxidação severa por contato com líquido",
            },
          },
          {
            type: "IMPRESSORA",
            brand: "Epson",
            model: "L3150",
            year: 2019,
            state: "USADO_LEVE",
            weight: 4.1,
            status: "AGUARDANDO_DESMONTE",
          },
          {
            type: "ROTEADOR",
            brand: "TP-Link",
            model: "Archer C6",
            year: 2022,
            state: "BOM_ESTADO",
            weight: 0.4,
            status: "EM_TRIAGEM",
          },
        ],
      },
    },
    {
      orgId: orgValida,
      batch: {
        invoice: "NF-2026-0003",
        carrier: "Rápido Express",
        status: "TRIAGEM_CONCLUIDA",
        enteredDaysAgo: 25,
        equipments: [
          {
            type: "COMPUTADOR_MESA",
            brand: "Positivo",
            model: "Master D3400",
            year: 2017,
            state: "USADO_MODERADO",
            weight: 7.2,
            status: "AGUARDANDO_DESMONTE",
          },
          {
            type: "MONITOR",
            brand: "Samsung",
            model: "S22F350",
            year: 2016,
            state: "DANIFICADO_LEVE",
            weight: 3.6,
            status: "AGUARDANDO_DESMONTE",
          },
          {
            type: "FONTE_ALIMENTACAO",
            brand: "Corsair",
            model: "CV550",
            year: 2018,
            state: "INSERVIVEL",
            weight: 1.2,
            status: "DESCARTE_SEGURO",
            drop: {
              from: "USADO_LEVE",
              justification: "Capacitores estufados, risco de incêndio",
            },
          },
        ],
      },
    },
    {
      orgId: orgValida,
      batch: {
        invoice: "NF-2026-0004",
        carrier: "Rápido Express",
        status: "ENCAMINHADO",
        enteredDaysAgo: 45,
        obs: "Encaminhado para a recicladora parceira",
        equipments: [
          {
            type: "NOTEBOOK",
            brand: "Acer",
            model: "Aspire 5",
            year: 2017,
            state: "DANIFICADO_LEVE",
            weight: 2.1,
            status: "EM_DESMONTE",
          },
          {
            type: "SERVIDOR",
            brand: "HPE",
            model: "ProLiant DL360",
            year: 2015,
            state: "USADO_MODERADO",
            weight: 16.8,
            status: "PECAS_REAPROVEITADAS",
          },
          {
            type: "CABO_ESTRUTURADO",
            brand: "Furukawa",
            model: "Cat6 (rolo)",
            year: 2014,
            state: "USADO_LEVE",
            weight: 9.5,
            status: "MATERIAL_RECICLAVEL",
          },
        ],
      },
    },
    {
      orgId: orgVencida,
      batch: {
        invoice: "NF-2026-0101",
        carrier: "EcoLog Transportes",
        status: "FINALIZADO",
        enteredDaysAgo: 80,
        obs: "Lote concluído (contrato da organização já vencido)",
        equipments: [
          {
            type: "IMPRESSORA",
            brand: "HP",
            model: "LaserJet P1102",
            year: 2013,
            state: "INSERVIVEL",
            weight: 5.3,
            status: "BAIXA_DEFINITIVA",
            drop: {
              from: "USADO_MODERADO",
              justification: "Unidade de imagem queimada, sem reparo",
            },
          },
          {
            type: "COMPUTADOR_MESA",
            brand: "Dell",
            model: "OptiPlex 3010",
            year: 2012,
            state: "DANIFICADO_GRAVE",
            weight: 8.0,
            status: "PECAS_REAPROVEITADAS",
          },
        ],
      },
    },
    {
      orgId: orgInativa,
      batch: {
        invoice: "NF-2026-0201",
        carrier: "EcoLog Transportes",
        status: "RECEBIDO",
        enteredDaysAgo: 60,
        obs: "Lote inativado junto com a organização",
        deactivate: true,
        equipments: [
          {
            type: "SERVIDOR",
            brand: "IBM",
            model: "System x3550",
            year: 2014,
            state: "USADO_MODERADO",
            weight: 15.2,
            status: "AGUARDANDO_TRIAGEM",
          },
          {
            type: "ROTEADOR",
            brand: "Cisco",
            model: "RV340",
            year: 2019,
            state: "BOM_ESTADO",
            weight: 1.1,
            status: "AGUARDANDO_TRIAGEM",
          },
        ],
      },
    },
  ];

  for (const { orgId, batch } of lotes) {
    await seedBatch(orgId, batch, gestorId, gestorId);
  }

  await prisma.organization.update({
    where: { id: orgInativa },
    data: { active: false, version: { increment: 1 }, updatedById: adminId },
  });

  const [orgs, batches, equipments, movements] = await Promise.all([
    prisma.organization.count(),
    prisma.batch.count(),
    prisma.equipment.count(),
    prisma.movement.count(),
  ]);

  console.log("Seed concluído:");
  console.log(`  usuários: ADMIN, OPERADOR, GESTOR, AUDITOR`);
  console.log(
    `  ${orgs} organizações, ${batches} lotes, ${equipments} equipamentos, ${movements} movimentações`,
  );
  console.log(`  login admin: ${ADMIN_EMAIL}`);
}

main()
  .catch((e) => {
    console.error("Falha ao executar o seed:", e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
