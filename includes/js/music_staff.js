/**
 * Created by nkarasch on 10/27/16.
 */

var svg = {
    config: {
        scale: 3,
        width: 800,
        height: 300
    },
    vbWidth: function() { return this.config.scale * this.config.width; },
    vbHeight: function() { return this.config.scale * this.config.height; },
    lineSpacing: function() { return this.vbHeight() / 15; },
    getStaff: function() {
        var lines = [];
        for (var i = 0; i < 5; i++) {
            var val = (i + 6) * this.lineSpacing();
            lines.push('<rect width="' + this.vbWidth() + '" height="4.6" ' +
                'transform="translate(0 ' + val + ')"/>');
        }
        return lines.join('');
    },
    getSvg: function(notes) {
        return '<svg width="' + this.config.width + '" height="' + this.config.height + '" ' +
            'viewBox="0 0 ' + this.vbWidth() + ' ' + this.vbHeight() + '">' + this.getStaff() +
            notes.join("") + '</svg>';
    }
};


var initMusicStaff = function(midiFile) {
    var ticksPerBeat = midiFile.header.ticksPerBeat;
    var notes = [];
    var ticks = 0;
    var beatsPerMeasure = 4;
    var musicStaff = $("#music-staff");
    var lastMeasureDisplayed = 0;
    var measureTree = new MeasureTree(4);

    var generateFlagsAndRests = function(tree) {
        // console.log(tree);
        console.log(tree.getNotes());
        var parsedMeasure = measureTree.getNotes();
        for (var beatIndex in parsedMeasure) {
            if (parsedMeasure.hasOwnProperty(beatIndex)) {
                var beat = parsedMeasure[beatIndex];

                // var xAdjustment = (noteData.rawY > 7) ? -28 : 24;
                // var yAdjustment = (noteData.rawY > 7) ? 0 : -165;

                if (beat == "rest") {
                    var noteData = noteInfo.getRest("1");
                    var xOffset = (2 + 9*parseInt(beatIndex))*svg.lineSpacing();
                    var yOffset = 0;
                    notes.push(getSvgElement(noteData.noteHead, xOffset, yOffset));
                    console.log("Quarter Rest found");
                }
                for (var subdivisionKey in beat) {
                    if (beat.hasOwnProperty(subdivisionKey)) {
                        var subdivision = beat[subdivisionKey];
                        // if (subdivision.type == "rest") {
                        //     notes.push(getSvgElement("8th rest", 50, 50)); // FIXME
                        // }
                    }
                }
            }
        }
    };

    var handleNoteOn = function() {
        var exactBeat = ticks / ticksPerBeat;
        var roundedBeat = Math.round(exactBeat * 8) / 8.0;
        var measure = Math.floor(roundedBeat / beatsPerMeasure);
        var measuresPassed = measure - lastMeasureDisplayed;
        if (measuresPassed > 0) {
            for (var i = 0; i < measuresPassed; i++) {
                generateFlagsAndRests(measureTree);
                musicStaff.append(svg.getSvg(notes));
                notes = [];
                measureTree = new MeasureTree(4);
            }
            lastMeasureDisplayed = measure;
        }

        measureTree.add(roundedBeat - measure*4);
        var noteData = noteInfo.getNote(obj.noteNumber);
        var xOffset = (2 + 9*(roundedBeat-measure*4))*svg.lineSpacing();
        var yOffset = noteData.y;
        notes.push(getSvgElement(noteData.noteHead, xOffset, yOffset,
            'id="' + i + '_beat' + roundedBeat + '"'));
        var xAdjustment = (noteData.rawY > 7) ? -28 : 24;
        var yAdjustment = (noteData.rawY > 7) ? 0 : -165;
        notes.push(getSvgElement("stem", xOffset + xAdjustment, yOffset + yAdjustment));
    };

    console.log(midiFile.tracks[0][42]);
    for (var i = 0; i < midiFile.tracks[0].length; i++) {
        var obj = midiFile.tracks[0][i];
        ticks += obj.deltaTime;
        if (obj.subtype == "noteOn" && obj.channel == 9) {
            handleNoteOn(obj, ticks, i);
        }
    }
};


