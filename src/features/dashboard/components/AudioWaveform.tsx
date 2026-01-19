const BASE_URL = import.meta.env.VITE_API_URL
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import VolumeSlider from "./VolumeSlider";

type AudioWaveProps = {
    audioUrl: string;
    title?: string;
    waveformRef: React.RefObject<HTMLDivElement | null>;
    wavesurferRef: React.RefObject<WaveSurfer | null>;
    waveColor?: string;
    progressColor?: string;
    hoverX: number | null;
    onMouseMove: (e: React.MouseEvent) => void;
    onMouseLeave: () => void;
    onClick: (e: React.MouseEvent) => void;
    isBottomZero?: boolean;
};

const AudioWave = ({
    audioUrl,
    title = "Music",
    waveformRef,
    wavesurferRef,
    waveColor = "#38bdf8",
    progressColor = "#0284c7",
    hoverX,
    onMouseMove,
    onMouseLeave,
    onClick,
    isBottomZero = false,
}: AudioWaveProps) => {
    const [volume, setVolume] = useState(100);

    useEffect(() => {
        if (!waveformRef.current) return;

        const ws = WaveSurfer.create({
            container: waveformRef.current,
            waveColor,
            progressColor,
            height: 60,
            normalize: true,
        });

        ws.load(audioUrl);
        ws.setVolume(volume / 100); // set volume mặc định
        wavesurferRef.current = ws;

        return () => ws.destroy();
    }, [audioUrl, waveformRef, wavesurferRef, waveColor, progressColor]);

    return (
        <div className="flex items-center gap-2 w-full border-1 rounded-md pl-4">
            {/* Label */}
            <h3 className="text-sm font-bold w-26 shrink-0">{title}</h3>
            <VolumeSlider
                value={volume}
                onChange={(val) => {
                    setVolume(val);
                    wavesurferRef.current?.setVolume(val / 100);
                }}
            />
            {/* Waveform container */}
            <div
                className="relative flex-1 h-16"
                onMouseMove={onMouseMove}
                onMouseLeave={onMouseLeave}
                onClick={onClick}
            >
                <div ref={waveformRef} className="w-full h-full" />
                {hoverX !== null && (
                    <div
                        className={cn("absolute top-0  z-10 w-[1px] bg-amber-500 pointer-events-none ", isBottomZero ? "bottom-0" : "-bottom-[10px]")}
                        style={{ left: `${hoverX}px` }}
                    />
                )}
            </div>
        </div>
    );
};

const AudioWaveform = ({ output }: {
    output: { bass: string; drums: string; other: string; vocals: string; };
}) => {
    const [hoverX, setHoverX] = useState<number | null>(null);

    // Danh sách track + màu
    const tracks = [
        { title: "Original Track", url: BASE_URL + output.other },
        { title: "Bass Track", url: BASE_URL + output.bass, waveColor: "#22c55e", progressColor: "#16a34a" },
        { title: "Drums Track", url: BASE_URL + output.drums, waveColor: "#f87171", progressColor: "#ef4444" },
        { title: "Vocals Track", url: BASE_URL + output.vocals, waveColor: "#a855f7", progressColor: "#9333ea", isBottomZero: true },
    ];

    // Ref cho mỗi track
    const refs = tracks.map(() => ({
        waveformRef: useRef<HTMLDivElement | null>(null),
        wavesurferRef: useRef<WaveSurfer | null>(null),
    }));

    const handlePlayPause = () => {
        refs.forEach(({ wavesurferRef }) => {
            wavesurferRef.current?.playPause();
        });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
        setHoverX(e.clientX - rect.left);
    };

    const handleMouseLeave = () => {
        setHoverX(null);
    };

    const handleClickVoice = (e: React.MouseEvent) => {
        const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const progress = clickX / rect.width;

        refs.forEach(({ wavesurferRef }) => {
            wavesurferRef.current?.seekTo(progress);
            wavesurferRef.current?.play();
        });
    }

    return (
        <div className="flex flex-col gap-4 w-full h-full justify-between audio-waveform">
            <div className="flex flex-col gap-0.5 w-full before:content-[attr(data-title)] before:text-end before:text-sm relative" data-title="This is custom data for my element">
                {tracks.map((track, i) => (
                    <AudioWave
                        key={i}
                        audioUrl={track.url || ""}
                        title={track.title}
                        waveformRef={refs[i].waveformRef}
                        wavesurferRef={refs[i].wavesurferRef}
                        waveColor={track.waveColor}
                        progressColor={track.progressColor}
                        hoverX={hoverX}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        onClick={handleClickVoice}
                        isBottomZero={track.isBottomZero}
                    />
                ))}
            </div>

            <div className="flex items-center justify-between w-full mt-4">
                <Button
                    onClick={handlePlayPause}
                    className="px-4 py-2 rounded self-start"
                    variant={"translate"}
                >
                    Play / Pause
                </Button>
                <div className="flex items-center gap-4">
                    <Select defaultValue="wav">
                        <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Chọn định dạng" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="wav">WAV</SelectItem>
                            <SelectItem value="mp3">MP3</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button className="px-4 py-2 rounded self-end" variant={"default"}>
                        <Download /> Download
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AudioWaveform;
