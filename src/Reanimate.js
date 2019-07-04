import {toUint8Array} from "./Utils";
import Tar from "tar-js";

class Reanimate {
	constructor(animation) {
		this.animation = animation;
		this.descriptor = animation.getDescriptor();

		this.playing = {
			playing: false,
			loop: 0,
			loopCount: 0,
			frame: 0
		};

		this.capturing = undefined;
		this.interval = null;

		this.frames = {};

		this.canvas = document.createElement('canvas');
		this.canvas.width = this.descriptor.width;
		this.canvas.height = this.descriptor.height;

		this.ctx = this.canvas.getContext('2d');

		this.randomTracker = [];
		this.randomCount = 0;

		this.animation.reset();
	}

	init() {
		this.interval = setInterval(() => {
			this.render();
		}, 1000 / this.descriptor.fps);
	}

	destroy() {
		clearInterval(this.interval);
	}

	attach(element) {
		if(typeof element === 'string') element = document.querySelector(element);

		element.appendChild(this.canvas);
	}

	play(loopCount = Infinity, reset = true) {
		if(reset) this.reset();

		this.playing.playing = true;
		this.playing.loopCount += loopCount;
	}

	stop() {
		this.playing.playing = false;
		this.playing.loopCount = 0;
	}

	reset(resetRandom = true) {
		this.animation.reset();
		this.playing.frame = 0;
		this.playing.loop = 0;

		if(resetRandom) this.randomTracker = [];
	}

	capture() {
		this.frames = {
			init: {
				frames: [],
				index: 0
			},
			loop: {
				frames: [],
				index: 0
			}
		};

		this.reset(false);
		this.stop();

		this.capturing = 'init';
		this.play(this.descriptor.initLength, false);
	}

	render() {
		if(!this.playing.playing) return;

		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.animation.render(this.ctx, this);
		this.onFrame();

		this.playing.frame++;
		if(this.playing.frame >= this.descriptor.duration) {
			this.playing.frame = 0;
			this.playing.loop++;
			this.onLoop();

			if(this.playing.loop >= this.playing.loopCount) {
				this.playing.playing = false;
			}
		}
	}

	captureFrame() {
		return toUint8Array(this.canvas.toDataURL());
	}

	downloadFrameTar() {
		const tarball = new Tar();
		const offset = this.frames[this.capturing].index;

		this.frames[this.capturing].frames.forEach((f, i) => {
			tarball.append(`${offset + i}.png`, f);
		});

		const tarArray = tarball.out;

		this.frames[this.capturing].index += this.frames[this.capturing].frames.length;
		this.frames[this.capturing].frames = [];

		if(this.frames[this.capturing].name === undefined) {
			this.frames[this.capturing].name = 0;
		}

		this.frames[this.capturing].name++;

		const blob = new Blob([tarArray], {type: 'data:application/tar'});
		const url = URL.createObjectURL(blob);

		const link = document.createElement('a');
		link.href = url;
		link.download = `${this.capturing}-${this.frames[this.capturing].name}.tar`;
		link.click();

		setTimeout(() => URL.revokeObjectURL(url), 3000);
	}

	onFrame() {
		this.randomCount = 0;
		if(this.capturing) {
			this.frames[this.capturing].frames.push(this.captureFrame());

			if(this.frames[this.capturing].frames.length > this.descriptor.maxFrames) {
				this.downloadFrameTar();
			}
		}
	}

	onLoop() {
		if(this.capturing) {
			this.downloadFrameTar();

			if(this.capturing === 'init') {
				this.capturing = 'loop';
				this.play(1, false);
			}
		}
	}

	random() {
		if(!this.randomTracker[this.playing.frame]) {
			this.randomTracker[this.playing.frame] = [];
		}

		const frameRandom = this.randomTracker[this.playing.frame];

		if(frameRandom[this.randomCount] === undefined) {
			frameRandom[this.randomCount] = Math.random();
		}

		const randomized = frameRandom[this.randomCount];
		this.randomCount++;

		return randomized;
	}
}

export default Reanimate;