var noteInfo = {
    getNote: function(note) {
        var n = this.notes[String(note)];
        if (n == undefined) {
            return {
                noteHead: this.notes['DEFAULT'].noteHead,
                rawY: this.notes['DEFAULT'].y,
                y: this.notes['DEFAULT'].y * svg.lineSpacing()
            };
        } else {
            return {
                noteHead: n.noteHead,
                rawY: n.y,
                y: n.y * svg.lineSpacing()
            };
        }
    },
    getRest: function(rest) {
        var r = this.rests[String(rest)];
        if (r == undefined) {
            return {
                noteHead: this.rests['DEFAULT'].noteHead,
                rawY: this.rests['DEFAULT'].y,
                y: this.rests['DEFAULT'].y * svg.lineSpacing()
            };
        } else {
            return {
                noteHead: r.noteHead,
                rawY: r.y,
                y: r.y * svg.lineSpacing()
            };
        }
    },
    rests: {
        DEFAULT: { // No SVG shown
            noteHead: "NOT IMPLEMENTED",
            y: 8
        },
        "1": {     // Quarter note rest
            noteHead: "4th rest",
            y: 8
        },
        "0.5": {   // Eighth note rest
            noteHead: "8th rest",
            y: 8
        },
        "0.25": {  // Sixteenth note rest
            noteHead: "16th rest",
            y: 8
        }
    },
    notes: {
        DEFAULT: {
            noteHead: "x",
            y: 12
        },
        35: {  // "Bass Drum 2",
            noteHead: "filled ellipse",
            y: 9.5
        },
        36: {  // "Bass Drum 1",
            noteHead: "filled ellipse",
            y: 9.5
        },
        37: {  // "Side Stick/Rimshot",
            noteHead: "x",
            y: 7.5
        },
        38: {  // "Snare Drum 1",
            noteHead: "filled ellipse",
            y: 7.5
        },
        39: {  // "Hand Clap",
            noteHead: "filled diamond",
            y: 7.5
        },
        40: {  // "Snare Drum 2",
            noteHead: "filled ellipse",
            y: 7.5
        },
        41: {  // "Low Tom 2",
            noteHead: "circled dot",
            y: 9.0
        },
        42: {  // "Closed Hi-hat",
            noteHead: "x",
            y: 6.0
        },
        43: {  // "Low Tom 1",
            noteHead: "circled dot",
            y: 8.5
        },
        44: {  // "Pedal Hi-hat",
            noteHead: "x",
            y: 10.5
        },
        45: {   // "Mid Tom 2",
            noteHead: "circled dot",
            y: 7.0
        },
        46: {   // "Open Hi-hat",
            noteHead: "x open",
            y: 6.0
        },
        47: {   // "Mid Tom 1",
            noteHead: "circled dot",
            y: 7.0
        },
        48: {  // "High Tom 2",
            noteHead: "circled dot",
            y: 6.5
        },
        49: {  // "Crash Cymbal 1",
            noteHead: "x",
            y: 5.0
        },
        50: {  // "High Tom 1",
            noteHead: "circled dot",
            y: 6.5
        },
        51: {  // "Ride Cymbal 1",
            noteHead: "x",
            y: 5.5
        },
        52: {  // "Chinese Cymbal",
            noteHead: "open diamond",
            y: 4.5
        },
        53: {  // "Ride Bell",
            noteHead: "circled x",
            y: 5.5
        },
        // 54: // "Tambourine",
        55: {  // "Splash Cymbal",
            noteHead: "open diamond",
            y: 4.5
        },
        // 56: // "Cowbell",
        57: {  // "Crash Cymbal 2",
            noteHead: "x",
            y: 5.0
        },
        // 58: // "Vibra Slap",
        59: {  // "Ride Cymbal 2",
            noteHead: "x",
            y: 5.5
        }
        // 60: // "High Bongo",
        // 61: // "Low Bongo",
        // 62: // "Mute High Conga",
        // 63: // "Open High Conga",
        // 64: // "Low Conga",
        // 65: // "High Timbale",
        // 66: // "Low Timbale",
        // 67: // "High Agogô",
        // 68: // "Low Agogô",
        // 69: // "Cabasa",
        // 70: // "Maracas",
        // 71: // "Short Whistle",
        // 72: // "Long Whistle",
        // 73: // "Short Güiro",
        // 74: // "Long Güiro",
        // 75: // "Claves",
        // 76: // "High Wood Block",
        // 77: // "Low Wood Block",
        // 78: // "Mute Cuíca",
        // 79: // "Open Cuíca",
        // 80: // "Mute Triangle",
        // 81: // "Open Triangle",
    }
};


