import Papa from 'papaparse';
import * as XLSX from 'xlsx';

/* ==========================================================================
   1. INTERFACES & TYPES DEFINITION
   ========================================================================== */

export interface ReviewData {
    [key: string]: any;
}

export interface AssignmentData {
    "ユーザーID"?: string;
    "reviewer"?: string;
    "name"?: string;
    "date"?: string;
    "count"?: number | string;
    [key: string]: any;
}

export interface CompareResultRow {
    reviewerId?: string;
    name: string;
    associatedUsers?: string[];
    date: string;
    confirmDates: string[];
    actual: number;
    reported: number;
    diff: number;
    status: 'OK' | 'MISMATCH';
}

export interface FinalCompareReport {
    byUser: CompareResultRow[];
    byName: CompareResultRow[];
}

/* ==========================================================================
   2. CORE UTILS (HÀM CHUẨN HÓA)
   ========================================================================== */

export const normalizeUserId = (id: any): string => {
    if (!id) return '';
    let clean = String(id).trim().toUpperCase();
    if (/^NQY\d+$/.test(clean)) {
        clean = clean.replace('NQY', 'NQY-');
    }
    return clean;
};

/* ==========================================================================
   3. SPREADSHEET PARSER FUNCTION (HÀM ĐỌC FILE)
   ========================================================================== */

export const parseSpreadsheet = (
    file: File,
    onSuccess: (data: any[]) => void,
    onError?: (err: any) => void
) => {
    const ext = file.name.split('.').pop()?.toLowerCase();

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

    if (ext === 'xlsx' || ext === 'xls') {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];

                const rows = XLSX.utils.sheet_to_json(sheet, {
                    header: 1,
                    defval: '',
                }) as any[][];

                if (!rows.length) throw new Error('Empty sheet');

                const headerRowIndex = rows.findIndex((row) =>
                    row.some((cell) =>
                        String(cell).toLowerCase().includes('user') ||
                        String(cell).toLowerCase().includes('review') ||
                        String(cell).includes('ユーザー') ||
                        String(cell).includes('名前') ||
                        String(cell).toLowerCase().includes('count')
                    )
                );

                if (headerRowIndex === -1) throw new Error('Header row not found');

                const headers = rows[headerRowIndex].map((h) => String(h).trim());
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
        reader.readAsArrayBuffer(file);
        return;
    }
    onError?.(`Unsupported file type: ${ext}`);
};

/* ==========================================================================
   4. COMPARE LOGIC FUNCTION (ĐÃ FIX LỖI KHÔNG NHẬN DIỆN CHỮ HOA/THƯỜNG)
   ========================================================================== */

