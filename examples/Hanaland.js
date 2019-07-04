class Hanaland {
	constructor() {
		this.size = 2048;
		this.destruct = true;
	}

	reset() {
		this.particles = [];
		this.background = undefined;
	}

	addFlowerParticle(random) {
		const length = Math.floor(random() * this.size / 6 + this.size / 4);

		const x = Math.floor(random() * length * 2 - length);
		const y = Math.floor((random() < 0.5 ? -1 : 1) * (length - Math.abs(x)));
		const size = Math.floor(random() * 70 + 30);
		const rotation = Math.floor(random() * 360);
		const alpha = random() * 0.5 + 0.5;
		const lifespan = Math.floor(30 + random() * 5);

		this.particles.push({
			type: 'flower',

			x: this.size / 2 + x,
			y: this.size / 2 + y,
			rotation, alpha,
			age: 0,
			size: 0,
			life: lifespan,

			velocity: {
				age: 1,
				rotation: (Math.floor(random() * 180) + 5) / lifespan,
				size: 4 * size / lifespan
			},

			acceleration: {
				size: -8 * size / (lifespan * lifespan)
			}
		});
	}

	addAsteroidParticle(random) {
		const tail = random() * this.size / 10 + this.size / 10;
		const position = random() * this.size / 3;
		const fromRight = random() < 0.5;
		const lifespan = Math.floor(30 + random() * 5);
		const vmax = (this.size + tail) / lifespan;
		const vel = random() * vmax * 0.3 + vmax * 0.6;
		const accel = (vmax - vel) * 2 / lifespan;

		this.particles.push({
			type: 'asteroid',

			x: fromRight ? this.size : this.size - position,
			y: fromRight ? position : 0,
			age: 0,
			size: random() * 50 + 100,
			life: lifespan,
			tail,

			velocity: {
				age: 1,
				x: -vel,
				y: vel
			},

			acceleration: {
				x: -accel,
				y: accel
			}
		});
	}

	render(ctx, reanimate) {
		const random = reanimate.random.bind(reanimate);

		if(!this.destruct || reanimate.playing.frame < 115) {
			const flowerBorn = Math.floor(random() * 10 + 10);
			for(let i = 0; i < flowerBorn; i++) {
				this.addFlowerParticle(random);
			}

			if(random() < 0.05) this.addAsteroidParticle(random);
		}

		this.renderBackground(ctx);
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';

		this.particles = this.particles.filter(particle => {
			Object.keys(particle.velocity).forEach(key => {
				particle[key] += particle.velocity[key];
			});

			Object.keys(particle.acceleration).forEach(key => {
				particle.velocity[key] += particle.acceleration[key];
			});

			if(particle.age >= particle.life) {
				return false;
			}

			switch(particle.type) {
				case 'flower':
					this.renderFlower(ctx, particle);
					break;

				case 'asteroid':
					this.renderAsteroid(ctx, particle);
					break;
			}

			return true;
		});

		this.renderAsterisk(ctx);
	}

	renderBackground(ctx) {
		if(!this.background) {
			this.background = ctx.createLinearGradient(0, 0, 0, this.size);
			this.background.addColorStop(0, '#f9abbd');
			this.background.addColorStop(1, '#f8bdc3');
		}

		ctx.fillStyle = this.background;
		ctx.fillRect(0, 0, this.size, this.size);
	}

	renderFlower(ctx, particle) {
		ctx.save();
		ctx.translate(particle.x, particle.y);
		ctx.rotate(particle.rotation * Math.PI / 180);
		ctx.translate(-particle.x, -particle.y);
		ctx.font = `${particle.size}px Lato`;
		ctx.fillStyle =  `rgba(255, 255, 255, ${particle.alpha})`;
		ctx.fillText('✱', particle.x, particle.y);
		ctx.restore();
	}

	renderAsteroid(ctx, particle) {
		/* ctx.font = `${particle.size}px Lato`;
		ctx.fillStyle = '#fff';
		ctx.fillText('✱', particle.x, particle.y); */

		const gap = particle.size * 0.6;
		ctx.beginPath();
		ctx.moveTo(particle.x + gap, particle.y - gap);
		ctx.lineTo(particle.x + gap + particle.tail, particle.y - gap - particle.tail);
		ctx.strokeStyle = '#ffffff80';
		ctx.lineWidth = 15;
		ctx.stroke();
	}

	renderAsterisk(ctx) {
		ctx.textAlign = 'center';
		ctx.textBaseline = 'top';
		ctx.font = `${this.size * 0.5}px Noto Sans CJK KR`;
		ctx.fillStyle =  `#202020`;
		ctx.fillText('*', this.size / 2, this.size / 2 - this.size * 0.13);
	}

	getDescriptor() {
		return {
			width: this.size,
			height: this.size,
			initLength: this.destruct ? 0 : 1,
			maxFrames: 5 * 30,
			duration: 5 * 30,
			fps: 30
		};
	}
}

export default Hanaland