// A MeasureTree provides a means to parse measures containing binary divisions of notes (4ths, 8ths, 16ths, etc)
// into more usable data.
function MeasureTree(beats) {
    if ((typeof beats !== "number") || Math.floor(beats) !== beats) {
        throw new TypeError("The MeasureTree constructor must be given an integer!");
    }
    this.beatsPerMeasure = beats;
    this.beats = [];
    for (var i = 0; i < beats; i++) {
        this.beats.push(null);
    }
}
MeasureTree.prototype.add = function(val) {
    if (val >= this.beatsPerMeasure || val < 0) {
        throw new RangeError("Invalid value (" + val + ") added to MeasureTree with beatsPerMeasure=" + this.beatsPerMeasure)
    }
    var beat = Math.floor(val);
    if (this.beats[beat] == null) {
        this.beats[beat] = new Node(val, val);
    } else {
        this.beats[beat].add(val, val);
    }
};
MeasureTree.prototype.getNotes = function() {
    var notes = {};
    for (var i = 0; i < this.beats.length; i++) {
        if (this.beats[i] == null) {
            notes[i] = "rest";
        } else {
            notes[i] = this.beats[i].getNotes(i, 1);
        }
    }
    return notes;
};

function Node(val) {
    // If left or right is null, it means it's a rest. Otherwise, it's a note
    // or has subdivision with a note.
    var decimalPart = val - Math.floor(val);
    if (decimalPart == 0) {
        this.left = null;
        this.right = null;
    } else if (decimalPart < 0.5) {
        this.left = new Node(val * 2);
        this.right = null;
    } else {
        this.left = new Node(0);
        this.right = new Node(val * 2);
    }
}
Node.prototype.add = function(val) {
    var decimalPart = val - Math.floor(val);
    if (decimalPart == 0) {
        // Do nothing
    } else if (decimalPart < 0.5) {
        if (this.left == null) {
            this.left = new Node(val * 2);
        } else {
            this.left.add(val * 2);
        }
    } else {
        if (this.left == null) {
            this.left = new Node(0);
        }
        if (this.right == null) {
            this.right = new Node(val * 2);
        } else {
            this.right.add(val * 2);
        }
    }
};
Node.prototype.getNotes = function(root, noteSize) {
    var notes = {};
    if (this.left == null && this.right == null) {
        notes[String(root)] = {type: "note", size: noteSize};
        return notes;
    }

    if (this.left != null) {
        notes = this.left.getNotes(root, noteSize/2);
    } else {
        notes[String(root)] = {type: "rest", size: noteSize};
    }
    if (this.right != null) {
        notes = $.extend(notes, this.right.getNotes(root + noteSize/2, noteSize/2));
    }
    return notes;
};


