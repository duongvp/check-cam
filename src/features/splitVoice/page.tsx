import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/components/ui/shadcn-io/dropzone';
import { UploadIcon } from 'lucide-react';
import { useState } from 'react';
import { ComboboxForm } from './components/SelectOptionLanguage';
import { TableDataSrt } from './components/TableDataSrt';

const SplitVoice = () => {
    const [files, setFiles] = useState<File[] | undefined>();
    const handleDrop = (files: File[]) => {
        console.log(files);
        setFiles(files);
    };
    return (
        <div className='flex-1'>
            <div className="flex flex-col min-h-full">
                <div className="grid grid-cols-12 gap-4 mb-4">
                    <Dropzone className='col-span-12 lg:col-span-5 w-full shadow-md' onDrop={handleDrop} onError={console.error} src={files}>
                        <DropzoneEmptyState>
                            <div className="flex w-full items-center gap-4 p-8">
                                <div className="flex size-16 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                    <UploadIcon size={24} />
                                </div>
                                <div className="text-left">
                                    <p className="font-medium text-sm">Upload a file</p>
                                    <p className="text-muted-foreground text-xs">
                                        Drag and drop or click to upload
                                    </p>
                                </div>
                            </div>
                        </DropzoneEmptyState>
                        <DropzoneContent />
                    </Dropzone>
                    <div className='border-1 rounded-sm col-span-12 lg:col-span-7 shadow-md p-3'>
                        <ComboboxForm />
                    </div>
                </div>
                <div className='border-1 rounded-sm boxsha col-span-12 shadow-md flex-1 p-2'>
                    <TableDataSrt />
                </div>
            </div>
        </div>

    );
};
export default SplitVoice;