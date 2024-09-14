import "regenerator-runtime/runtime";
import { useState, useEffect } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

import "./styles.css";

export default function App() {
    const [{ status, time }, setTimerState] = useState({
        status: "ready",
        time: 5 * 60,
    });

    const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } =
        useSpeechRecognition({
            commands: [
                {
                    command: ["Stop", "Pause", "Halt"],
                    callback: ({ command }) => {
                        console.log({ command });
                        setTimerState((s) => {
                            if (s.status === "running") {
                                return {
                                    time: s.time,
                                    status: "paused",
                                };
                            }
                            return s;
                        });
                    },
                    matchInterim: true,
                },
                {
                    command: ["Weiter", "Los"],
                    callback: ({ command }) => {
                        console.log({ command });
                        setTimerState((s) => {
                            if (s.status === "paused") {
                                return {
                                    time: s.time,
                                    status: "running",
                                };
                            }
                            return s;
                        });
                    },
                    matchInterim: true,
                },
            ],
        });

    if (!browserSupportsSpeechRecognition) {
        return <h1>Dieser Browser unterstützt keine Spracherkennung</h1>;
    }

    const start = () => {
        setTimerState({
            status: "running",
            time: 5 * 60,
        });
    };

    const pause = () => {
        setTimerState((s) => ({
            ...s,
            status: "paused",
        }));
    };

    const unpause = () => {
        setTimerState((s) => ({
            ...s,
            status: "running",
        }));
    };

    const reset = () => {
        setTimerState({
            status: "ready",
            time: 5 * 60,
        });
    };

    useEffect(() => {
        SpeechRecognition.startListening({ continuous: true, language: "de-DE" });
        //Implementing the setInterval method
        const interval = setInterval(() => {
            if (status === "running") {
                setTimerState((s) => ({
                    ...s,
                    time: s.time - 1,
                }));
            }
        }, 1000);

        //Clearing the interval
        return () => clearInterval(interval);
    }, [status, setTimerState, transcript, resetTranscript]);

    return (
        <div className="App">
            <h1>5-Minuten Dungeon Timer</h1>
            {}

            {status === "ready" ? (
                <button onClick={start}>Start</button>
            ) : status === "running" ? (
                <>
                    <h2>Sag "Halt", "Stop" oder "Pause" um den Timer anzuhalten</h2>
                    <h3>Noch {formatSeconds(time)}</h3> <br />
                    <button onClick={pause}>Pause</button>
                </>
            ) : (
                <>
                    <h2>Sag "Weiter" oder "Los" um den Timer wieder zu starten</h2>
                    <h3>Noch {formatSeconds(time)}</h3> <br />
                    <button onClick={unpause}>Weiter</button>{" "}
                    <button onClick={reset}>Neustart</button>
                </>
            )}
        </div>
    );
}

function formatSeconds(seconds: number): string {
    const min = Math.floor(seconds / 60);
    const s = seconds % 60;

    if (min === 0) {
        return `${s} Sekunden`;
    }

    if (s === 0) {
        return `${min} Minuten`;
    }

    return `${min} Minuten ${s} Sekunden`;
}
