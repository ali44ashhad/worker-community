import Locality from "../models/locality.model.js";

/** Default Delhi map pins — only inserted when the collection is empty. */
export const DEFAULT_LOCALITIES = [
    { name: "Sainik Farms", status: "active", x: 64, y: 70, sortOrder: 1 },
    { name: "Anupam Gardens", status: "active", x: 51, y: 70, sortOrder: 2 },
    { name: "Hauz Khas", status: "comingSoon", x: 25, y: 22, sortOrder: 3 },
    { name: "Greater Kailash", status: "comingSoon", x: 60, y: 40, sortOrder: 4 },
    { name: "Vasant Kunj", status: "comingSoon", x: 28, y: 68, sortOrder: 5 },
    { name: "Saket", status: "comingSoon", x: 42, y: 48, sortOrder: 6 },
];

export async function seedLocalitiesIfMissing() {
    const count = await Locality.countDocuments();
    if (count > 0) return;

    await Locality.insertMany(DEFAULT_LOCALITIES);
    console.log(`Seeded ${DEFAULT_LOCALITIES.length} default localities.`);
}
