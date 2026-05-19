import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useMemo, useState } from 'react';
import { Filter } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

export type SummaryRow = {
    reviewerId?: string;
    name: string;
    associatedUsers?: string[];
    date: string;
    confirmDates: string[];
    actual: number;
    reported: number;
    diff: number;
    status: 'OK' | 'MISMATCH';
};

type MultiDateProps = {
    values: string[];
    selected: string[];
    onChange: (v: string[]) => void;
};

const MultiDateFilter = ({ values, selected, onChange }: MultiDateProps) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={`w-6 h-6 p-0 ${selected.length ? 'text-blue-600 bg-blue-50' : ''}`}
                >
                    <Filter className="w-3.5 h-3.5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-2 max-h-72 overflow-auto" align="start">
                {values.map(v => (
                    <label key={v} className="flex items-center gap-2 py-1.5 px-1 hover:bg-muted rounded cursor-pointer">
                        <Checkbox
                            checked={selected.includes(v)}
                            onCheckedChange={(c) => onChange(c ? [...selected, v] : selected.filter(x => x !== v))}
                        />
                        <span className="text-sm select-none">{v}</span>
                    </label>
                ))}
                {!!selected.length && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 w-full text-xs text-destructive hover:bg-destructive/10"
                        onClick={() => onChange([])}
                    >
                        Xóa bộ lọc
                    </Button>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export const PerformanceSummaryTable = ({ type, data }: { type: 'user' | 'name'; data: SummaryRow[] }) => {
    const [selectedConfirmDates, setSelectedConfirmDates] = useState<string[]>([]);
    const [selectedReportDates, setSelectedReportDates] = useState<string[]>([]);

    const allConfirmDates = useMemo(() => {
        const set = new Set<string>();
        data.forEach(r => r.confirmDates?.forEach(d => set.add(d)));
        return Array.from(set).sort();
    }, [data]);

    const allReportDates = useMemo(() => {
        return Array.from(new Set(data.map(r => r.date))).filter(Boolean);
    }, [data]);

    const filteredData = useMemo(() => {
        return data.filter(row => {
            if (selectedReportDates.length && !selectedReportDates.includes(row.date)) return false;
            if (selectedConfirmDates.length && (!row.confirmDates || !selectedConfirmDates.every(d => row.confirmDates.includes(d)))) return false;
            return true;
        });
    }, [data, selectedConfirmDates, selectedReportDates]);

    return (
        <div className="rounded-md border overflow-x-auto w-full bg-white shadow-sm">
            <Table>
                <TableHeader className="bg-slate-50">
                    <TableRow>
                        {type === 'user' ? (
                            <>
                                <TableHead className="font-semibold text-slate-700">Mã User</TableHead>
                                <TableHead className="font-semibold text-slate-700">Thuộc Nhân Viên</TableHead>
                            </>
                        ) : (
                            <>
                                <TableHead className="font-semibold text-slate-700">Người Được Chia</TableHead>
                                <TableHead className="font-semibold text-slate-700">Tài Khoản Phụ Quản Lý</TableHead>
                            </>
                        )}

                        <TableHead className="text-slate-700">
                            <div className="flex items-center gap-1.5">
                                Ngày Báo Cáo
                                <MultiDateFilter values={allReportDates} selected={selectedReportDates} onChange={setSelectedReportDates} />
                            </div>
                        </TableHead>

                        <TableHead className="text-slate-700">
                            <div className="flex items-center gap-1.5">
                                Ngày Xác Nhận Thực Tế
                                <MultiDateFilter values={allConfirmDates} selected={selectedConfirmDates} onChange={setSelectedConfirmDates} />
                            </div>
                        </TableHead>

                        <TableHead className="text-right font-semibold text-slate-700">Thực Tế (Actual)</TableHead>

                        {/* 🌟 CHỈ HIỂN THỊ BA CỘT NÀY CHO TAB THỐNG KÊ THEO NGƯỜI ĐƯỢC CHIA */}
                        {type === 'name' && (
                            <>
                                <TableHead className="text-right font-semibold text-slate-700">Báo Cáo (Reported)</TableHead>
                                <TableHead className="text-right font-semibold text-slate-700">Chênh Lệch (Diff)</TableHead>
                                <TableHead className="font-semibold text-slate-700">Trạng Thái</TableHead>
                            </>
                        )}
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {filteredData.map((row, idx) => (
                        <TableRow key={idx} className="hover:bg-slate-50/80 transition-colors">
                            {type === 'user' ? (
                                <>
                                    <TableCell className="font-medium text-slate-900">{row.reviewerId}</TableCell>
                                    <TableCell className="text-slate-600">{row.name}</TableCell>
                                </>
                            ) : (
                                <>
                                    <TableCell className="font-bold text-blue-600">{row.name}</TableCell>
                                    <TableCell className="max-w-[220px] truncate text-slate-500" title={row.associatedUsers?.join(', ')}>
                                        {row.associatedUsers?.join(', ') || 'Chưa liên kết'}
                                    </TableCell>
                                </>
                            )}

                            <TableCell className="whitespace-nowrap text-xs text-slate-500">{row.date}</TableCell>

                            <TableCell>
                                <div className="flex flex-wrap gap-1 max-w-[260px]">
                                    {row.confirmDates && row.confirmDates.length > 0 ? (
                                        row.confirmDates.map(d => (
                                            <Badge key={d} variant="outline" className="text-[11px] font-normal px-1.5 py-0 bg-slate-50 text-slate-600 border-slate-200">
                                                {d}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-xs text-slate-400 italic">Chưa có tương tác</span>
                                    )}
                                </div>
                            </TableCell>

                            <TableCell className="text-right font-semibold text-slate-900 bg-slate-50/30">{row.actual}</TableCell>

                            {/* 🌟 ĐIỀU KIỆN ẨN / HIỆN NỘI DUNG CHO TỪNG TAB */}
                            {type === 'name' && (
                                <>
                                    <TableCell className="text-right text-slate-500">{row.reported}</TableCell>
                                    <TableCell
                                        className={`text-right font-bold ${row.diff > 0
                                            ? 'text-emerald-600 bg-emerald-50/40' // Dương màu Xanh
                                            : row.diff < 0
                                                ? 'text-rose-600 bg-rose-50/40'       // Âm màu Đỏ
                                                : 'text-slate-600'                    // Bằng 0 màu trung tính
                                            }`}
                                    >
                                        {row.diff > 0 ? `+${row.diff}` : row.diff}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded shadow-none ${row.status !== 'OK' && row.diff > 0 ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-transparent' : ''
                                                }`}
                                            variant={row.status === 'OK' ? 'default' : (row.diff > 0 ? 'default' : 'destructive')}
                                        >
                                            {row.status === 'OK' ? 'Khớp (OK)' : 'Lệch Số'}
                                        </Badge>
                                    </TableCell>
                                </>
                            )}
                        </TableRow>
                    ))}

                    {filteredData.length === 0 && (
                        <TableRow>
                            <td colSpan={type === 'name' ? 8 : 5} className="text-center p-12 text-sm text-slate-400 italic">
                                Không có dữ liệu hiển thị.
                            </td>
                        </TableRow>
                    )}

                    {filteredData.length > 0 && type === 'name' && (
                        <TableRow className="bg-slate-100 hover:bg-slate-100 font-semibold border-t-2 border-slate-200">
                            <TableCell colSpan={4} className="text-right text-slate-800 uppercase text-xs tracking-wider">
                                Tổng cộng
                            </TableCell>
                            <TableCell className="text-right text-slate-900 bg-slate-200/50">
                                {filteredData.reduce((sum, row) => sum + row.actual, 0)}
                            </TableCell>
                            <TableCell className="text-right text-slate-900">
                                {filteredData.reduce((sum, row) => sum + row.reported, 0)}
                            </TableCell>
                            <TableCell className="text-right font-bold">
                                {(() => {
                                    const totalDiff = filteredData.reduce((sum, row) => sum + row.diff, 0);
                                    return (
                                        <span className={totalDiff > 0 ? 'text-emerald-600' : totalDiff < 0 ? 'text-rose-600' : 'text-slate-600'}>
                                            {totalDiff > 0 ? `+${totalDiff}` : totalDiff}
                                        </span>
                                    );
                                })()}
                            </TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};