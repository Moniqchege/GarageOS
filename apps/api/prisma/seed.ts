/**
 * Seeds MySQL with the same mock data the app used to hardcode in
 * apps/api/src/store.ts. Run with: pnpm --filter @garage/api db:seed
 * (or `npx prisma db seed` from apps/api).
 *
 * Safe to re-run — every table is cleared before reinserting, so you get a
 * clean known state each time instead of duplicate rows.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    // Clear in FK-safe order (job_lines references job_cards).
    await prisma.jobLine.deleteMany();
    await prisma.jobCard.deleteMany();
    await prisma.employee.deleteMany();
    await prisma.inventoryItem.deleteMany();
    await prisma.laborCharge.deleteMany();
    await prisma.vehicleRecord.deleteMany();
    await prisma.customerVehicle.deleteMany();
    await prisma.customerNotification.deleteMany();
    await prisma.businessSettings.deleteMany();

    // ─── Employees ───────────────────────────────────────────────────────────
    await prisma.employee.createMany({
        data: [
            { id: "EMP-001", name: "Brian Otieno",   role: "System Administrator", phone: "0722 445 981", pin: "4471", status: "Active",    lastLogin: "Today, 07:42"     },
            { id: "EMP-002", name: "Faith Wanjiru",  role: "Storekeeper",          phone: "0711 223 004", pin: "2210", status: "Active",    lastLogin: "Today, 07:15"     },
            { id: "EMP-003", name: "Dennis Mwangi",  role: "Service Advisor",      phone: "0700 998 231", pin: "8842", status: "Active",    lastLogin: "Yesterday, 17:03" },
            { id: "EMP-004", name: "Peter Kamau",    role: "Lead Mechanic",        phone: "0733 120 774", pin: "1190", status: "Active",    lastLogin: "Today, 08:02"     },
            { id: "EMP-005", name: "Grace Achieng",  role: "Lead Mechanic",        phone: "0745 662 310", pin: "5502", status: "Suspended", lastLogin: "3 days ago"       },
            { id: "EMP-006", name: "Samuel Njoroge", role: "Terminal Cashier",     phone: "0710 887 442", pin: "3390", status: "Active",    lastLogin: "Today, 08:20"     },
        ],
    });

    // ─── Inventory ───────────────────────────────────────────────────────────
    await prisma.inventoryItem.createMany({
        data: [
            { sku: "BRK-2201", name: "Brake Pads - Front Set",    fits: "Toyota NZE, Toyota Fielder", cost: 1800, price: 2800, qty: 24, low: 5,  added: "20 Aug" },
            { sku: "OIL-5540", name: "Engine Oil 20W-50 (4L)",    fits: "Universal",                  cost: 1450, price: 2100, qty: 41, low: 10, added: "18 Aug" },
            { sku: "FLT-1002", name: "Oil Filter - Standard",     fits: "Toyota, Isuzu",              cost:  250, price:  450, qty: 63, low: 15, added: "18 Aug" },
            { sku: "SUS-7734", name: "Suspension Bushing Kit",    fits: "Isuzu NPR",                  cost: 2200, price: 3500, qty:  8, low:  4, added: "12 Aug" },
            { sku: "BAT-9010", name: "Car Battery 12V 65Ah",      fits: "Universal",                  cost: 6200, price: 8900, qty:  6, low:  3, added: "10 Aug" },
            { sku: "WPR-3321", name: "Wiper Blades (Pair)",       fits: "Universal",                  cost:  600, price: 1100, qty: 30, low:  8, added: "22 Aug" },
            { sku: "FLT-2210", name: "Air Filter - Standard",     fits: "Toyota NZE, Probox",         cost:  380, price:  700, qty:  3, low:  6, added: "14 Aug" },
            { sku: "ELE-6650", name: "Headlight Bulb H4",         fits: "Universal",                  cost:  320, price:  600, qty: 22, low:  8, added: "21 Aug" },
        ],
    });

    // ─── Labor catalog ────────────────────────────────────────────────────────
    await prisma.laborCharge.createMany({
        data: [
            { code: "LBR-01", name: "Suspension Bushing Replacement", category: "Suspension",         price: 3500 },
            { code: "LBR-02", name: "Brake Pad Replacement (Front)",  category: "Brakes",              price: 1800 },
            { code: "LBR-03", name: "Full Oil Service",               category: "Engine & Servicing",  price: 1200 },
            { code: "LBR-04", name: "Battery Replacement & Test",     category: "Electrical",          price:  800 },
            { code: "LBR-05", name: "Wheel Alignment",                category: "Suspension",          price: 2000 },
            { code: "LBR-06", name: "General Diagnostics",            category: "Diagnostics",         price: 1500 },
        ],
    });

    // ─── Job cards + lines ─────────────────────────────────────────────────────
    const jobCardSeeds = [
        { id: "JC-1042", registration: "KDK 420X", customer: "James Mutiso",  phone: "0722 100 220", mechanic: "Peter Kamau",   stage: "diagnostics", startedAt: Date.now() -  12 * 60_000, faults: "Knocking sound on front left, pulls to the right when braking.", lines: [] as { type: string; name: string; price: number }[] },
        { id: "JC-1043", registration: "KCB 118Q", customer: "Angela Njeri",  phone: "0733 400 991", mechanic: "Peter Kamau",   stage: "active",      startedAt: Date.now() -  54 * 60_000, faults: "Overheating after 20 min drive.",          lines: [{ type: "labor", name: "General Diagnostics",        price: 1500 }] },
        { id: "JC-1044", registration: "KDA 902L", customer: "Moses Kiptoo",  phone: "0700 552 810", mechanic: "Grace Achieng", stage: "parts",       startedAt: Date.now() - 130 * 60_000, faults: "Battery not holding charge overnight.",    lines: [{ type: "labor", name: "Battery Replacement & Test", price:  800 }] },
        { id: "JC-1041", registration: "KBZ 220H", customer: "Lucy Wambui",   phone: "0711 900 442", mechanic: "Peter Kamau",   stage: "done",        startedAt: Date.now() - 240 * 60_000, faults: "Routine service.",                        lines: [{ type: "labor", name: "Full Oil Service",           price: 1200 }] },
    ];
    for (const jc of jobCardSeeds) {
        const { lines, ...card } = jc;
        await prisma.jobCard.create({
            data: {
                ...card,
                lines: {
                    create: lines.map((l, i) => ({ type: l.type, name: l.name, price: l.price, position: i })),
                },
            },
        });
    }

    // ─── Customers — staff roster view ───────────────────────────────────────
    await prisma.vehicleRecord.createMany({
        data: [
            { registration: "KDK 420X", customer: "James Mutiso",  phone: "0722 100 220", model: "Toyota NZE",     mileage:  84200, lastService: "12 Jun 2026", nextServiceKm:  90000, nextServiceDate: "12 Sep 2026" },
            { registration: "KCB 118Q", customer: "Angela Njeri",  phone: "0733 400 991", model: "Toyota Fielder", mileage: 112400, lastService: "02 Jul 2026", nextServiceKm: 117000, nextServiceDate: "02 Oct 2026" },
            { registration: "KDA 902L", customer: "Moses Kiptoo",  phone: "0700 552 810", model: "Isuzu NPR",      mileage:  58900, lastService: "30 Jun 2026", nextServiceKm:  63000, nextServiceDate: "30 Aug 2026" },
            { registration: "KBZ 220H", customer: "Lucy Wambui",   phone: "0711 900 442", model: "Probox",         mileage: 143200, lastService: "18 May 2026", nextServiceKm: 148000, nextServiceDate: "18 Aug 2026" },
        ],
    });

    // ─── Customer vehicles (customer-app full detail) ──────────────────────────
    await prisma.customerVehicle.create({
        data: {
            registration: "KDK 420X", model: "Toyota NZE", year: 2013, color: "Silver", mileage: 84200, health: 64, fuel: 3,
            lastService: "12 Jun 2026", nextServiceDate: "12 Sep 2026", nextServiceKm: 90000,
            activeJob: {
                id: "JC-1042", stage: "diagnostics", mechanic: "Peter Kamau",
                faults: "Knocking sound on front left, pulls to the right when braking.",
                startedAt: Date.now() - 42 * 60_000,
                estimate: [
                    { name: "Front suspension bushing replacement", price: 3500, approved: null },
                    { name: "Brake pad replacement (front)",        price: 1800, approved: null },
                ],
                awaitingApproval: true,
            },
            diagnostics: [
                { label: "Suspension — front left", severity: "warning", note: "Worn bushing detected, causing knocking on rough surfaces." },
                { label: "Brakes",                  severity: "warning", note: "Uneven pad wear, front left thinner than front right."       },
                { label: "Battery",                 severity: "ok",      note: "Holding charge normally, tested 12.6V."                      },
                { label: "Engine oil",              severity: "ok",      note: "Changed 2,600 km ago, within service interval."              },
            ],
            history: [
                { date: "12 Jun 2026", desc: "Full oil service + filter change", cost: 3200, invoice: "INV-3391" },
                { date: "02 Mar 2026", desc: "Wiper blades + headlight bulb",    cost: 1700, invoice: "INV-3204" },
                { date: "18 Dec 2025", desc: "Wheel alignment",                  cost: 2000, invoice: "INV-3012" },
            ],
        },
    });
    await prisma.customerVehicle.create({
        data: {
            registration: "KCB 118Q", model: "Toyota Fielder", year: 2016, color: "White", mileage: 112400, health: 91, fuel: 4,
            lastService: "02 Jul 2026", nextServiceDate: "02 Oct 2026", nextServiceKm: 117000,
            activeJob: undefined,
            diagnostics: [
                { label: "Engine", severity: "ok", note: "No fault codes on last diagnostic pass."         },
                { label: "Tyres",  severity: "ok", note: "Tread depth even across all four, 6mm remaining." },
            ],
            history: [
                { date: "02 Jul 2026", desc: "Full oil service",           cost: 1200, invoice: "INV-3450" },
                { date: "14 Apr 2026", desc: "Battery replacement & test", cost: 8900, invoice: "INV-3298" },
            ],
        },
    });

    // ─── Customer notifications ───────────────────────────────────────────────
    await prisma.customerNotification.createMany({
        data: [
            { type: "job",      read: false, time: "9 min ago",   title: "Diagnostics in progress",         body: "Peter has started diagnostics on your NZE (KDK 420X). We'll send an estimate for approval shortly." },
            { type: "reminder", read: false, time: "Today, 07:00", title: "Service due in 19 days",         body: "Your Fielder (KCB 118Q) is due for service by 02 Oct 2026 or 117,000 km."                         },
            { type: "promo",    read: true,  time: "Yesterday",    title: "20% off wiper blades this week", body: "Walk in or mention this offer when you book your next visit."                                      },
            { type: "invoice",  read: true,  time: "2 Jul 2026",   title: "Invoice ready — INV-3450",       body: "Your full oil service is complete. Receipt is ready to download."                                 },
        ],
    });

    // ─── Business settings ──────────────────────────────────────────────────────
    await prisma.businessSettings.create({
        data: { id: 1, name: "Kamau & Sons Auto Garage", kra: "P051234567X", vatRate: 16 },
    });

    console.log("✅ Seeded GarageOS database.");
}

main()
    .catch((err) => {
        console.error("❌ Seed failed:", err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
