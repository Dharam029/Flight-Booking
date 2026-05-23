/**
 * Adds extended routes so every listed city has at least 1–2 flights.
 * Safe to run multiple times — skips existing flight numbers.
 */
require("dotenv").config();
const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "flight_booking.db");

/** [flight_number, source, destination, departure, arrival, capacity, seats, price_usd] */
const EXTENDED_FLIGHTS = [
    // India — cover Jaipur, Ahmedabad, extra domestic links
    ["SK701", "Jaipur", "Delhi", "2026-06-18 07:00:00", "2026-06-18 08:15:00", 150, 150, 64.99],
    ["SK702", "Delhi", "Jaipur", "2026-06-18 19:00:00", "2026-06-18 20:15:00", 150, 150, 64.99],
    ["SK703", "Ahmedabad", "Mumbai", "2026-06-18 09:30:00", "2026-06-18 10:45:00", 160, 160, 59.99],
    ["SK704", "Mumbai", "Ahmedabad", "2026-06-18 16:00:00", "2026-06-18 17:15:00", 160, 160, 59.99],
    ["SK705", "Hyderabad", "Bangalore", "2026-06-18 11:00:00", "2026-06-18 12:00:00", 140, 140, 54.99],
    ["SK706", "Bangalore", "Hyderabad", "2026-06-18 20:30:00", "2026-06-18 21:30:00", 140, 140, 54.99],
    ["SK707", "Hyderabad", "Chennai", "2026-06-19 06:00:00", "2026-06-19 07:15:00", 150, 150, 49.99],
    ["SK708", "Chennai", "Hyderabad", "2026-06-19 18:00:00", "2026-06-19 19:15:00", 150, 150, 49.99],
    ["SK709", "Kochi", "Bangalore", "2026-06-19 08:00:00", "2026-06-19 09:30:00", 130, 130, 69.99],
    ["SK710", "Bangalore", "Kochi", "2026-06-19 14:00:00", "2026-06-19 15:30:00", 130, 130, 69.99],
    ["SK711", "Kochi", "Chennai", "2026-06-19 10:00:00", "2026-06-19 11:20:00", 140, 140, 59.99],
    ["SK712", "Chennai", "Kochi", "2026-06-19 21:00:00", "2026-06-19 22:20:00", 140, 140, 59.99],
    ["SK713", "Goa", "Mumbai", "2026-06-20 07:30:00", "2026-06-20 08:45:00", 120, 120, 64.99],
    ["SK714", "Mumbai", "Goa", "2026-06-20 17:00:00", "2026-06-20 18:15:00", 120, 120, 64.99],
    ["SK715", "Kolkata", "Delhi", "2026-06-20 09:00:00", "2026-06-20 11:30:00", 170, 170, 94.99],
    ["SK716", "Delhi", "Kolkata", "2026-06-20 15:00:00", "2026-06-20 17:30:00", 170, 170, 94.99],
    ["SK717", "Jaipur", "Mumbai", "2026-06-21 06:30:00", "2026-06-21 08:00:00", 150, 150, 79.99],
    ["SK718", "Ahmedabad", "Delhi", "2026-06-21 12:00:00", "2026-06-21 13:30:00", 155, 155, 72.99],

    // China — cover all cities with return / second routes
    ["SK721", "Xi'an", "Beijing", "2026-06-18 08:00:00", "2026-06-18 10:00:00", 180, 180, 99.99],
    ["SK722", "Beijing", "Xi'an", "2026-06-18 18:00:00", "2026-06-18 20:00:00", 180, 180, 99.99],
    ["SK723", "Xi'an", "Shanghai", "2026-06-19 09:00:00", "2026-06-19 11:30:00", 175, 175, 119.99],
    ["SK724", "Hangzhou", "Shanghai", "2026-06-19 07:00:00", "2026-06-19 07:50:00", 140, 140, 49.99],
    ["SK725", "Shanghai", "Hangzhou", "2026-06-19 20:00:00", "2026-06-19 20:50:00", 140, 140, 49.99],
    ["SK726", "Hangzhou", "Beijing", "2026-06-20 10:00:00", "2026-06-20 12:30:00", 170, 170, 129.99],
    ["SK727", "Shenzhen", "Guangzhou", "2026-06-20 08:30:00", "2026-06-20 09:15:00", 130, 130, 39.99],
    ["SK728", "Guangzhou", "Shenzhen", "2026-06-20 19:00:00", "2026-06-20 19:45:00", 130, 130, 39.99],
    ["SK729", "Chengdu", "Shanghai", "2026-06-21 07:00:00", "2026-06-21 09:45:00", 190, 190, 149.99],
    ["SK730", "Shanghai", "Chengdu", "2026-06-21 16:00:00", "2026-06-21 18:45:00", 190, 190, 149.99],
    ["SK731", "Chengdu", "Guangzhou", "2026-06-21 11:00:00", "2026-06-21 13:15:00", 175, 175, 109.99],
    ["SK732", "Hong Kong", "Beijing", "2026-06-18 14:00:00", "2026-06-18 17:30:00", 220, 220, 159.99],
    ["SK733", "Beijing", "Hong Kong", "2026-06-19 08:00:00", "2026-06-19 11:30:00", 220, 220, 159.99],
    ["SK734", "Hong Kong", "Shanghai", "2026-06-20 09:00:00", "2026-06-20 11:30:00", 200, 200, 129.99],
    ["SK735", "Shanghai", "Hong Kong", "2026-06-20 18:00:00", "2026-06-20 20:30:00", 200, 200, 129.99],
    ["SK736", "Shenzhen", "Shanghai", "2026-06-21 13:00:00", "2026-06-21 15:30:00", 180, 180, 119.99],

    // Malaysia — second routes per city
    ["SK741", "Kota Kinabalu", "Kuala Lumpur", "2026-06-18 10:00:00", "2026-06-18 12:30:00", 150, 150, 79.99],
    ["SK742", "Kuala Lumpur", "Kota Kinabalu", "2026-06-18 19:00:00", "2026-06-18 21:30:00", 150, 150, 79.99],
    ["SK743", "Langkawi", "Penang", "2026-06-19 08:00:00", "2026-06-19 08:45:00", 110, 110, 44.99],
    ["SK744", "Penang", "Langkawi", "2026-06-19 17:00:00", "2026-06-19 17:45:00", 110, 110, 44.99],
    ["SK745", "Kuching", "Penang", "2026-06-19 11:00:00", "2026-06-19 12:30:00", 130, 130, 64.99],
    ["SK746", "Penang", "Kuching", "2026-06-19 20:00:00", "2026-06-19 21:30:00", 130, 130, 64.99],
    ["SK747", "Johor Bahru", "Penang", "2026-06-20 07:00:00", "2026-06-20 08:30:00", 120, 120, 54.99],
    ["SK748", "Penang", "Johor Bahru", "2026-06-20 16:00:00", "2026-06-20 17:30:00", 120, 120, 54.99],
    ["SK749", "Langkawi", "Kuala Lumpur", "2026-06-20 12:00:00", "2026-06-20 13:10:00", 120, 120, 52.99],
    ["SK750", "Kuching", "Kuala Lumpur", "2026-06-21 09:00:00", "2026-06-21 10:45:00", 140, 140, 69.99],

    // Cross-region & hub cities (Singapore, Bangkok, Dubai, Tokyo)
    ["SK761", "Singapore", "Kuala Lumpur", "2026-06-18 08:00:00", "2026-06-18 09:15:00", 180, 180, 69.99],
    ["SK762", "Kuala Lumpur", "Singapore", "2026-06-18 20:00:00", "2026-06-18 21:15:00", 180, 180, 69.99],
    ["SK763", "Singapore", "Bangkok", "2026-06-19 10:00:00", "2026-06-19 11:30:00", 200, 200, 89.99],
    ["SK764", "Bangkok", "Singapore", "2026-06-19 19:00:00", "2026-06-19 20:30:00", 200, 200, 89.99],
    ["SK765", "Bangkok", "Hong Kong", "2026-06-20 07:00:00", "2026-06-20 10:30:00", 240, 240, 179.99],
    ["SK766", "Hong Kong", "Bangkok", "2026-06-20 15:00:00", "2026-06-20 18:30:00", 240, 240, 179.99],
    ["SK767", "Bangkok", "Mumbai", "2026-06-21 02:00:00", "2026-06-21 05:30:00", 280, 280, 249.99],
    ["SK768", "Mumbai", "Bangkok", "2026-06-21 22:00:00", "2026-06-22 02:30:00", 280, 280, 249.99],
    ["SK769", "Dubai", "Mumbai", "2026-06-18 04:00:00", "2026-06-18 08:30:00", 300, 300, 279.99],
    ["SK770", "Mumbai", "Dubai", "2026-06-18 21:00:00", "2026-06-19 01:30:00", 300, 300, 279.99],
    ["SK771", "Dubai", "Delhi", "2026-06-19 05:00:00", "2026-06-19 09:00:00", 290, 290, 259.99],
    ["SK772", "Delhi", "Dubai", "2026-06-19 22:00:00", "2026-06-20 02:00:00", 290, 290, 259.99],
    ["SK773", "Dubai", "Kuala Lumpur", "2026-06-20 08:00:00", "2026-06-20 14:00:00", 280, 280, 299.99],
    ["SK774", "Kuala Lumpur", "Dubai", "2026-06-20 23:00:00", "2026-06-21 05:00:00", 280, 280, 299.99],
    ["SK775", "Tokyo", "Hong Kong", "2026-06-18 11:00:00", "2026-06-18 15:30:00", 300, 300, 349.99],
    ["SK776", "Hong Kong", "Tokyo", "2026-06-19 09:00:00", "2026-06-19 13:30:00", 300, 300, 349.99],
    ["SK777", "Tokyo", "Singapore", "2026-06-20 10:00:00", "2026-06-20 16:30:00", 310, 310, 389.99],
    ["SK778", "Singapore", "Tokyo", "2026-06-20 18:00:00", "2026-06-21 00:30:00", 310, 310, 389.99],
    ["SK779", "Tokyo", "Beijing", "2026-06-21 08:00:00", "2026-06-21 12:00:00", 290, 290, 329.99],
    ["SK780", "Beijing", "Tokyo", "2026-06-21 17:00:00", "2026-06-21 21:00:00", 290, 290, 329.99],

    // Extra India ↔ Asia links (2nd routes for hub coverage)
    ["SK781", "Hyderabad", "Singapore", "2026-06-22 06:00:00", "2026-06-22 10:30:00", 250, 250, 219.99],
    ["SK782", "Singapore", "Chennai", "2026-06-22 12:00:00", "2026-06-22 14:00:00", 220, 220, 149.99],
    ["SK783", "Jaipur", "Dubai", "2026-06-22 03:00:00", "2026-06-22 06:00:00", 260, 260, 199.99],
    ["SK784", "Ahmedabad", "Bangkok", "2026-06-22 23:00:00", "2026-06-23 04:00:00", 270, 270, 229.99],
    ["SK785", "Kolkata", "Bangkok", "2026-06-23 08:00:00", "2026-06-23 11:30:00", 240, 240, 189.99],
    ["SK786", "Goa", "Dubai", "2026-06-23 14:00:00", "2026-06-23 17:30:00", 250, 250, 209.99],
    ["SK787", "Kochi", "Dubai", "2026-06-23 20:00:00", "2026-06-24 00:30:00", 260, 260, 239.99],
    ["SK788", "Guangzhou", "Kuala Lumpur", "2026-06-22 13:00:00", "2026-06-22 17:00:00", 250, 250, 199.99],
    ["SK789", "Shenzhen", "Singapore", "2026-06-23 09:00:00", "2026-06-23 13:00:00", 240, 240, 179.99],
    ["SK790", "Chengdu", "Kuala Lumpur", "2026-06-24 07:00:00", "2026-06-24 12:00:00", 270, 270, 269.99],
    ["SK791", "Xi'an", "Hong Kong", "2026-06-24 10:00:00", "2026-06-24 13:00:00", 200, 200, 169.99],
    ["SK792", "Hangzhou", "Kuala Lumpur", "2026-06-24 15:00:00", "2026-06-24 20:00:00", 260, 260, 259.99],
    ["SK793", "Kota Kinabalu", "Singapore", "2026-06-22 11:00:00", "2026-06-22 12:30:00", 140, 140, 89.99],
    ["SK794", "Langkawi", "Bangkok", "2026-06-23 07:00:00", "2026-06-23 08:30:00", 130, 130, 79.99],
    ["SK795", "Johor Bahru", "Singapore", "2026-06-23 06:00:00", "2026-06-23 06:45:00", 100, 100, 29.99],
    ["SK796", "Kuching", "Singapore", "2026-06-24 08:00:00", "2026-06-24 09:30:00", 150, 150, 94.99],
];

