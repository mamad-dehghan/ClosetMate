export type SampleItem = {
  name: string;
  category: "top" | "bottom" | "dress" | "outerwear" | "shoes" | "accessory";
  imageUrl: string;
  primaryColor: string;
  seasons: string[];
  occasions: string[];
  pattern: string;
  brand?: string;
  notes?: string;
  purchasePrice?: string;
};

/**
 * Twelve pieces that can produce real outfits on day one.
 * Illustrations live in /public/sample so the demo never depends on a CDN.
 */
export const SAMPLE_ITEMS: SampleItem[] = [
  {
    name: "Ivory cotton tee",
    category: "top",
    imageUrl: "/sample/tee.svg",
    primaryColor: "#F4EFE6",
    seasons: ["spring", "summer", "autumn"],
    occasions: ["casual"],
    pattern: "solid",
    brand: "Everlane",
    purchasePrice: "28.00",
  },
  {
    name: "Striped linen shirt",
    category: "top",
    imageUrl: "/sample/shirt.svg",
    primaryColor: "#A8C3D9",
    seasons: ["spring", "summer"],
    occasions: ["casual", "work"],
    pattern: "stripe",
    brand: "Uniqlo",
    purchasePrice: "45.00",
  },
  {
    name: "Charcoal merino sweater",
    category: "top",
    imageUrl: "/sample/sweater.svg",
    primaryColor: "#3A3733",
    seasons: ["autumn", "winter"],
    occasions: ["casual", "work"],
    pattern: "knit",
    purchasePrice: "89.00",
  },
  {
    name: "Camel wool coat",
    category: "outerwear",
    imageUrl: "/sample/coat.svg",
    primaryColor: "#B08968",
    seasons: ["autumn", "winter"],
    occasions: ["work", "formal"],
    pattern: "solid",
    purchasePrice: "180.00",
  },
  {
    name: "Navy blazer",
    category: "outerwear",
    imageUrl: "/sample/blazer.svg",
    primaryColor: "#2B3A55",
    seasons: ["spring", "autumn"],
    occasions: ["work", "formal"],
    pattern: "solid",
    purchasePrice: "120.00",
  },
  {
    name: "Straight-leg jeans",
    category: "bottom",
    imageUrl: "/sample/jeans.svg",
    primaryColor: "#4A6C8C",
    seasons: ["spring", "autumn", "winter"],
    occasions: ["casual"],
    pattern: "denim",
    purchasePrice: "72.00",
  },
  {
    name: "Sand chinos",
    category: "bottom",
    imageUrl: "/sample/chinos.svg",
    primaryColor: "#D8C3A5",
    seasons: ["spring", "summer"],
    occasions: ["casual", "work"],
    pattern: "solid",
    purchasePrice: "58.00",
  },
  {
    name: "Black tailored trousers",
    category: "bottom",
    imageUrl: "/sample/trousers.svg",
    primaryColor: "#1C1A17",
    seasons: ["autumn", "winter"],
    occasions: ["work", "formal", "evening"],
    pattern: "solid",
    purchasePrice: "94.00",
  },
  {
    name: "Forest midi dress",
    category: "dress",
    imageUrl: "/sample/dress.svg",
    primaryColor: "#33493A",
    seasons: ["spring", "summer"],
    occasions: ["casual", "evening"],
    pattern: "solid",
    purchasePrice: "110.00",
  },
  {
    name: "White leather sneakers",
    category: "shoes",
    imageUrl: "/sample/sneakers.svg",
    primaryColor: "#F4EFE6",
    seasons: ["spring", "summer", "autumn"],
    occasions: ["casual"],
    pattern: "solid",
    purchasePrice: "85.00",
  },
  {
    name: "Chestnut chelsea boots",
    category: "shoes",
    imageUrl: "/sample/boots.svg",
    primaryColor: "#7A5230",
    seasons: ["autumn", "winter"],
    occasions: ["casual", "work"],
    pattern: "solid",
    purchasePrice: "140.00",
  },
  {
    name: "Canvas tote",
    category: "accessory",
    imageUrl: "/sample/tote.svg",
    primaryColor: "#EADFCB",
    seasons: ["spring", "summer", "autumn", "winter"],
    occasions: ["casual", "travel"],
    pattern: "solid",
    purchasePrice: "22.00",
  },
];