// Returns the actual SVG code string for the given `type`, translated by `x` and `y`, and including the
// attributes given in `misc`.
function getSvgElement(type, x, y, misc) {
    if (misc == undefined) {
        misc = "";
    }
    switch (type) {
        case "filled ellipse":
            return '<ellipse transform="translate(' + x + ' ' + y + ') rotate(-30)" ' + misc + '></ellipse>';
        case "circled dot":
            return '<circle cx="' + x + '" cy="' + y + '" r="28" class="open" ' + misc + '></circle>' +
                '<circle cx="' + x + '" cy="' + y + '" r="5"></circle>';
        case "x":
            return '<line x1="' + (x-22) + '" y1="' + (y-22) + '" x2="' + (x+22) +'" y2="' + (y+22) + '" ' +
                misc + '></line>' +
                '<line x1="' + (x+22) + '" y1="' + (y-22) + '" x2="' + (x-22) +'" y2="' + (y+22) + '"></line>';
        case "x open":
            return '<line x1="' + (x-22) + '" y1="' + (y-22) + '" x2="' + (x+22) +'" y2="' + (y+22) + '" ' +
                misc + '></line>' +
                '<line x1="' + (x+22) + '" y1="' + (y-22) + '" x2="' + (x-22) +'" y2="' + (y+22) + '"></line>' +
                '<circle cx="' + x + '" cy="' + (y-50) + '" r="10" class="open"></circle>';
        case "circled x":
            return '<line x1="' + (x-22) + '" y1="' + (y-22) + '" x2="' + (x+22) +'" y2="' + (y+22) + '"></line>' +
                '<line x1="' + (x+22) + '" y1="' + (y-22) + '" x2="' + (x-22) +'" y2="' + (y+22) + '"></line>' +
                '<circle cx="' + x + '" cy="' + y + '" r="28" ' + misc + '></circle>';
        case "filled diamond":
            return '<polygon points="0,-28 28,0 0,28 -28,0" transform="translate(' + x + ' ' + y + ')" ' +
                misc + '></polygon>';
        case "open diamond":
            return '<polygon points="0,-24 24,0 0,24 -24,0" transform="translate(' +
                x + ' ' + y + ')" class="open" ' + misc + '></polygon>';
        case "stem":
            return '<rect width="4.6" height="165" transform="translate(' + x + ' ' + y + ')" ' + misc + '></rect>';
        case "8th flag":
            return '<g transform="translate(' + x + ' ' + y + ')" ' + misc + '>' +
                '<path style="image-rendering:optimizeQuality;shape-rendering:geometricPrecision" ' +
                'd="m246 301h4.33c1.08 6.91 2.44 12.7 4.24 17.4 1.71 4.63 3.79 8.63 6.05 12 2.35 3.36 5.87 7.63 ' +
                '10.6 12.9 4.69 5.27 8.39 9.72 11.3 13.5 8.66 11.2 13 22.9 13 35.1 0 12.5-5.23 27.8-15.9 ' +
                '45.8h-2.89c1.35-3.18 2.98-6.82 4.78-10.9 1.71-4.18 3.25-7.91 4.51-11.3 1.17-3.36 2.17-6.73 ' +
                '2.89-10.1 0.632-3.36 0.993-6.63 0.993-9.91 0-5.18-0.993-10.4-3.07-15.5-2.08-5.27-5.05-10.1-8.75' +
                '-14.5-3.79-4.45-8.03-8-12.8-10.8-4.78-2.73-9.75-4.27-14.9-4.54l-4.33-1.45z" ' +
                'fill-rule="evenodd" /></g>';
        case "16th flag":
            return '<g transform="translate(' + x + ' ' + y + ')" ' + misc + '>' +
                '<path style="image-rendering:optimizeQuality;shape-rendering:geometricPrecision" ' +
                'd="m387 477v-72.3h4.69c0.632 7 2.17 12.5 4.69 16.2 2.44 3.73 6.5 8.18 12.3 13.2 5.69 5.09 10.1 ' +
                '9.72 13.4 13.9 4.69 5.91 8.21 11.6 10.7 17.1 2.44 5.45 3.7 11.7 3.7 18.9 0 5.54-0.812 11.3-2.53 ' +
                '17.3 3.16 4.27 4.69 11 4.69 20 0 5.82-0.722 11.5-2.26 17.3-1.62 5.73-3.88 10.7-6.86 14.9h-' +
                '2.98c5.69-11.1 8.48-20.8 8.48-29.1 0-15.8-9.11-28.4-27.4-37.6-1.35-0.727-3.25-1.91-5.69-3.64-' +
                '2.53-1.64-4.51-3-5.78-3.82-1.35-0.818-2.8-1.64-4.42-2.18zm5.78-38.5c0 8 2.08 14.9 6.23 20.7 ' +
                '4.24 5.82 10.2 12.5 18 20 7.76 7.54 12.6 13.2 14.6 17 0.451-2.36 0.632-4.91 0.632-7.63 0-6-' +
                '1.17-11.6-3.61-16.7-2.44-5.18-5.6-9.82-9.39-13.8-3.79-4-7.94-7.54-12.4-10.7-4.51-3.18-9.2-6.09-' +
                '14.2-8.82z" fill-rule="evenodd" /></g>';
        case "4th rest":
            return '<g transform="translate(' + (x-4900) + ' ' + (y-720) + ')" ' + misc + '>' +
                '<g fill-rule="evenodd" transform="matrix(1.8 0 0 1.8 -644 352) scale(6 6)" stroke-miterlimit="10" ' +
                'stroke-width="0">' +
                '<path d="m512 71c-0.137 0.058-0.219 0.258-0.156 0.398 0.019 0.02 0.218 0.258 0.418 0.52 0.457 ' +
                '0.515 0.535 0.637 0.636 0.875 0.399 0.816 0.18 1.86-0.519 2.51-0.059 0.078-0.317 0.296-0.559 ' +
                '0.476-0.695 0.598-1.02 0.938-1.13 1.24-0.043 0.079-0.043 0.157-0.043 0.278-0.019 0.277 0 0.301 ' +
                '0.821 1.25 1.11 1.34 1.91 2.27 1.97 2.33l0.059 0.058-0.078-0.039c-1.1-0.457-2.33-0.676-2.75-' +
                '0.476-0.141 0.058-0.223 0.14-0.281 0.277-0.161 0.34-0.118 0.84 0.121 1.57 0.218 0.66 0.656 1.54 ' +
                '1.09 2.19 0.18 0.281 0.52 0.718 0.559 0.738 0.059 0.059 0.141 0.039 0.199 0 0.059-0.078 0.059-' +
                '0.141-0.058-0.277-0.418-0.598-0.617-1.84-0.379-2.49 0.097-0.296 0.219-0.457 0.437-0.558 0.578-' +
                '0.258 1.86 0.062 2.39 0.597 0.039 0.04 0.121 0.122 0.16 0.141 0.141 0.059 0.34-0.019 0.399-0.16 ' +
                '0.082-0.141 0.039-0.238-0.141-0.457-0.336-0.399-1.35-1.59-1.49-1.77-0.36-0.418-0.52-0.816-0.559-' +
                '1.32-0.019-0.637 0.238-1.31 0.719-1.75 0.058-0.078 0.316-0.297 0.555-0.476 0.738-0.618 1.04-' +
                '0.957 1.16-1.28 0.082-0.258 0.043-0.496-0.137-0.715-0.062-0.058-0.758-0.918-1.57-1.89-1.12-1.31-' +
                '1.52-1.79-1.57-1.81-0.082-0.019-0.18-0.019-0.262 0.02z" /></g></g>';
        case "8th rest":
            return '<g transform="translate(' + x + ' ' + y + ')" ' + misc + '>' +
                '<g fill-rule="evenodd" transform="matrix(1.8 0 0 1.8 -593 341)" stroke-miterlimit="10">' +
                '<path stroke="#000" d="m531 74.8c-0.52 0.098-0.918 0.457-1.1 0.953-0.039 0.16-0.039 0.199-0.039 ' +
                '0.418 0 0.301 0.019 0.461 0.16 0.699 0.199 0.399 0.617 0.719 1.09 0.836 0.5 0.141 1.34 0.02 ' +
                '2.29-0.297l0.238-0.082-1.18 3.25-1.16 3.25s0.039 0.02 0.102 0.063c0.117 0.078 0.316 0.137 0.457 ' +
                '0.137 0.238 0 0.539-0.137 0.578-0.258 0-0.039 0.558-1.93 1.23-4.18l1.2-4.12-0.039-0.058c-0.097-' +
                '0.121-0.296-0.16-0.418-0.063-0.039 0.039-0.101 0.121-0.14 0.18-0.18 0.301-0.637 0.836-0.875 ' +
                '1.04-0.219 0.18-0.34 0.199-0.539 0.121-0.18-0.098-0.239-0.199-0.36-0.738-0.117-0.535-0.257-' +
                '0.778-0.558-0.977-0.278-0.179-0.637-0.238-0.953-0.156z"/></g></g>';
        case "16th rest":
            return '<g transform="translate(' + x + ' ' + y + ')" ' + misc + '>' +
                '<g fill-rule="evenodd" transform="matrix(1.8 0 0 1.8 -649 265)" stroke-miterlimit="10">' +
                '<path d="m544 74.8c-0.519 0.098-0.918 0.457-1.09 0.953-0.043 0.16-0.043 0.199-0.043 0.418 0 ' +
                '0.301 0.019 0.461 0.16 0.699 0.199 0.399 0.617 0.719 1.1 0.836 0.496 0.141 1.29 0.039 2.25-' +
                '0.277 0.14-0.059 0.257-0.102 0.257-0.082 0 0.023-0.894 2.93-0.933 3.03-0.102 0.258-0.442 0.735-' +
                '0.739 1.04-0.277 0.278-0.418 0.34-0.636 0.239-0.18-0.098-0.239-0.2-0.36-0.739-0.101-0.398-0.179-' +
                '0.617-0.339-0.773-0.418-0.461-1.14-0.52-1.69-0.16-0.262 0.179-0.461 0.457-0.578 0.758-0.043 ' +
                '0.156-0.043 0.199-0.043 0.417 0 0.297 0.023 0.458 0.16 0.696 0.199 0.398 0.617 0.719 1.1 0.836 ' +
                '0.219 0.062 0.777 0.062 1.16 0 0.316-0.059 0.695-0.157 1.07-0.278 0.16-0.058 0.301-0.097 0.301-' +
                '0.078 0 0-1.95 6.36-1.99 6.45 0 0.02 0.156 0.141 0.316 0.18 0.16 0.063 0.321 0.063 0.481 0 ' +
                '0.156-0.039 0.316-0.137 0.316-0.199 0.02-0.02 0.817-3.03 1.79-6.68l1.77-6.63-0.039-0.058c-' +
                '0.079-0.121-0.239-0.141-0.379-0.082-0.079 0.039-0.079 0.039-0.317 0.398-0.199 0.32-0.48 0.656-' +
                '0.64 0.816-0.219 0.18-0.336 0.219-0.536 0.141-0.179-0.098-0.242-0.199-0.359-0.738-0.121-0.535-' +
                '0.262-0.778-0.559-0.977-0.277-0.179-0.636-0.238-0.957-0.156z" stroke="#000"/></g></g>';
        default:
            return '';
    }
}
