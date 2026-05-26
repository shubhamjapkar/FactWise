export type ProductStatus = "In Stock" | "Low Stock" | "Out of Stock" | "Discontinued";

export type Product = {
  sku: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  rating: number;
  supplier: string;
  status: ProductStatus;
  lastRestocked: string; // ISO date
};

export const products: Product[] = [
  { sku: "AUR-1001", name: "Aurora Wireless Headphones", category: "Audio", price: 249.0, cost: 132.5, stock: 142, rating: 4.6, supplier: "Soundforge", status: "In Stock", lastRestocked: "2026-04-12" },
  { sku: "AUR-1002", name: "Aurora Earbuds Pro", category: "Audio", price: 179.0, cost: 88.25, stock: 38, rating: 4.4, supplier: "Soundforge", status: "Low Stock", lastRestocked: "2026-03-28" },
  { sku: "BLT-2210", name: "Bolt Mechanical Keyboard", category: "Peripherals", price: 139.99, cost: 64.0, stock: 76, rating: 4.7, supplier: "KeyWorks", status: "In Stock", lastRestocked: "2026-05-03" },
  { sku: "BLT-2215", name: "Bolt Gaming Mouse", category: "Peripherals", price: 79.5, cost: 30.0, stock: 220, rating: 4.5, supplier: "KeyWorks", status: "In Stock", lastRestocked: "2026-05-10" },
  { sku: "CMP-3050", name: "Compass 27\" 4K Monitor", category: "Displays", price: 549.0, cost: 312.0, stock: 18, rating: 4.8, supplier: "Northlight", status: "Low Stock", lastRestocked: "2026-04-22" },
  { sku: "CMP-3060", name: "Compass UltraWide 34\"", category: "Displays", price: 829.0, cost: 470.0, stock: 0, rating: 4.9, supplier: "Northlight", status: "Out of Stock", lastRestocked: "2026-02-14" },
  { sku: "DRF-4100", name: "Drift Standing Desk", category: "Furniture", price: 469.0, cost: 220.0, stock: 24, rating: 4.3, supplier: "OakHaus", status: "In Stock", lastRestocked: "2026-04-30" },
  { sku: "DRF-4110", name: "Drift Ergonomic Chair", category: "Furniture", price: 389.0, cost: 195.0, stock: 31, rating: 4.2, supplier: "OakHaus", status: "In Stock", lastRestocked: "2026-05-15" },
  { sku: "EMB-5500", name: "Ember Smart Mug 2", category: "Lifestyle", price: 129.0, cost: 52.0, stock: 84, rating: 4.1, supplier: "Hearth Co.", status: "In Stock", lastRestocked: "2026-05-19" },
  { sku: "EMB-5510", name: "Ember Travel Tumbler", category: "Lifestyle", price: 199.0, cost: 91.0, stock: 12, rating: 4.0, supplier: "Hearth Co.", status: "Low Stock", lastRestocked: "2026-03-09" },
  { sku: "FLR-6020", name: "Flare USB-C Hub 8-in-1", category: "Accessories", price: 64.99, cost: 22.5, stock: 312, rating: 4.5, supplier: "PlugPoint", status: "In Stock", lastRestocked: "2026-05-21" },
  { sku: "FLR-6025", name: "Flare 100W GaN Charger", category: "Accessories", price: 79.0, cost: 28.0, stock: 0, rating: 4.6, supplier: "PlugPoint", status: "Discontinued", lastRestocked: "2026-01-05" },
  { sku: "GRV-7300", name: "Groove Studio Microphone", category: "Audio", price: 219.0, cost: 102.0, stock: 47, rating: 4.7, supplier: "Soundforge", status: "In Stock", lastRestocked: "2026-04-18" },
  { sku: "HLO-8400", name: "Halo Ring Light Pro", category: "Studio", price: 159.0, cost: 66.5, stock: 9, rating: 4.4, supplier: "LumenLab", status: "Low Stock", lastRestocked: "2026-02-27" },
  { sku: "HLO-8410", name: "Halo Softbox Kit", category: "Studio", price: 289.0, cost: 138.0, stock: 22, rating: 4.5, supplier: "LumenLab", status: "In Stock", lastRestocked: "2026-04-02" },
  { sku: "IRS-9100", name: "Iris 4K Webcam", category: "Peripherals", price: 189.0, cost: 74.0, stock: 58, rating: 4.3, supplier: "OptiVue", status: "In Stock", lastRestocked: "2026-05-07" },
  { sku: "JET-9550", name: "Jet Portable SSD 2TB", category: "Storage", price: 219.0, cost: 96.5, stock: 96, rating: 4.8, supplier: "DataCore", status: "In Stock", lastRestocked: "2026-05-12" },
  { sku: "JET-9560", name: "Jet NVMe Enclosure", category: "Storage", price: 59.0, cost: 21.0, stock: 0, rating: 4.2, supplier: "DataCore", status: "Out of Stock", lastRestocked: "2026-03-14" },
  { sku: "KIN-9800", name: "Kinetic Smart Lamp", category: "Lifestyle", price: 99.0, cost: 38.0, stock: 134, rating: 4.0, supplier: "Hearth Co.", status: "In Stock", lastRestocked: "2026-05-22" },
  { sku: "LOO-9999", name: "Loom Cable Management Tray", category: "Accessories", price: 34.5, cost: 11.0, stock: 410, rating: 4.4, supplier: "PlugPoint", status: "In Stock", lastRestocked: "2026-05-24" },
];