import {
    Dropzone,
    DropzoneContent,
    DropzoneEmptyState,
} from '@/components/ui/shadcn-io/dropzone';
import { UploadIcon, FileSpreadsheet } from 'lucide-react';
import { useState } from 'react';

import { usePerformanceSummary } from '@/hooks/usePerformanceSummary';
import { PerformanceSummaryTable } from './components/PerformanceSummaryTable ';
import { parseSpreadsheet } from '@/helpers/parseSpreadsheet';

const SplitVoice = () => {
    const [logFiles, setLogFiles] = useState<File[]>();
    const [reportFiles, setReportFiles] = useState<File[]>();

    const [logData, setLogData] = useState<any[]>([]);
    const [reportData, setReportData] = useState<any[]>([]);

    // 📥 LOG file (csv | xlsx)
    const handleLogDrop = (files: File[]) => {
        const file = files[0];
        setLogFiles(files);

        parseSpreadsheet(file, setLogData, console.error);
    };

    // 📥 REPORT file (csv | xlsx)
    const handleReportDrop = (files: File[]) => {
        const file = files[0];
        setReportFiles(files);

        parseSpreadsheet(file, setReportData, console.error);
    };

    console.log("logData", logData);
    console.log("reportData", reportData);

    const summary = usePerformanceSummary(logData, reportData);

    console.log("summary", summary);

    return (
        <div className="flex-1">
            <div className="flex flex-col min-h-full gap-4">

                {/* Upload area */}
                <div className="grid grid-cols-12 gap-4">

                    {/* LOG */}
                    <Dropzone
                        className="col-span-12 lg:col-span-6 shadow-md"
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
                                        Upload LOG (CSV / XLSX)
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        confirmedAtJST • reviewer • system data
                                    </p>
                                </div>
                            </div>
                        </DropzoneEmptyState>
                        <DropzoneContent />
                    </Dropzone>

                    {/* REPORT */}
                    <Dropzone
                        className="col-span-12 lg:col-span-6 shadow-md"
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
                                        Upload REPORT (CSV / XLSX)
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        reviewer • date • reported_count
                                    </p>
                                </div>
                            </div>
                        </DropzoneEmptyState>
                        <DropzoneContent />
                    </Dropzone>

                </div>

                {/* Summary */}
                <div className="rounded-sm shadow-md flex-1 p-2">
                    <PerformanceSummaryTable data={summary} />
                </div>

            </div>
        </div>
    );
};

export default SplitVoice;