const flightExists = (db, flightNumber) => {
    const stmt = db.prepare("SELECT flight_id FROM flights WHERE flight_number = ? LIMIT 1");
    stmt.bind([flightNumber]);
    const found = stmt.step();
    stmt.free();
    return found;
};

const seedExtendedFlights = async () => {
    const SQL = await initSqlJs();
    if (!fs.existsSync(dbPath)) {
        console.error("Database not found. Run: npm run setup-db");
        process.exit(1);
    }

    const db = new SQL.Database(fs.readFileSync(dbPath));
    let added = 0;
    let skipped = 0;

    for (const flight of EXTENDED_FLIGHTS) {
        if (flightExists(db, flight[0])) {
            skipped++;
            continue;
        }
        db.run(
            "INSERT INTO flights (flight_number, source, destination, departure_time, arrival_time, capacity, available_seats, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            flight
        );
        added++;
    }

    fs.writeFileSync(dbPath, db.export());
    db.close();

    console.log(`Extended flights seed complete.`);
    console.log(`  Added: ${added}`);
    console.log(`  Skipped (already exist): ${skipped}`);
    console.log(`  Total in seed file: ${EXTENDED_FLIGHTS.length}`);
};

seedExtendedFlights().catch((err) => {
    console.error(err);
    process.exit(1);
});
