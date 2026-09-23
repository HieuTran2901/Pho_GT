package com.pho1986.backend.service;

import com.pho1986.backend.model.entity.DiningTable;

import java.text.Normalizer;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

/**
 * Normalized O(T) index for fast O(1) table lookup by id, name, normalized forms, and aliases.
 * Replaces O(T x O) nested loop scans in TableService.
 */
public class TableIndex {

    private final Map<String, DiningTable> lookupMap;
    private final Map<Integer, DiningTable> floor1NumberMap;

    private TableIndex(Map<String, DiningTable> lookupMap, Map<Integer, DiningTable> floor1NumberMap) {
        this.lookupMap = lookupMap;
        this.floor1NumberMap = floor1NumberMap;
    }

    public static TableIndex build(Iterable<DiningTable> tables) {
        Map<String, DiningTable> map = new HashMap<>();
        Map<Integer, DiningTable> f1Map = new HashMap<>();

        if (tables == null) {
            return new TableIndex(map, f1Map);
        }

        // Pass 1: Index exact IDs and exact/normalized names for ALL tables first
        // Prevents synthetic aliases of floor 1 tables from shadowing exact identifiers of other tables
        for (DiningTable table : tables) {
            if (table == null) {
                continue;
            }

            String tableId = table.getId() != null ? table.getId() : "";
            String tableName = table.getName() != null ? table.getName() : "";

            String rawId = tableId.trim().toLowerCase(Locale.ROOT);
            String rawName = tableName.trim().toLowerCase(Locale.ROOT);

            if (!rawId.isEmpty()) {
                map.putIfAbsent(rawId, table);
            }
            if (!rawName.isEmpty()) {
                map.putIfAbsent(rawName, table);
            }

            String normId = normalize(tableId);
            String normName = normalize(tableName);

            if (!normId.isEmpty()) {
                map.putIfAbsent(normId, table);
            }
            if (!normName.isEmpty()) {
                map.putIfAbsent(normName, table);
            }
        }

        // Pass 2: Register Floor 1 numeric aliases and digit map without overwriting exact identifiers
        for (DiningTable table : tables) {
            if (table == null) {
                continue;
            }

            String tableName = table.getName() != null ? table.getName() : "";
            String normName = normalize(tableName);

            boolean isFloor1Ban = table.getFloor() != null && table.getFloor() == 1 && normName.startsWith("ban");
            if (isFloor1Ban) {
                String digitsOnlyTable = tableName.replaceAll("[^0-9]", "");
                if (!digitsOnlyTable.isEmpty()) {
                    try {
                        int tableNum = Integer.parseInt(digitsOnlyTable);
                        f1Map.putIfAbsent(tableNum, table);

                        // Pre-populate canonical floor 1 aliases
                        map.putIfAbsent(String.valueOf(tableNum), table);
                        map.putIfAbsent(String.format(Locale.ROOT, "%02d", tableNum), table);
                        map.putIfAbsent("ban" + tableNum, table);
                        map.putIfAbsent("ban" + String.format(Locale.ROOT, "%02d", tableNum), table);
                        map.putIfAbsent("b" + tableNum, table);
                        map.putIfAbsent("b" + String.format(Locale.ROOT, "%02d", tableNum), table);
                    } catch (NumberFormatException ignored) {
                        // Ignore unparseable numbers
                    }
                }
            }
        }

        return new TableIndex(map, f1Map);
    }

    /**
     * Resolves an identifier to DiningTable in O(1) time.
     * Guaranteed exact equivalence with TableService.matchesTableIdentifier.
     */
    public DiningTable find(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            return null;
        }

        String raw = identifier.trim().toLowerCase(Locale.ROOT);

        // 1. Direct match on tableId or tableName (lowercase)
        DiningTable table = lookupMap.get(raw);
        if (table != null) {
            return table;
        }

        // 2. Normalized match (diacritics removed, '-' and whitespace removed)
        String normRaw = normalize(raw);
        table = lookupMap.get(normRaw);
        if (table != null) {
            return table;
        }

        // 3. Fallback digit-matching for floor 1 only
        boolean isFloor2OrSpecial = normRaw.contains("cong") || normRaw.contains("tranh")
                || normRaw.contains("vip") || normRaw.contains("tra");
        if (!isFloor2OrSpecial) {
            String digitsOnlyRaw = raw.replaceAll("[^0-9]", "");
            if (!digitsOnlyRaw.isEmpty()) {
                try {
                    int num = Integer.parseInt(digitsOnlyRaw);
                    return floor1NumberMap.get(num);
                } catch (NumberFormatException ignored) {
                    // Ignore unparseable numbers
                }
            }
        }

        return null;
    }

    public static String normalize(String s) {
        if (s == null) {
            return "";
        }
        String trimmed = s.trim().toLowerCase(Locale.ROOT);
        return Normalizer.normalize(trimmed, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replace("đ", "d")
                .replace("Đ", "d")
                .replace("-", "")
                .replaceAll("[\\s\\u00A0]+", "");
    }
}
