import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/components/ui/shadcn-io/dropzone';
import { Spinner } from '@/components/ui/shadcn-io/spinner';
import { UploadIcon } from 'lucide-react';
import { useState } from 'react';
import AudioWaveform from './components/AudioWaveform';
import { separateVoice } from '@/api/separateVoice.api';

interface IBeforeUploadProps {
    handleDrop: (files: File[]) => void;
    files: File[] | undefined;
}

const BeforeUpload = ({ handleDrop, files }: IBeforeUploadProps) => (
    <div className='flex-1'>
        <div className='flex flex-col h-full justify-center gap-5 items-center'>
            <h2 className='text-3xl text-shadow-sm text-shadow-amber-600 text-center w-[45ch] '>Separate the voice from the music from a free song</h2>
            <Dropzone className='shadow-md w-fit p-0' onDrop={handleDrop} onError={console.error} src={files}>
                <DropzoneEmptyState>
                    <div className="flex w-full items-center justify-center gap-4 p-8">
                        <div className="flex size-16 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                            <UploadIcon size={24} />
                        </div>
                        <div className="text-left">
                            <p className="font-medium text-base">Upload a file</p>
                            <p className="text-muted-foreground text-sm">
                                Drag and drop or click to upload
                            </p>
                        </div>
                    </div>
                </DropzoneEmptyState>
                <DropzoneContent />
            </Dropzone>
        </div>
    </div>
)

const LoadingFile = ({ count }: { count: number }) => (
    <div className='flex-1 w-full border-1 rounded-md shadow-md h-full flex flex-col items-center justify-center'>
        <Spinner className='text-amber-600' variant='ring' size={64} />
        <p className='font-[500] text-lg'>Processing file {count}%</p>
    </div>
)

const ProcessingFile = () => (
    <div className='flex-1 w-full rounded-md shadow-md h-full flex flex-col items-center justify-center'>
        <Spinner className='text-amber-600' variant='infinite' size={64} />
        <p className='font-[500] text-lg'>Server is processing file...</p>
    </div>
);

const AfterUpload = ({ output }: {
    output: {
        bass: string;
        drums: string;
        other: string;
        vocals: string;
    }
}) => (
    <div className='flex-1 w-full border-1 p-3 rounded-md shadow-md h-full flex flex-col items-center justify-center'>
        <AudioWaveform output={output} />
    </div>
)

const Page = () => {
    const [files, setFiles] = useState<File[] | undefined>();
    const [step, setStep] = useState(1)
    const [count, setCount] = useState(0)
    const [output, setOutPut] = useState<{
        bass: string;
        drums: string;
        other: string;
        vocals: string;
    }>({ bass: '', drums: '', other: '', vocals: '' })

    const handleDrop = async (files: File[]) => {
        setFiles(files);
        const formData = new FormData();
        formData.append('file', files[0]);
        setStep(3)
        try {
            const res = await separateVoice(formData, (percent) => {
                setCount(percent)
                // if (percent === 100) setStep(3)
            });

            // setStep(3)

            if (res.status === 'success') {
                setOutPut(res.output || { bass: '', drums: '', other: '', vocals: '' })
                setStep(4); // xử lý xong → qua step 4
            } else {
                console.error(res.message || 'Server error');
                // Có thể show error UI
            }
        } catch (err) {
            console.error(err);
            // Có thể show error UI
        }
    };

    if (step === 1)
        return <BeforeUpload handleDrop={handleDrop} files={files} />

    if (step === 2)
        return <LoadingFile count={count} />
    if (step === 3) return <ProcessingFile />;

    return <AfterUpload output={output} />
};
export default Page;
