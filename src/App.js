import React, {useState, useEffect, useRef} from 'react';
import Soundfont from 'soundfont-player';
import './App.css';


const allNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'Bb', 'B'];
const majorScaleIntervals = [0, 2, 4, 5, 7, 9, 11];
const minorScaleIntervals = [0, 2, 3, 5, 7, 8, 10];

let piano = null;

const App = () => {
    const [key, setKey] = useState('C');
    const [octave, setOctave] = useState(4);
    const [mode, setMode] = useState('Major');
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

        const intervals = mode === 'Major' ? majorScaleIntervals : minorScaleIntervals;

        return intervals.map((interval, i) => {
            let noteIndex = (rootIndex + interval) % allNotes.length;
            let noteOctave = octave; // Default to the current octave

            if (rootIndex + interval >= allNotes.length) {
                noteOctave += 1;
            }

            return {note: allNotes[noteIndex], octave: noteOctave};
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
            // Handle up and down arrow keys for changing the octave
            if (event.key === 'ArrowUp') {
                setOctave(prevOctave => Math.min(prevOctave + 1, 8)); // Max octave is 8
            }
            if (event.key === 'ArrowDown') {
                setOctave(prevOctave => Math.max(prevOctave - 1, 1)); // Min octave is 1
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [key, octave, mode]);

    const handleOctaveChange = (event) => {
        setOctave(Number(event.target.value));
    };

    const handleKeyChange = (event) => {
        setKey(event.target.value);
    };

    const handleModeChange = (event) => {
        setMode(event.target.value);
    };

    const scaleNotes = getScaleNotesWithOctave();

    const noteLabels = mode === 'Major' ? ['1', '2', '3', '4', '5', '6', '7', '1']
        : ['1', '2', 'b3', '4', '5', 'b6', 'b7', '1'];

    const noteColors = mode === 'Major' ? ['red', 'gray', 'gray', 'turquoise', 'gray', 'gray', 'orange', 'red']
        : ['red', 'gray', 'turquoise', 'gray', 'gray', 'orange', 'turquoise', 'red'];

    return (
        <div className="app">
            <h1>{mode} Scale Piano Player</h1>

            <div className="note-grid-wrapper"> {/* Center the note grid using Flexbox */}
                <div className="note-grid">
                    {scaleNotes.map((_, index) => (
                        <div
                            key={index}
                            id={`note-${index + 1}`} // Assign each note a unique ID
                            className={`note note-${index + 1}`} // Give each note a unique class
                            onClick={() => handlePlayNote(index)}
                            style={{backgroundColor: noteColors[index]}} // Apply dynamic background color
                        >
                            {noteLabels[index]} {/* Display the appropriate label */}
                        </div>
                    ))}
                    {/* The 8th button to play the tonic (1st note) in the next octave */}
                    <div
                        id="note-8" // Unique ID for the 8th note
                        className="note note-8" // Use the correct class "note-8"
                        onClick={() => handlePlayNote(0, true)} // Play the first note in the next octave
                        style={{backgroundColor: noteColors[7]}} // Apply dynamic background color
                    >
                        {noteLabels[7]} {/* Display the appropriate label for the octave */}
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

                <label>
                    Mode:
                    <select value={mode} onChange={handleModeChange}>
                        <option value="Major">Major</option>
                        <option value="Minor">Minor</option>
                    </select>
                </label>
            </div>
        </div>
    );


};

export default App;
