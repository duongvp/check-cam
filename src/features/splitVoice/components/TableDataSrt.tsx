import * as React from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Pagination } from "@/components/ui/pagination"

type Payment = {
    id: string
    amount: number
    status: "pending" | "processing" | "success" | "failed"
    email: string
}

const data: Payment[] = [
    { id: "m5gr84i9", amount: 316, status: "success", email: "ken99@example.com" },
    { id: "3u1reuv4", amount: 242, status: "success", email: "Abe45@example.com" },
    { id: "derv1ws0", amount: 837, status: "processing", email: "Monserrat44@example.com" },
    { id: "5kma53ae", amount: 874, status: "success", email: "Silas22@example.com" },
    { id: "bhqecj4p", amount: 721, status: "failed", email: "carmella@example.com" },
    { id: "7hds88sd", amount: 500, status: "pending", email: "demo@example.com" },
    { id: "9k3djf0d", amount: 950, status: "success", email: "user@example.com" },
]

export function TableDataSrt() {
    const [page, setPage] = React.useState(1)
    const pageSize = 10
    const totalItems = 571 // ví dụ
    const currentData = data.slice((page - 1) * pageSize, page * pageSize)

    return (
        <div className="w-full">
            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="border-r-1">STT</TableHead>
                            <TableHead className="border-r-1">Start Time</TableHead>
                            <TableHead className="border-r-1">End Time </TableHead>
                            <TableHead className="border-r-1">Orignal Text</TableHead>
                            <TableHead>Translated Text</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentData.map((row, index) => (
                            <TableRow key={row.id}>
                                <TableCell className="border-r-1 w-[30px]">{index + 1}</TableCell>
                                <TableCell className="border-r-1 w-[180px]">{row.status}</TableCell>
                                <TableCell className="border-r-1 w-[180px]">{row.status}</TableCell>
                                <TableCell className="lowercase border-r-1">{row.email}</TableCell>
                                <TableCell className="lowercase">{row.email}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Pagination
                totalItems={totalItems}
                pageSize={pageSize}
                currentPage={page}
                onPageChange={setPage}
            />
        </div>
    )
}
