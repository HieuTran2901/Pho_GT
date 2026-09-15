import { tableApi } from '../services/tableApi';
import { MOCK_TABLES } from '../components/seatmap/mockTables';

/**
 * Random Table Selection Helper
 * Selects an available table matching the party size without opening the 3D map.
 */
export function pickRandomAvailableTable(tables = [], guestCount = 2, currentTableId = null) {
  const tableList = Array.isArray(tables) && tables.length > 0 ? tables : MOCK_TABLES;
  const partySize = parseInt(guestCount, 10) || 2;

  // Filter strictly for available tables (eliminate maintenance, occupied, reserved)
  const availableTables = tableList.filter((t) => {
    const status = (t.status || '').toLowerCase().trim();
    return status === 'available';
  });

  if (availableTables.length === 0) {
    // Tuyệt đối không fallback sang bàn đang bảo trì/đã đặt
    return null;
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

/**
 * Checks whether a given table is still available (not maintenance/occupied/reserved)
 */
export async function checkTableStillAvailable(tableIdOrName) {
  if (!tableIdOrName) return true;
  try {
    const liveTables = await tableApi.getTables();
    if (!Array.isArray(liveTables) || liveTables.length === 0) return true;
    const target = String(tableIdOrName).trim().toLowerCase();
    const found = liveTables.find((t) => {
      const tid = (t.id || '').trim().toLowerCase();
      const tname = (t.name || '').trim().toLowerCase();
      return tid === target || tname === target;
    });
    if (!found) return true;
    const status = (found.status || '').toLowerCase().trim();
    return status === 'available';
  } catch {
    return true;
  }
}
