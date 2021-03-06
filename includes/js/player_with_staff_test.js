var songId = 0;
var songs = ["Take_The_Money_And_Run_Steve_Miller_Band_Greatest_Hits_1974-78_1.mid"];
var player;
var drumTrack = 9;
if (typeof (console) === "undefined") var console = {
    log: function () {
    }
};
// Toggle between Pause and Play modes.
var pausePlayStop = function (stop) {
    var d = document.getElementById("pausePlayStop");
    if (stop) {
        MIDI.Player.stop();
        d.src = "includes/images/play.png";
    } else if (MIDI.Player.playing) {
        d.src = "includes/images/play.png";
        MIDI.Player.pause(true);
    } else {
        d.src = "includes/images/pause.png";
        MIDI.Player.resume();
    }
};

//noinspection JSUnusedLocalSymbols
eventjs.add(window, "load", function (event) {
    /// Show a loading image while everything is loading up
    MIDI.loader = new sketch.ui.Timer;

    /// Load the MIDI plugin to play music
    MIDI.loadPlugin({
        soundfontUrl: "includes/soundfonts/",
        instrument: "synth_drum",
        onprogress: function (state, progress) {
            // update the MIDI loader progress graphic as it loads
            MIDI.loader.setValue(progress * 100);
        },
        onsuccess: function () {
            player = MIDI.Player;
            player.timeWarp = 1; // speed the song is played back
            player.loadFile("midi_files/" + songs[songId], onSuccessfulSongLoad);

            /// Handle note events
            player.addListener(function (data) {
                // console.log(data);
            });

            /// Show the player progress bar
            MIDIPlayerPercentage(player);
        }
    });

    /// Load the MidiFile for parsing as staff music
    parse_midi(songs[songId], songs[songId], function(midiFile) {
        // console.log(midiFile);
        initMusicStaff(midiFile);
    });
});

var onSuccessfulSongLoad = function (onsuccess) {
    // Add MIDI drums
    MIDI.programChange(drumTrack, MIDI.GM.byName["synth_drum"].number);
    //TODO figure out how to get other instruments playing too.

    // Start the player
    // player.start(onsuccess);
};

var MIDIPlayerPercentage = function (player) {
    // update the timestamp
    var time1 = document.getElementById("time1");
    var time2 = document.getElementById("time2");
    var capsule = document.getElementById("capsule");
    var timeCursor = document.getElementById("cursor");

    // Adjust the play location when the user click-drags in the song progress bar.
    eventjs.add(capsule, "drag", function (event, self) {
        eventjs.cancel(event);
        player.currentTime = (self.x) / 650 * player.endTime;
        if (player.currentTime < 0) player.currentTime = 0;
        if (player.currentTime > player.endTime) player.currentTime = player.endTime;
        if (self.state === "down") {
            player.pause(true);
        } else if (self.state === "up") {
            player.resume();
        }
    });

    function timeFormatting(n) {
        var minutes = n / 60 >> 0;
        var seconds = String(n - (minutes * 60) >> 0);
        if (seconds.length == 1) seconds = "0" + seconds;
        return minutes + ":" + seconds;
    }

    player.getNextSong = function (n) {
        var id = Math.abs((songId += n) % songs.length);
        player.loadFile("midi_files/" + songs[id], onSuccessfulSongLoad);
    };

    //noinspection JSUnusedLocalSymbols
    player.setAnimation(function (data, element) {
        var percent = data.now / data.end;
        var now = data.now >> 0; // where we are now
        var end = data.end >> 0; // end of song
        if (now === end) { // go to next song
            var id = ++songId % songs.length;
            player.loadFile("midi_files/" + songs[id], player.start); // load MIDI
        }
        // display the information to the user
        timeCursor.style.width = (percent * 100) + "%";
        time1.innerHTML = timeFormatting(now);
        time2.innerHTML = "-" + timeFormatting(end - now);
    });
};
