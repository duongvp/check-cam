import {
    Dropzone,
    DropzoneContent,
    DropzoneEmptyState,
} from '@/components/ui/shadcn-io/dropzone';
import {
    UploadIcon,
    FileSpreadsheet,
    User,
    Users,
    HelpCircle,
    FileDown,
    AlertCircle,
    CheckCircle2,
    RotateCcw // Thêm icon reload dữ liệu
} from 'lucide-react';
import { useState, useMemo } from 'react';

import { parseSpreadsheet, compareReviewData } from '@/helpers/parseSpreadsheet';
import { PerformanceSummaryTable } from './components/PerformanceSummaryTable ';

const SplitVoice = () => {
    const [logFiles, setLogFiles] = useState<File[]>();
    const [reportFiles, setReportFiles] = useState<File[]>();

    const [logData, setLogData] = useState<any[]>([]);
    const [reportData, setReportData] = useState<any[]>([]);

    // State quản lý xem tab dữ liệu nào đang được hiển thị: 'byUser' hoặc 'byName'
    const [activeTab, setActiveTab] = useState<'byUser' | 'byName'>('byUser');
    // State đóng mở khu vực Hướng dẫn sử dụng nhanh
    const [showGuide, setShowGuide] = useState(true);

    // 📥 FILE 1: LOG file (Kết quả phân tích/review)
    const handleLogDrop = (files: File[]) => {
        const file = files[0];
        setLogFiles(files);
        parseSpreadsheet(file, setLogData, console.error);
    };

    // 📥 FILE 2: REPORT file (Danh sách phân công User - Name)
    const handleReportDrop = (files: File[]) => {
        const file = files[0];
        setReportFiles(files);
        parseSpreadsheet(file, setReportData, console.error);
    };

    // 🔄 Hàm xử lý làm mới dữ liệu (Thay thế việc phải ấn F5)
    const handleReload = () => {
        setLogFiles(undefined);
        setReportFiles(undefined);
        setLogData([]);
        setReportData([]);
    };

    // 📊 Xử lý tính toán và ghi nhớ dữ liệu thông qua hook useMemo
    const summary = useMemo(() => {
        if (!logData.length || !reportData.length) {
            return { byUser: [], byName: [] };
        }
        return compareReviewData(logData, reportData);
    }, [logData, reportData]);

    return (
        <div className="flex-1 space-y-4">
            <div className="flex flex-col min-h-full gap-4">

                {/* 💡 KHU VỰC HƯỚNG DẪN SỬ DỤNG & TẢI FILE MẪU CÓ ANIMATION */}
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
                    <div
                        className="bg-muted/40 px-4 py-3 border-b flex items-center justify-between cursor-pointer select-none hover:bg-muted/60 transition-colors"
                        onClick={() => setShowGuide(!showGuide)}
                    >
                        <div className="flex items-center gap-2">
                            <HelpCircle className="w-4 h-4 text-primary" />
                            <span className="font-semibold text-sm text-foreground">Hướng dẫn sử dụng & Tải file mẫu đối chiếu</span>
                        </div>
                        <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                            {/* Nút Reload mượt mà không load lại trang */}
                            <button
                                onClick={handleReload}
                                title="Làm mới dữ liệu đầu vào"
                                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded border border-amber-200 transition-colors cursor-pointer shadow-sm"
                            >
                                <RotateCcw className="w-3 h-3" />
                                Reset Trang
                            </button>
                            <span
                                onClick={() => setShowGuide(!showGuide)}
                                className="text-xs text-muted-foreground hover:text-foreground underline transition-all cursor-pointer"
                            >
                                {showGuide ? 'Thu gọn ▲' : 'Mở rộng hướng dẫn ▼'}
                            </span>
                        </div>
                    </div>

                    {/* Khối bọc hiệu ứng mượt mà (Slide & Fade animation) */}
                    <div
                        className={`transition-all duration-300 ease-in-out overflow-hidden ${showGuide ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                            }`}
                    >
                        <div className="p-4 space-y-4 bg-background border-t">
                            {/* Khối Tải File Mẫu Link trực tiếp từ thư mục public */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-3 rounded-md border border-dashed border-blue-200 bg-blue-50/20 flex flex-col justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-blue-700 flex items-center gap-1.5 mb-1">
                                            <CheckCircle2 className="w-3.5 h-3.5" /> File 1: Log Kết Quả Kiểm Tra (.csv)
                                        </p>
                                        <p className="text-[11px] text-muted-foreground leading-relaxed pl-5">
                                            File kết quả thực tế từ hệ thống. Phải chứa cột <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-mono">確認者名</code> (hoặc <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-mono">reviewer</code>). Nếu trống tên người duyệt, hệ thống sẽ tự động bỏ qua không tính dòng đó.
                                        </p>
                                    </div>
                                    <a
                                        href="/Suspicious Person Detection_(2143).csv"
                                        download="Suspicious Person Detection_(2143).csv"
                                        className="mt-3 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors w-full md:w-fit text-center shadow-sm"
                                    >
                                        <FileDown className="w-3.5 h-3.5" /> Tải file mẫu 1 (.CSV)
                                    </a>
                                </div>

                                <div className="p-3 rounded-md border border-dashed border-emerald-200 bg-emerald-50/20 flex flex-col justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 mb-1">
                                            <CheckCircle2 className="w-3.5 h-3.5" /> File 2: Bảng Phân Công Nhân Sự (.xlsx)
                                        </p>
                                        <div className="text-[11px] text-emerald-600 leading-relaxed pl-5 space-y-1">
                                            <p>
                                                • Bắt buộc chứa các cột định danh: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-mono">reviewer / ユーザーID</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-mono">name</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-mono">date</code>.
                                            </p>
                                            <p className="bg-emerald-100/50 p-1.5 rounded border border-emerald-200/60 text-emerald-800 font-medium mt-1">
                                                📌 <strong>Lưu ý cột Count:</strong> Điền <strong>số lượng tổng cam cần check</strong> của người đó trong ngày. Nếu một người làm nhiều Nick phụ (nhiều dòng), <strong>chỉ cần điền Count 1 lần duy nhất ở dòng đầu tiên</strong> (các dòng nick phụ phía dưới có thể bỏ trống cột Count). Hệ thống sẽ tự động đối chiếu theo tổng số lượng cam chứ không tính rời rạc từng User.
                                            </p>
                                        </div>
                                    </div>
                                    <a
                                        href="/BẢNG NHÂN SỰ CHECK CAM (1).xlsx"
                                        download="BẢNG NHÂN SỰ CHECK CAM (1).xlsx"
                                        className="mt-3 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors w-full md:w-fit text-center shadow-sm"
                                    >
                                        <FileDown className="w-3.5 h-3.5" /> Tải file mẫu 2 (.XLSX)
                                    </a>
                                </div>
                            </div>

                            {/* Lưu ý nhỏ */}
                            <div className="flex gap-2 p-2.5 rounded bg-amber-50/60 border border-amber-200/60 text-[11px] text-amber-800">
                                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                <p className="leading-relaxed">
                                    <strong>Tính năng dọn rác ID thông minh:</strong> Hệ thống tự động chuẩn hóa ID của nhân viên (Xóa dấu cách thừa, chuyển chữ thường sang HOA, đổi gạch dưới thành gạch ngang). Ví dụ mã viết lỗi dạng <code className="bg-white px-1 border rounded">nqy_01 </code> sẽ tự động hiểu thành <code className="bg-white px-1 border rounded font-bold text-indigo-600">NQY-01</code> để đối khớp chuẩn xác.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Khu vực Upload Files */}
                <div className="grid grid-cols-12 gap-4">

                    {/* DROPZONE 1: FILE LOG REVIEW */}
                    <Dropzone
                        className="col-span-12 lg:col-span-6 shadow-sm"
                        onDrop={handleLogDrop}
                        onError={console.error}
                        src={logFiles}
                    >
                        <DropzoneEmptyState>
                            <div className="flex items-center gap-4 p-6">
                                <div className="flex size-14 items-center justify-center rounded-lg bg-muted">
                                    <UploadIcon size={22} />
                                </div>
                                <div>
                                    <p className="font-medium text-sm">
                                        Upload LOG File 1 (CSV / XLSX)
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Dữ liệu chấm thực tế (確認者名, AI解析結果...)
                                    </p>
                                </div>
                            </div>
                        </DropzoneEmptyState>
                        <DropzoneContent />
                    </Dropzone>

                    {/* DROPZONE 2: FILE DANH SÁCH PHÂN CÔNG */}
                    <Dropzone
                        className="col-span-12 lg:col-span-6 shadow-sm"
                        onDrop={handleReportDrop}
                        onError={console.error}
                        src={reportFiles}
                    >
                        <DropzoneEmptyState>
                            <div className="flex items-center gap-4 p-6">
                                <div className="flex size-14 items-center justify-center rounded-lg bg-muted">
                                    <FileSpreadsheet size={22} />
                                </div>
                                <div>
                                    <p className="font-medium text-sm">
                                        Upload REPORT File 2 (CSV / XLSX)
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Danh sách đối chiếu (ユーザーID, reviewer, name, Count)
                                    </p>
                                </div>
                            </div>
                        </DropzoneEmptyState>
                        <DropzoneContent />
                    </Dropzone>

                </div>

                {/* Khu vực hiển thị bảng thống kê */}
                {logData.length > 0 && reportData.length > 0 && (
                    <div className="rounded-sm shadow-md flex-1 p-4 bg-background border flex flex-col gap-4">

                        {/* Thanh điều hướng chuyển đổi giữa 2 bảng */}
                        <div className="flex border-b border-muted pb-px gap-2">
                            <button
                                onClick={() => setActiveTab('byUser')}
                                className={`flex cursor-pointer items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-all ${activeTab === 'byUser'
                                    ? 'border-primary text-primary font-semibold'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <User size={16} />
                                Thống kê theo từng User
                            </button>

                            <button
                                onClick={() => setActiveTab('byName')}
                                className={`flex cursor-pointer items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-all ${activeTab === 'byName'
                                    ? 'border-primary text-primary font-semibold'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <Users size={16} />
                                Thống kê theo Người được chia
                            </button>
                        </div>

                        {/* Nội dung bảng hiển thị dựa trên Tab đang chọn */}
                        <div className="flex-1 min-h-[300px]">
                            {activeTab === 'byUser' ? (
                                <div className="space-y-2">
                                    <div className="text-xs text-muted-foreground">
                                        * Tổng hợp số lượng duyệt thực tế dựa trên mã tài khoản phụ cụ thể (Cột Báo cáo & Chênh lệch đã được ẩn theo nghiệp vụ).
                                    </div>
                                    <PerformanceSummaryTable
                                        type="user"
                                        data={summary.byUser}
                                    />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="text-xs text-muted-foreground">
                                        * Cộng dồn số liệu thực tế của tất cả tài khoản con để so khớp chính xác với chỉ tiêu tổng (<strong className="text-emerald-700">Count</strong>) được giao.
                                    </div>
                                    <PerformanceSummaryTable
                                        type="name"
                                        data={summary.byName}
                                    />
                                </div>
                            )}
                        </div>

                    </div>
                )}

            </div>
        </div>
    );
};

export default SplitVoice;