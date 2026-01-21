import { useMemo } from 'react';

/* ================= TYPES ================= */

type LogRow = {
    ConfirmedBy?: string;
    ConfirmedAtJST?: string; // time nhân viên check
};

type ReportRow = {
    reviewer?: string;
    date?: string; // 15+16/1/2026 | 15/1 + 16/1
    reported_count?: string;
};

export type SummaryRow = {
    reviewer: string;
    date: string;            // date từ report
    confirmDates: string[];  // các ngày confirm thực tế
    actual: number;
    reported: number;
    diff: number;
    status: 'OK' | 'MISMATCH';
};

/* ================= HELPERS ================= */

/**
 * Normalize ConfirmedAtJST → yyyy-mm-dd
 */
const normalizeConfirmedDate = (raw?: string): string => {
    if (!raw) return '';

    const datePart = raw.split(' ')[0];

    // yyyy-mm-dd
    if (datePart.includes('-')) {
        const [y, m, d] = datePart.split('-');
        if (y && m && d) {
            return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        }
        return '';
    }

    // m/d/yyyy
    if (datePart.includes('/')) {
        const [m, d, y] = datePart.split('/');
        if (y && m && d) {
            return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        }
    }

    return '';
};

/**
 * Parse report date string to list of yyyy-mm-dd
 * ex:
 *  - 15+16/1/2026
 *  - 15/1 + 16/1
 */
const parseReportDates = (raw?: string): string[] => {
    if (!raw) return [];

    const cleaned = raw.replace(/\s+/g, '');
    const parts = cleaned.split(/[+,]/);

    const yearMatch = cleaned.match(/\d{4}/);
    const year = yearMatch?.[0];

    return parts
        .map((p) => {
            const seg = p.split('/');

            // d/m/yyyy
            if (seg.length === 3) {
                const [d, m, y] = seg;
                return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
            }

            // d/m (lấy year phía sau)
            if (seg.length === 2 && year) {
                const [d, m] = seg;
                return `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
            }

            return '';
        })
        .filter(Boolean);
};

/* ================= HOOK ================= */

export const usePerformanceSummary = (
    logData: LogRow[],
    reportData: ReportRow[]
) => {
    return useMemo<SummaryRow[]>(() => {
        if (!logData.length || !reportData.length) return [];

        /**
         * 1️⃣ Build map:
         * reviewer -> date -> count
         */
        const actualMap: Record<string, Record<string, number>> = {};

        logData.forEach((row) => {
            if (!row.ConfirmedBy || !row.ConfirmedAtJST) return;

            const date = normalizeConfirmedDate(row.ConfirmedAtJST);
            if (!date) return;

            if (!actualMap[row.ConfirmedBy]) {
                actualMap[row.ConfirmedBy] = {};
            }

            actualMap[row.ConfirmedBy][date] =
                (actualMap[row.ConfirmedBy][date] || 0) + 1;
        });

        /**
         * 2️⃣ Merge với report
         */
        return reportData.map((row) => {
            const reviewer = row.reviewer ?? 'UNKNOWN';
            const reported = Number(row.reported_count ?? 0);

            const reportDates = parseReportDates(row.date);

            const confirmDatesMap = actualMap[reviewer] || {};

            const confirmDates = Object.keys(confirmDatesMap).sort();

            const actual = confirmDates.reduce(
                (sum, d) => sum + confirmDatesMap[d],
                0
            );

            return {
                reviewer,
                date: row.date ?? '',
                confirmDates,
                actual,
                reported,
                diff: actual - reported,
                status: actual === reported ? 'OK' : 'MISMATCH',
            };
        });
    }, [logData, reportData]);
};