export const compareReviewData = (
    reviewList: ReviewData[],
    assignmentList: AssignmentData[]
): FinalCompareReport => {

    // Tạo bộ bản đồ tra cứu thông tin phân công của từng User ID
    const userAssignmentMap: Record<string, { name: string; dateStr: string }> = {};

    // Map lưu cấu hình chỉ tiêu (reported) theo cặp [Người được chia + Ngày]
    const nameDateConfigMap: Record<string, { reported: number; users: Set<string> }> = {};

    assignmentList.forEach((item) => {
        // Tìm key linh hoạt phòng trường hợp file Excel viết hoa viết thường khác nhau
        const keyReviewer = Object.keys(item).find(k => k.trim() === 'ユーザーID' || k.trim().toLowerCase() === 'reviewer') || '';
        const keyName = Object.keys(item).find(k => k.trim().toLowerCase() === 'name') || '';
        const keyDate = Object.keys(item).find(k => k.trim().toLowerCase() === 'date') || '';
        const keyCount = Object.keys(item).find(k => k.trim().toLowerCase() === 'count') || '';

        const rawId = keyReviewer ? item[keyReviewer] : '';
        const reviewerId = normalizeUserId(rawId);
        const name = keyName ? String(item[keyName] || '').trim() : '';
        const dateStr = keyDate ? String(item[keyDate] || '').trim() : '';
        const fileCount = keyCount ? Number(item[keyCount] || 0) : 0;

        if (!reviewerId || !name || !dateStr) return;

        // Lưu thông tin gán tài khoản phụ về cho Nhân viên chính
        userAssignmentMap[reviewerId] = { name, dateStr };

        // Gom nhóm chỉ tiêu theo [Người Được Chia + Ngày Báo Cáo]
        const nameDateKey = `${name}_${dateStr}`;
        if (!nameDateConfigMap[nameDateKey]) {
            nameDateConfigMap[nameDateKey] = {
                reported: fileCount, // Nhận số lượng tổng từ cột count của dòng đầu tiên gán trúng
                users: new Set<string>()
            };
        } else {
            // Nếu một người có nhiều nick phụ xuất hiện trên nhiều dòng, lấy giá trị count lớn nhất được ghi
            if (fileCount > nameDateConfigMap[nameDateKey].reported) {
                nameDateConfigMap[nameDateKey].reported = fileCount;
            }
        }
        nameDateConfigMap[nameDateKey].users.add(reviewerId);
    });

    // Các bộ map tích lũy số liệu Thực tế (Actual) và Ngày thao tác (ConfirmDates)
    const userActualMap: Record<string, { actual: number; confirmDates: Set<string>; name: string; date: string }> = {};
    const nameActualMap: Record<string, { actual: number; confirmDates: Set<string> }> = {};

    reviewList.forEach((row) => {
        const rawReviewer = row['確認者名'] || row['reviewer'] || '';
        const reviewerId = normalizeUserId(rawReviewer);

        // Bỏ qua dòng trống chưa có ai duyệt thực tế trong file log kết quả
        if (!reviewerId) return;

        const rawConfirmDate = row['確認日時'] || row['日付'] || '';
        let confirmDateStr = 'Chưa rõ';
        if (rawConfirmDate) {
            confirmDateStr = String(rawConfirmDate).split(' ')[0].trim();
        }

        const assign = userAssignmentMap[reviewerId];

        // Tích lũy thực tế cho TAB 1: Từng tài khoản User
        const userKey = `${reviewerId}_${assign ? assign.dateStr : 'Chưa gán ca'}`;
        if (!userActualMap[userKey]) {
            userActualMap[userKey] = {
                actual: 0,
                confirmDates: new Set(),
                name: assign ? assign.name : 'Tài khoản lạ',
                date: assign ? assign.dateStr : 'Không có'
            };
        }
        userActualMap[userKey].actual += 1;
        userActualMap[userKey].confirmDates.add(confirmDateStr);

        // Tích lũy thực tế cho TAB 2: Người được chia (Gộp chung tất cả nick phụ của người đó lại)
        if (assign) {
            const nameDateKey = `${assign.name}_${assign.dateStr}`;
            if (!nameActualMap[nameDateKey]) {
                nameActualMap[nameDateKey] = { actual: 0, confirmDates: new Set() };
            }
            nameActualMap[nameDateKey].actual += 1;
            nameActualMap[nameDateKey].confirmDates.add(confirmDateStr);
        }
    });

    // 🌟 KẾT XUẤT TAB 1: THỐNG KÊ THEO TỪNG USER (Đã ẩn cột Báo cáo & Chênh lệch trên UI)
    const resultByUser: CompareResultRow[] = Object.keys(userActualMap).map(key => {
        const [reviewerId] = key.split('_');
        const data = userActualMap[key];
        return {
            reviewerId,
            name: data.name,
            date: data.date,
            confirmDates: Array.from(data.confirmDates),
            actual: data.actual,
            reported: 0,
            diff: 0,
            status: 'OK'
        };
    });

    // 🌟 KẾT XUẤT TAB 2: THỐNG KÊ CHO NGƯỜI ĐƯỢC CHIA (Đọc chuẩn xác cột Count tổng)
    const resultByName: CompareResultRow[] = Object.keys(nameDateConfigMap).map(key => {
        const [name, reportDate] = key.split('_');
        const config = nameDateConfigMap[key];
        const actualInfo = nameActualMap[key] || { actual: 0, confirmDates: new Set<string>() };

        const actual = actualInfo.actual;
        const reported = config.reported; // Chỉ tiêu lấy chính xác từ cột Count/count/COUNT
        const diff = actual - reported;    // Tính chênh lệch làm được vs chỉ tiêu

        return {
            name,
            associatedUsers: Array.from(config.users),
            date: reportDate,
            confirmDates: Array.from(actualInfo.confirmDates),
            actual,
            reported,
            diff,
            status: diff === 0 ? 'OK' : 'MISMATCH'
        };
    });

    return {
        byUser: resultByUser,
        byName: resultByName
    };
};