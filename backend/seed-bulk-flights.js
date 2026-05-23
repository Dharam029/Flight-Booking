/**
 * Ensures every city has multiple flight options (2–3 departures + 2–3 arrivals)
 * and adds extra time slots on popular routes.
 */
require("dotenv").config();
const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "flight_booking.db");

const REGIONS = {
    India: ["Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Kolkata", "Goa", "Kochi", "Jaipur", "Ahmedabad"],
    China: ["Beijing", "Shanghai", "Guangzhou", "Shenzhen", "Chengdu", "Hong Kong", "Xi'an", "Hangzhou"],
    Malaysia: ["Kuala Lumpur", "Penang", "Langkawi", "Kota Kinabalu", "Johor Bahru", "Kuching"],
    Hubs: ["Singapore", "Bangkok", "Dubai", "Tokyo"],
};

const ALL_CITIES = Object.values(REGIONS).flat();
const MIN_FLIGHTS_EACH_WAY = 3;

let flightCounter = 9000;

const nextFlightNumber = () => {
    flightCounter += 1;
    return `SK${flightCounter}`;
};

const flightExists = (db, source, destination, hour) => {
    const stmt = db.prepare(
        `SELECT flight_id FROM flights
         WHERE source = ? AND destination = ? AND departure_time LIKE ?
         LIMIT 1`
    );
    stmt.bind([source, destination, `2026-%${hour}:%`]);
    const found = stmt.step();
    stmt.free();
    return found;
};

const numberExists = (db, num) => {
    const stmt = db.prepare("SELECT flight_id FROM flights WHERE flight_number = ? LIMIT 1");
    stmt.bind([num]);
    const found = stmt.step();
    stmt.free();
    return found;
};

const countForCity = (db, city, column) => {
    const stmt = db.prepare(
        `SELECT COUNT(*) as n FROM flights WHERE ${column} = ? AND status = 'scheduled'`
    );
    stmt.bind([city]);
    stmt.step();
    const row = stmt.getAsObject();
    stmt.free();
    return row.n;
};

const insertFlight = (db, source, dest, dayOffset, hour, price) => {
    let num = nextFlightNumber();
    while (numberExists(db, num)) {
        num = nextFlightNumber();
    }
    const day = String(18 + (dayOffset % 12)).padStart(2, "0");
    const dep = `2026-07-${day} ${String(hour).padStart(2, "0")}:00:00`;
    const arrHour = Math.min(hour + 2, 23);
    const arr = `2026-07-${day} ${String(arrHour).padStart(2, "0")}:30:00`;
    const cap = 140 + (hour % 3) * 20;

    db.run(
        `INSERT INTO flights (flight_number, source, destination, departure_time, arrival_time, capacity, available_seats, price)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [num, source, dest, dep, arr, cap, cap, price]
    );
    return true;
};

const getRegionPeers = (city) => {
    for (const [, cities] of Object.entries(REGIONS)) {
        if (cities.includes(city)) {
            return cities.filter((c) => c !== city);
        }
    }
    return ALL_CITIES.filter((c) => c !== city);
};

const seedBulk = async () => {
    const SQL = await initSqlJs();
    if (!fs.existsSync(dbPath)) {
        console.error("Run npm run setup-db first.");
        process.exit(1);
    }

    const db = new SQL.Database(fs.readFileSync(dbPath));
    let added = 0;

    // Remove legacy US-only sample routes so the app focuses on Asia
    db.run(
        `DELETE FROM flights WHERE source IN ('New York','Los Angeles','Chicago','Miami','Seattle','Boston','Denver','San Francisco','Austin')
         OR destination IN ('New York','Los Angeles','Chicago','Miami','Seattle','Boston','Denver','San Francisco','Austin')`
    );

    for (const city of ALL_CITIES) {
        const peers = getRegionPeers(city);
        let depCount = countForCity(db, city, "source");
        let arrCount = countForCity(db, city, "destination");

        let peerIdx = 0;
        const hours = [6, 10, 14, 18, 21];

        while (depCount < MIN_FLIGHTS_EACH_WAY && peers.length > 0) {
            const dest = peers[peerIdx % peers.length];
            const hour = hours[depCount % hours.length];
            if (!flightExists(db, city, dest, hour)) {
                const price = 45 + (depCount * 12) + (peerIdx % 5) * 8;
                insertFlight(db, city, dest, depCount + peerIdx, hour, price);
                added++;
                depCount++;
            }
            peerIdx++;
            if (peerIdx > peers.length * 3) break;
        }

        peerIdx = 0;
        while (arrCount < MIN_FLIGHTS_EACH_WAY && peers.length > 0) {
            const from = peers[peerIdx % peers.length];
            const hour = hours[(arrCount + 2) % hours.length];
            if (!flightExists(db, from, city, hour)) {
                const price = 50 + (arrCount * 11) + (peerIdx % 4) * 9;
                insertFlight(db, from, city, arrCount + peerIdx + 1, hour, price);
                added++;
                arrCount++;
            }
            peerIdx++;
            if (peerIdx > peers.length * 3) break;
        }
    }

    // Extra afternoon & evening slots on existing routes (2 more per unique route)
    const routes = db.exec(
        `SELECT DISTINCT source, destination FROM flights WHERE status = 'scheduled'`
    );
    if (routes.length > 0) {
        for (const row of routes[0].values) {
            const [source, destination] = row;
            for (const hour of [8, 16]) {
                if (!flightExists(db, source, destination, hour)) {
                    insertFlight(db, source, destination, hour, hour, 75 + (hour % 40));
                    added++;
                }
            }
        }
    }

    fs.writeFileSync(dbPath, db.export());
    db.close();

    const verifyDb = new SQL.Database(fs.readFileSync(dbPath));
    const total = verifyDb.exec("SELECT COUNT(*) FROM flights WHERE status = 'scheduled'");
    verifyDb.close();

    console.log(`Bulk seed done. Added ${added} flights.`);
    console.log(`Scheduled flights in database: ${total[0]?.values[0][0] ?? "?"}`);
};

seedBulk().catch((e) => {
    console.error(e);
    process.exit(1);
});
