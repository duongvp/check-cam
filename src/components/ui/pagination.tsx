import { Button } from "@/components/ui/button"

type PaginationProps = {
    totalItems: number
    pageSize: number
    currentPage: number
    onPageChange: (page: number) => void
}

export function Pagination({
    totalItems,
    pageSize,
    currentPage,
    onPageChange,
}: PaginationProps) {
    const totalPages = Math.ceil(totalItems / pageSize)

    const getPageNumbers = () => {
        const pages: (number | string)[] = []
        const maxVisible = 5 // số trang hiển thị giữa

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i)
        } else {
            const start = Math.max(2, currentPage - 1)
            const end = Math.min(totalPages - 1, currentPage + 1)

            pages.push(1)
            if (start > 2) pages.push("...")

            for (let i = start; i <= end; i++) pages.push(i)

            if (end < totalPages - 1) pages.push("...")
            pages.push(totalPages)
        }
        return pages
    }

    const startItem = (currentPage - 1) * pageSize + 1
    const endItem = Math.min(currentPage * pageSize, totalItems)

    return (
        <div className="flex items-center justify-end gap-2 py-4">
            <p className="text-sm text-muted-foreground">
                Showing records {startItem}-{endItem} out of {totalItems}
            </p>
            <div className="flex items-center space-x-1">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    &lt;
                </Button>
                {getPageNumbers().map((page, i) =>
                    page === "..." ? (
                        <span key={i} className="px-2">
                            ...
                        </span>
                    ) : (
                        <Button
                            key={i}
                            variant={page === currentPage ? "translate" : "outline"}
                            size="sm"
                            onClick={() => onPageChange(page as number)}
                        >
                            {page}
                        </Button>
                    )
                )}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    &gt;
                </Button>
            </div>
        </div>
    )
}
