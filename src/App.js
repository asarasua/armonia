import React, { useState, useEffect, useRef } from 'react';
import Soundfont from 'soundfont-player';
import './App.css';


const allNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'Bb', 'B'];
const majorScaleIntervals = [0, 2, 4, 5, 7, 9, 11];

let piano = null;

const App = () => {
    const [key, setKey] = useState('C');
    const [octave, setOctave] = useState(4);
    const noteTimeouts = useRef(Array(8).fill(null));

    useEffect(() => {
        // Load the piano soundfont when the app starts
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        Soundfont.instrument(audioContext, 'acoustic_grand_piano').then((pianoInstrument) => {
            piano = pianoInstrument;
        });
    }, []);

    const getScaleNotesWithOctave = () => {
        const rootIndex = allNotes.indexOf(key);
        if (rootIndex === -1) return [];

        return majorScaleIntervals.map((interval, i) => {
            let noteIndex = (rootIndex + interval) % allNotes.length;
            let noteOctave = octave; // Default to the current octave

            if (rootIndex + interval >= allNotes.length) {
                noteOctave += 1;
            }

            return { note: allNotes[noteIndex], octave: noteOctave };
        });
    };

    const handlePlayNote = (noteIndex, isNextOctave = false) => {
        const scaleNotes = getScaleNotesWithOctave();
        const noteOctave = isNextOctave ? octave + 1 : scaleNotes[noteIndex].octave;
        const note = scaleNotes[noteIndex].note + noteOctave; // e.g., "C4"

        if (piano) {
            const playedNote = piano.play(note);
            setTimeout(() => {
                playedNote.stop();
            }, 500);
        }

        triggerAnimation(noteIndex, isNextOctave);
    };

    const triggerAnimation = (noteIndex, isNextOctave) => {
        const noteId = isNextOctave ? 'note-8' : `note-${noteIndex + 1}`;
        const noteElement = document.getElementById(noteId);

        if (noteElement) {
            // Cancel any existing timeout for this note (if it was played before the previous timeout ended)
            if (noteTimeouts.current[isNextOctave ? 7 : noteIndex]) {
                clearTimeout(noteTimeouts.current[isNextOctave ? 7 : noteIndex]);
            }

            // Add the 'playing' class to trigger the animation
            noteElement.classList.add('playing');

            noteTimeouts.current[isNextOctave ? 7 : noteIndex] = setTimeout(() => {
                noteElement.classList.remove('playing');
            }, 500); // Animation duration is 0.5 seconds
        }
    };

    useEffect(() => {
        const handleKeyDown = (event) => {
            const keyMap = {
                '1': 0,
                '2': 1,
                '3': 2,
                '4': 3,
                '5': 4,
                '6': 5,
                '7': 6,
                '8': 'octave1',
            };
            if (keyMap[event.key] !== undefined) {
                if (keyMap[event.key] === 'octave1') {
                    handlePlayNote(0, true);
                } else {
                    handlePlayNote(keyMap[event.key]);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [key, octave]);

    const handleOctaveChange = (event) => {
        setOctave(Number(event.target.value));
    };

    const handleKeyChange = (event) => {
        setKey(event.target.value);
    };

    const scaleNotes = getScaleNotesWithOctave();

    return (
        <div className="app">
            <h1>Major</h1>

            <div className="note-grid-wrapper">
                <div className="note-grid">
                    {scaleNotes.map((_, index) => (
                        <div
                            key={index}
                            id={`note-${index + 1}`}
                            className={`note note-${index + 1}`}
                            onClick={() => handlePlayNote(index)}
                        >
                            {index + 1}
                        </div>
                    ))}
                    <div
                        id="note-8"
                        className="note note-8"
                        onClick={() => handlePlayNote(0, true)}
                    >
                        1
                    </div>
                </div>
            </div>

            <div className="controls">
                <label>
                    Key:
                    <select value={key} onChange={handleKeyChange}>
                        {allNotes.map((note, index) => (
                            <option key={index} value={note}>{note}</option>
                        ))}
                    </select>
                </label>

                <label>
                    Octave:
                    <input
                        type="number"
                        value={octave}
                        onChange={handleOctaveChange}
                        min="1"
                        max="8"
                    />
                </label>
            </div>
        </div>
    );
};

export default App;
