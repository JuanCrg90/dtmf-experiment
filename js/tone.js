'use strict';
var Tone = (function () {
    var Tone = function (wave) {
        this.ctx = new AudioContext();
        this.wave = wave || 'sine'; // sine, square, sawtooth, triangle, custom
        this.stream = this.ctx.destination;
    };

    Tone.prototype.start = function (frequency, duration, when) {
        var osc = this.ctx.createOscillator();
        osc.type = this.wave;
        osc.connect(this.stream);

        when = (when || 0) + this.ctx.currentTime;

        osc.frequency.value = frequency;
        osc.start(when);

        if (duration) {
            osc.stop(when + duration);
        }

        return osc;
    };

    return Tone;
})();