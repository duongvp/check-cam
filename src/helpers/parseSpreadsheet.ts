import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export const parseSpreadsheet = (
    file: File,
    onSuccess: (data: any[]) => void,
    onError?: (err: any) => void
) => {
    const ext = file.name.split('.').pop()?.toLowerCase();

    /* ================= CSV ================= */
    if (ext === 'csv') {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => {
                onSuccess(result.data as any[]);
            },
            error: onError,
        });
        return;
    }

    /* ================= XLSX / XLS ================= */
    if (ext === 'xlsx' || ext === 'xls') {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });

                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];

                // 1️⃣ đọc raw array (không header)
                const rows = XLSX.utils.sheet_to_json(sheet, {
                    header: 1,
                    defval: '',
                }) as any[][];

                if (!rows.length) {
                    throw new Error('Empty sheet');
                }

                // 2️⃣ tìm dòng header (heuristic)
                const headerRowIndex = rows.findIndex((row) =>
                    row.some((cell) =>
                        String(cell).toLowerCase().includes('user') ||
                        String(cell).toLowerCase().includes('review') ||
                        String(cell).includes('ユーザー') ||
                        String(cell).includes('名前')
                    )
                );

                if (headerRowIndex === -1) {
                    throw new Error('Header row not found');
                }

                const headers = rows[headerRowIndex].map((h) =>
                    String(h).trim()
                );

                // 3️⃣ map data theo header
                const dataRows = rows.slice(headerRowIndex + 1);

                const json = dataRows
                    .filter((row) => row.some((cell) => cell !== ''))
                    .map((row) => {
                        const obj: any = {};
                        headers.forEach((key, idx) => {
                            obj[key] = row[idx] ?? '';
                        });
                        return obj;
                    });

                onSuccess(json);
            } catch (err) {
                onError?.(err);
            }
        };

        if (onError) {
            reader.onerror = onError;
        }
        reader.readAsArrayBuffer(file);
        return;
    }

    onError?.(`Unsupported file type: ${ext}`);
};
