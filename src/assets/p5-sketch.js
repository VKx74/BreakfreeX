export default function sketch (p) {
    let particles = [];
    let nums;
    let particleDensity = 1000;
    let noiseScale = 1200;
    let maxLife = 15;
    let simulationSpeed = 1.2;
    let fadeFrame = 0;
    let backgroundColor;
    let visualMode = 0;
    let numModes = 4;
    let invertColors = false;
    let colorPalette = [p.color(110,57,204), p.color(7,153,242), p.color(255,255,255), p.color(244,161,66), p.color(77,182,172)];
    let colorIndex = 0;
  
    p.setup = function () {
        nums = p.windowWidth * p.windowHeight / particleDensity;
        backgroundColor = p.color(0, 0, 10);
        p.createCanvas(p.windowWidth, p.windowHeight).parent("particle-container");
        p.background(backgroundColor);
        for(let i = 0; i < nums; i++){
            particles[i] = new Particle(p);
        }
    };

  
    p.draw = function(){
        p.noStroke();
        
        ++fadeFrame;
        if(fadeFrame % 5 == 0){
            if(invertColors){
                p.blendMode(p.ADD);
            } else {
                p.blendMode(p.DIFFERENCE);
            }
            p.fill(1, 1, 1);
            p.rect(0,0,p.width,p.height);
    
            if(invertColors){
                p.blendMode(p.DARKEST);
            } else {
                p.blendMode(p.LIGHTEST);
            }
            p.fill(backgroundColor);
            p.rect(0,0,p.width,p.height);
        }
        
        p.blendMode(p.BLEND);
        p.smooth();
        for(let i = 0; i < nums; i++){
            let iterations = p.map(i,0,nums,5,1);
            let radius = p.map(i,0,nums,1,2);
            particles[i].display(radius);
            particles[i].move(iterations);
            particles[i].checkEdge();
            
            let alpha = 255;
            let particleColor;
            let fadeRatio;
            fadeRatio = p.min(particles[i].life * 5 / maxLife, 1);
            fadeRatio = p.min((maxLife - particles[i].life) * 5 / maxLife, fadeRatio);
            let colorCase = visualMode;
            if(visualMode == 0)
            {
                colorCase = p.int(particles[i].pos.x / p.width * 3) + 1;
            }
            switch(colorCase)
            {
                case 1:
                    let lifeRatioGrayscale = p.min(255, (255 * particles[i].life / maxLife) + p.red(backgroundColor));
                    particleColor = p.color(lifeRatioGrayscale, alpha * fadeRatio);
                    break;
                case 2:
                    particleColor = particles[i].color;
                    break;
                case 3:
                    particleColor = p.color(p.blue(particles[i].color) + 70, p.green(particles[i].color) + 20, p.red(particles[i].color) - 50);
                    break;
            }
            if(invertColors){
                particleColor = p.color(255 - p.red(particleColor), 255 - p.green(particleColor), 255 - p.blue(particleColor));
            }
            p.fill(p.red(particleColor), p.green(particleColor), p.blue(particleColor), alpha * fadeRatio);
            particles[i].display(radius);
        } 
    }
    function Particle(p){
        // member properties and initialization
        this.p = p;
        this.vel = p.createVector(0, 0);
        this.pos = p.createVector(p.random(0, p.width), p.random(0, p.height));
        this.life = p.random(0, maxLife);
        this.flip = p.int(p.random(0,2)) * 2 - 1;
        var randColor = p.int(p.random(0,3));
        this.color = colorPalette[colorIndex];
        colorIndex = (colorIndex + 1) % colorPalette.length;
        switch(randColor)
        {
            case 0:
                this.color = p.color(110,57,204);
                break;
            case 1:
                this.color = p.color(7,153,242);
                break;
            case 2:
                this.color = p.color(255,255,255);
                break;
        }
        
        // member functions
        this.move = function(iterations){
            if((this.life -= 0.06667) < 0)
                this.respawn();
            while(iterations > 0){
                var angle = this.p.noise(this.pos.x/noiseScale, this.pos.y/noiseScale)*this.p.TWO_PI*noiseScale*this.flip;
                this.vel.x = this.p.cos(angle);
                this.vel.y = this.p.sin(angle);
                this.vel.mult(simulationSpeed);
                this.pos.add(this.vel);
                --iterations;
            }
        }
    
        this.checkEdge = function(){
            if(this.pos.x > this.p.width || this.pos.x < 0 || this.pos.y > this.p.height || this.pos.y < 0){
                this.respawn();
            }
        }
        
        this.respawn = function(){
            this.pos.x = this.p.random(0, this.p.width);
            this.pos.y = this.p.random(0, this.p.height);
            this.life = maxLife;
        }
    
        this.display = function(r){
            this.p.ellipse(this.pos.x, this.pos.y, r, r);
        }
    }
    
    function advanceVisual() {
        visualMode = ++visualMode % numModes;
        if (visualMode == 0) {
            invertColors = !invertColors;
            backgroundColor = invertColors ? p.color(235, 235, 235) : p.color(20, 20, 20);
        }
        p.noiseSeed(p.random() * Number.MAX_SAFE_INTEGER);
        p.background(backgroundColor);
        for (let i = 0; i < nums; i++) {
            particles[i].respawn();
            particles[i].life = p.random(0, maxLife);
        }
    }

    p.windowResized = function() {
        if (p.windowWidth >= 600) {
            var oldWidth = p.width;
            var oldHeight = p.height;
            p.resizeCanvas(p.windowWidth, p.windowHeight);

            // Update particle density
            nums = p.windowWidth * p.windowHeight / particleDensity;
            var newParticles = [];
            for (var i = 0; i < nums; i++) {
                if (i < particles.length) {
                    // Update existing particle positions
                    particles[i].pos.x = p.map(particles[i].pos.x, 0, oldWidth, 0, p.width);
                    particles[i].pos.y = p.map(particles[i].pos.y, 0, oldHeight, 0, p.height);
                    newParticles.push(particles[i]);
                } else {
                    // Create new particles
                    newParticles.push(new Particle(p));
                }
            }
            particles = newParticles;
        }
    }
    
  
    // Define the rest of your functions...
    // Remember to replace global p functions with instance functions
    // using the `p` object. For example, `createVector` becomes `p.createVector`.
  };
  