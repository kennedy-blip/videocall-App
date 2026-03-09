import { useEffect, useState } from 'react';

export const useAudioDetection = (stream) => {
    const [isSpeaking, setIsSpeaking] = useState(false);

    useEffect(() => {
        if (!stream) return;

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        analyser.fftSize = 512;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const checkVolume = () => {
            analyser.getByteFrequencyData(dataArray);
            let values = 0;
            for (let i = 0; i < bufferLength; i++) {
                values += dataArray[i];
            }
            const average = values / bufferLength;
            setIsSpeaking(average > 30); // Threshold for "speaking"
            requestAnimationFrame(checkVolume);
        };

        checkVolume();
        return () => audioContext.close();
    }, [stream]);

    return isSpeaking;
};