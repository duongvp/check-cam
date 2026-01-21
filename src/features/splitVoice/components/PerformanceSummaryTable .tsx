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
    reviewer: string;
    date: string;                 // report date (vd: 16+17/1/2026)
    confirmDates: string[];       // ['2026-01-16','2026-01-17','2026-01-18']
    actual: number;
    reported: number;
    diff: number;
    status: 'OK' | 'MISMATCH';
};


type Props = {
    data: SummaryRow[];
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
                    className={selected.length ? 'text-blue-600' : ''}
                >
                    <Filter className="w-4 h-4" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="p-2 max-h-72 overflow-auto">
                {values.map(v => (
                    <label
                        key={v}
                        className="flex items-center gap-2 py-1 cursor-pointer"
                    >
                        <Checkbox
                            checked={selected.includes(v)}
                            onCheckedChange={(c) =>
                                onChange(
                                    c
                                        ? [...selected, v]
                                        : selected.filter(x => x !== v)
                                )
                            }
                        />
                        <span className="text-sm">{v}</span>
                    </label>
                ))}

                {!!selected.length && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 w-full"
                        onClick={() => onChange([])}
                    >
                        Clear filter
                    </Button>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
export const PerformanceSummaryTable = ({ data }: Props) => {
    const [selectedConfirmDates, setSelectedConfirmDates] = useState<string[]>([]);
    const [selectedReportDates, setSelectedReportDates] = useState<string[]>([]);

    /* ===== ALL FILTER VALUES ===== */

    const allConfirmDates = useMemo(() => {
        const set = new Set<string>();
        data.forEach(r => r.confirmDates.forEach(d => set.add(d)));
        return Array.from(set).sort();
    }, [data]);

    const allReportDates = useMemo(() => {
        return Array.from(new Set(data.map(r => r.date))).filter(Boolean);
    }, [data]);

    /* ===== FILTER LOGIC (FIX BUG) ===== */

    const filteredData = useMemo(() => {
        return data.filter(row => {
            // Report Date filter
            if (
                selectedReportDates.length &&
                !selectedReportDates.includes(row.date)
            ) {
                return false;
            }

            // Confirm Dates filter (MUST CONTAIN selected)
            if (
                selectedConfirmDates.length &&
                !selectedConfirmDates.every(d => row.confirmDates.includes(d))
            ) {
                return false;
            }

            return true;
        });
    }, [data, selectedConfirmDates, selectedReportDates]);

    if (!filteredData.length) return null;

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>User</TableHead>

                    <TableHead>
                        <div className="flex items-center gap-2">
                            Date
                            <MultiDateFilter
                                values={allReportDates}
                                selected={selectedReportDates}
                                onChange={setSelectedReportDates}
                            />
                        </div>
                    </TableHead>

                    <TableHead>
                        <div className="flex items-center gap-2">
                            Confirm Dates
                            <MultiDateFilter
                                values={allConfirmDates}
                                selected={selectedConfirmDates}
                                onChange={setSelectedConfirmDates}
                            />
                        </div>
                    </TableHead>

                    <TableHead className="text-right">Actual</TableHead>
                    <TableHead className="text-right">Reported</TableHead>
                    <TableHead className="text-right">Diff</TableHead>
                    <TableHead>Status</TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                {filteredData.map((row, idx) => (
                    <TableRow key={idx}>
                        <TableCell>{row.reviewer}</TableCell>

                        <TableCell>{row.date}</TableCell>

                        <TableCell>
                            <div className="flex flex-wrap gap-1">
                                {row.confirmDates.map(d => (
                                    <Badge key={d} variant="secondary">
                                        {d}
                                    </Badge>
                                ))}
                            </div>
                        </TableCell>

                        <TableCell className="text-right">{row.actual}</TableCell>
                        <TableCell className="text-right">{row.reported}</TableCell>

                        <TableCell
                            className={`text-right ${row.diff !== 0 ? 'text-red-500 font-medium' : ''
                                }`}
                        >
                            {row.diff}
                        </TableCell>

                        <TableCell>
                            <Badge
                                variant={row.status === 'OK' ? 'default' : 'destructive'}
                            >
                                {row.status}
                            </Badge>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};
