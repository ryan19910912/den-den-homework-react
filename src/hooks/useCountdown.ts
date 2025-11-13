import { useState, useCallback, useRef, useEffect } from 'react';

const COUNTDOWN_TIME = 60; // 60 秒倒計時

export const useCountdown = () => {
    const [countdown, setCountdown] = useState(0);
    const timerRef = useRef<number | undefined>(undefined);

    const startCountdown = useCallback(() => {
        setCountdown(COUNTDOWN_TIME);
    }, []);

    useEffect(() => {
        if (countdown > 0) {
            timerRef.current = setTimeout(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        }

        // 清理函數：在組件卸載或倒計時結束時清除定時器
        return () => {
            if (timerRef.current !== undefined) {
                clearTimeout(timerRef.current);
                timerRef.current = undefined;
            }
        };
    }, [countdown]);

    // 返回是否正在倒計時和當前秒數
    return {
        countdown,
        isCounting: countdown > 0,
        startCountdown
    };
};