import { tableApi } from '../services/tableApi';
import { MOCK_TABLES } from '../components/seatmap/mockTables';

/**
 * [RAVEN & BLADE] Random Table Selection Helper
 * Selects an available table matching the party size without opening the 3D map.
 */
export function pickRandomAvailableTable(tables = [], guestCount = 2, currentTableId = null) {
  const tableList = Array.isArray(tables) && tables.length > 0 ? tables : MOCK_TABLES;
  const partySize = parseInt(guestCount, 10) || 2;

  // Filter for available tables (ignore occupied, reserved, maintenance)
  const availableTables = tableList.filter((t) => {
    const status = (t.status || 'available').toLowerCase();
    return status === 'available';
  });

  if (availableTables.length === 0) {
    // If somehow all are marked occupied/maintenance, fallback to any table
    return tableList[Math.floor(Math.random() * tableList.length)];
  }

  // Candidates excluding the currently selected table to ensure clicking shuffle changes the table
  const candidatesExcludingCurrent = availableTables.filter((t) => t.id !== currentTableId);
  const pool = candidatesExcludingCurrent.length > 0 ? candidatesExcludingCurrent : availableTables;

  // Level 1: Perfect fit (capacity >= partySize and capacity <= partySize + 2)
  const perfectFit = pool.filter((t) => t.capacity >= partySize && t.capacity <= partySize + 2);
  if (perfectFit.length > 0) {
    return perfectFit[Math.floor(Math.random() * perfectFit.length)];
  }

  // Level 2: Fits party size (capacity >= partySize)
  const fitsParty = pool.filter((t) => t.capacity >= partySize);
  if (fitsParty.length > 0) {
    return fitsParty[Math.floor(Math.random() * fitsParty.length)];
  }

  // Level 3: Any available table
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Asynchronously fetches live tables and picks a random available table
 */
export async function fetchAndPickRandomTable(guestCount = 2, currentTableId = null) {
  try {
    const liveTables = await tableApi.getTables();
    return pickRandomAvailableTable(liveTables, guestCount, currentTableId);
  } catch {
    return pickRandomAvailableTable(MOCK_TABLES, guestCount, currentTableId);
  }
}
