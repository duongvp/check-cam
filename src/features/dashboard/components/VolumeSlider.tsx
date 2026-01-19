import { useState, useEffect, useRef } from "react";

type VolumeSliderProps = {
    value: number;
    onChange: (v: number) => void;
};

const VolumeSlider = ({ value, onChange }: VolumeSliderProps) => {
    const volumeTrackRef = useRef<HTMLDivElement>(null);
    const [dragging, setDragging] = useState(false);

    const updateValue = (clientX: number) => {
        if (!volumeTrackRef.current) return;
        const rect = volumeTrackRef.current.getBoundingClientRect();
        let left = clientX - rect.left;
        let percent = Math.min(Math.max(left / rect.width, 0), 1);
        onChange(percent * 100);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setDragging(true);
        updateValue(e.clientX);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!dragging) return;
            updateValue(e.clientX);
        };

        const handleMouseUp = () => {
            setDragging(false);
        };

        if (dragging) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        }

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [dragging]);

    return (
        <div className="relative w-12 cursor-pointer select-none flex items-center volume-track mr-3">
            <div
                ref={volumeTrackRef}
                className="relative w-full h-4 bg-gray-500"
                onMouseDown={handleMouseDown}
                style={{
                    clipPath: "polygon(0% 100%,0% 75%,100% 0%,100% 100%)",
                    overflow: "hidden",
                }}
            >
                {/* phần màu active */}
                <div
                    className="absolute left-0 top-0 bottom-0 bg-gray-300"
                    style={{
                        width: `${value}%`,
                    }}
                />
            </div>

            {/* thumb */}
            <div
                className="absolute bottom-0 w-2 h-5 bg-white rounded-[2px] shadow group"
                style={{ left: `${value}%`, transform: "translateX(-50%)" }}
                onMouseDown={handleMouseDown}
            >
                <div className="relative w-full h-full">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold px-1 rounded bg-primary text-primary-foreground group-hover:opacity-100 opacity-0 transition">{Math.round(value)}</div>
                </div>
            </div>
        </div>
    );
};

export default VolumeSlider;
