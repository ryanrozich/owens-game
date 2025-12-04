import kaplay from "kaplay";
import "kaplay/global";

// Game constants
const PLAYER_SPEED = 300;
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

// ==================
// AUDIO SYSTEM
// ==================
const AudioManager = {
    context: null,
    muted: false,
    musicGain: null,
    sfxGain: null,
    currentMusic: null,

    init() {
        this.context = new (window.AudioContext || window.webkitAudioContext)();

        // Master gains for music and SFX
        this.musicGain = this.context.createGain();
        this.musicGain.gain.value = 0.3;
        this.musicGain.connect(this.context.destination);

        this.sfxGain = this.context.createGain();
        this.sfxGain.gain.value = 0.5;
        this.sfxGain.connect(this.context.destination);
    },

    resume() {
        if (this.context && this.context.state === 'suspended') {
            this.context.resume();
        }
    },

    toggleMute() {
        this.muted = !this.muted;
        if (this.muted) {
            this.musicGain.gain.value = 0;
            this.sfxGain.gain.value = 0;
        } else {
            this.musicGain.gain.value = 0.3;
            this.sfxGain.gain.value = 0.5;
        }
        return this.muted;
    },

    // Play a synthesized beep/tone
    playTone(frequency, duration, type = 'square', gainValue = 0.3) {
        if (!this.context) this.init();
        this.resume();

        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);

        gainNode.gain.setValueAtTime(gainValue, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(this.sfxGain);

        oscillator.start(this.context.currentTime);
        oscillator.stop(this.context.currentTime + duration);
    },

    // Sound effects
    playFlagPickup() {
        this.playTone(523, 0.1, 'square', 0.3);  // C5
        setTimeout(() => this.playTone(659, 0.1, 'square', 0.3), 100);  // E5
        setTimeout(() => this.playTone(784, 0.15, 'square', 0.3), 200);  // G5
    },

    playFlagCapture() {
        // Victory arpeggio
        this.playTone(523, 0.15, 'square', 0.4);  // C5
        setTimeout(() => this.playTone(659, 0.15, 'square', 0.4), 100);  // E5
        setTimeout(() => this.playTone(784, 0.15, 'square', 0.4), 200);  // G5
        setTimeout(() => this.playTone(1047, 0.3, 'square', 0.4), 300);  // C6
    },

    playPlayerTagged() {
        // Descending sad sound
        this.playTone(400, 0.15, 'sawtooth', 0.3);
        setTimeout(() => this.playTone(300, 0.15, 'sawtooth', 0.3), 100);
        setTimeout(() => this.playTone(200, 0.2, 'sawtooth', 0.3), 200);
    },

    playEnemyTagged() {
        // Quick punch sound
        this.playTone(150, 0.1, 'square', 0.4);
        setTimeout(() => this.playTone(200, 0.1, 'triangle', 0.3), 50);
    },

    playButtonClick() {
        this.playTone(440, 0.05, 'square', 0.2);
    },

    playVictory() {
        // Victory fanfare
        const notes = [523, 523, 523, 659, 784, 659, 784, 1047];
        const durations = [0.15, 0.15, 0.15, 0.15, 0.3, 0.15, 0.15, 0.5];
        let time = 0;
        notes.forEach((note, i) => {
            setTimeout(() => this.playTone(note, durations[i], 'square', 0.4), time);
            time += durations[i] * 600;
        });
    },

    playDefeat() {
        // Sad trombone
        this.playTone(392, 0.3, 'sawtooth', 0.3);  // G4
        setTimeout(() => this.playTone(370, 0.3, 'sawtooth', 0.3), 300);  // F#4
        setTimeout(() => this.playTone(349, 0.3, 'sawtooth', 0.3), 600);  // F4
        setTimeout(() => this.playTone(330, 0.5, 'sawtooth', 0.3), 900);  // E4
    },

    // Background music using oscillators
    startMenuMusic() {
        this.stopMusic();
        if (!this.context) this.init();
        this.resume();

        const playMenuLoop = () => {
            if (this.currentMusic !== 'menu') return;

            // Simple chill melody
            const melody = [262, 294, 330, 294, 262, 330, 392, 330];
            let time = 0;
            melody.forEach((freq, i) => {
                setTimeout(() => {
                    if (this.currentMusic === 'menu') {
                        this.playMusicNote(freq, 0.4, 'sine');
                    }
                }, time);
                time += 400;
            });

            // Loop
            setTimeout(() => playMenuLoop(), time);
        };

        this.currentMusic = 'menu';
        playMenuLoop();
    },

    startGameMusic() {
        this.stopMusic();
        if (!this.context) this.init();
        this.resume();

        const playGameLoop = () => {
            if (this.currentMusic !== 'game') return;

            // Upbeat game melody
            const melody = [330, 392, 440, 392, 523, 440, 392, 330];
            let time = 0;
            melody.forEach((freq, i) => {
                setTimeout(() => {
                    if (this.currentMusic === 'game') {
                        this.playMusicNote(freq, 0.2, 'triangle');
                    }
                }, time);
                time += 250;
            });

            // Loop
            setTimeout(() => playGameLoop(), time);
        };

        this.currentMusic = 'game';
        playGameLoop();
    },

    playMusicNote(frequency, duration, type) {
        if (!this.context) return;

        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);

        gainNode.gain.setValueAtTime(0.15, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(this.musicGain);

        oscillator.start(this.context.currentTime);
        oscillator.stop(this.context.currentTime + duration);
    },

    stopMusic() {
        this.currentMusic = null;
    }
};

// Initialize the game
kaplay({
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    background: [34, 139, 34],
    canvas: document.querySelector("#game"),
});

// ==================
// MENU SCENE
// ==================
scene("menu", () => {
    // Start menu music
    AudioManager.startMenuMusic();

    // Title
    add([
        text("Owen's CTF", { size: 64 }),
        pos(center().x, 120),
        anchor("center"),
        color(255, 255, 255),
    ]);

    // Instructions
    add([
        text("Capture all 3 enemy flags to win!", { size: 24 }),
        pos(center().x, 200),
        anchor("center"),
        color(200, 200, 200),
    ]);

    // Red team button
    const redBtn = add([
        rect(200, 60),
        pos(center().x - 120, 320),
        anchor("center"),
        color(200, 0, 0),
        area(),
        "redBtn",
    ]);

    add([
        text("RED TEAM", { size: 28 }),
        pos(center().x - 120, 320),
        anchor("center"),
        color(255, 255, 255),
    ]);

    // Blue team button
    const blueBtn = add([
        rect(200, 60),
        pos(center().x + 120, 320),
        anchor("center"),
        color(0, 0, 200),
        area(),
        "blueBtn",
    ]);

    add([
        text("BLUE TEAM", { size: 28 }),
        pos(center().x + 120, 320),
        anchor("center"),
        color(255, 255, 255),
    ]);

    // Controls info
    add([
        text("Use Arrow Keys or WASD to move", { size: 18 }),
        pos(center().x, 450),
        anchor("center"),
        color(150, 150, 150),
    ]);

    add([
        text("Tag enemies on YOUR side, avoid them on THEIR side!", { size: 16 }),
        pos(center().x, 490),
        anchor("center"),
        color(150, 150, 150),
    ]);

    // Mute button
    const muteBtn = add([
        rect(50, 50),
        pos(GAME_WIDTH - 35, 35),
        anchor("center"),
        color(80, 80, 80),
        area(),
        "muteBtn",
    ]);

    const muteBtnText = add([
        text(AudioManager.muted ? "🔇" : "🔊", { size: 24 }),
        pos(GAME_WIDTH - 35, 35),
        anchor("center"),
        color(255, 255, 255),
    ]);

    add([
        text("Press M to mute", { size: 14 }),
        pos(center().x, 540),
        anchor("center"),
        color(100, 100, 100),
    ]);

    // Click handlers
    onClick("redBtn", () => {
        AudioManager.playButtonClick();
        go("game", { team: "red" });
    });

    onClick("blueBtn", () => {
        AudioManager.playButtonClick();
        go("game", { team: "blue" });
    });

    onClick("muteBtn", () => {
        const muted = AudioManager.toggleMute();
        muteBtnText.text = muted ? "🔇" : "🔊";
    });

    onKeyPress("m", () => {
        const muted = AudioManager.toggleMute();
        muteBtnText.text = muted ? "🔇" : "🔊";
    });
});

// ==================
// GAME SCENE
// ==================
scene("game", ({ team }) => {
    // Start game music
    AudioManager.startGameMusic();

    // Game state
    let redScore = 0;
    let blueScore = 0;
    const playerTeam = team;

    // Helper function to check which territory a position is in
    function getTerritory(x) {
        if (x < GAME_WIDTH / 2) {
            return "red";
        } else {
            return "blue";
        }
    }

    // Check if object is in enemy territory
    function isInEnemyTerritory(obj) {
        const territory = getTerritory(obj.pos.x);
        return territory !== obj.team;
    }

    // Territory shading effect
    add([
        rect(GAME_WIDTH / 2, GAME_HEIGHT),
        pos(0, 0),
        color(255, 0, 0),
        opacity(0.1),
        z(-1),  // Behind everything
    ]);

    add([
        rect(GAME_WIDTH / 2, GAME_HEIGHT),
        pos(GAME_WIDTH / 2, 0),
        color(0, 0, 255),
        opacity(0.1),
        z(-1),
    ]);

    // Draw the center line (territory divider)
    add([
        rect(4, GAME_HEIGHT),
        pos(GAME_WIDTH / 2, 0),
        color(255, 255, 255),
        opacity(0.5),
        "centerLine",
    ]);

    // Red team base (left side)
    add([
        rect(60, 60),
        pos(40, GAME_HEIGHT / 2),
        anchor("center"),
        color(139, 0, 0),
        area(),
        "redBase",
        "base",
    ]);

    // Blue team base (right side)
    add([
        rect(60, 60),
        pos(GAME_WIDTH - 40, GAME_HEIGHT / 2),
        anchor("center"),
        color(0, 0, 139),
        area(),
        "blueBase",
        "base",
    ]);

    // Flag positions for each team
    const redFlagPositions = [
        { x: 80, y: 150 },
        { x: 60, y: 300 },
        { x: 40, y: 450 },
    ];

    const blueFlagPositions = [
        { x: GAME_WIDTH - 80, y: 150 },
        { x: GAME_WIDTH - 60, y: 300 },
        { x: GAME_WIDTH - 40, y: 450 },
    ];

    // Create red flags
    redFlagPositions.forEach((flagPos, index) => {
        add([
            rect(20, 30),
            pos(flagPos.x, flagPos.y),
            anchor("center"),
            color(255, 0, 0),
            area(),
            "flag",
            "redFlag",
            { flagIndex: index },
        ]);
    });

    // Create blue flags
    blueFlagPositions.forEach((flagPos, index) => {
        add([
            rect(20, 30),
            pos(flagPos.x, flagPos.y),
            anchor("center"),
            color(0, 0, 255),
            area(),
            "flag",
            "blueFlag",
            { flagIndex: index },
        ]);
    });

    // Score display
    const scoreText = add([
        text(`Red: ${redScore}  Blue: ${blueScore}`, { size: 24 }),
        pos(GAME_WIDTH / 2, 30),
        anchor("center"),
        color(255, 255, 255),
        fixed(),
        "scoreText",
    ]);

    // Function to update score display
    function updateScore() {
        scoreText.text = `Red: ${redScore}  Blue: ${blueScore}`;
    }

    // Create a simple patrol enemy
    function createPatrolEnemy(startX, startY, patrolWidth) {
        const enemy = add([
            rect(35, 35),
            pos(startX, startY),
            anchor("center"),
            area(),
            color(100, 100, 100),
            "enemy",
            {
                team: startX < GAME_WIDTH / 2 ? "red" : "blue",
                startX: startX,
                patrolWidth: patrolWidth,
                direction: 1,
                speed: 100,
            },
        ]);

        // Patrol movement
        enemy.onUpdate(() => {
            enemy.move(enemy.direction * enemy.speed, 0);

            if (enemy.pos.x > enemy.startX + enemy.patrolWidth) {
                enemy.direction = -1;
            } else if (enemy.pos.x < enemy.startX) {
                enemy.direction = 1;
            }
        });

        return enemy;
    }

    // Add some enemies to each side
    createPatrolEnemy(150, 200, 100);
    createPatrolEnemy(150, 400, 80);
    createPatrolEnemy(GAME_WIDTH - 250, 200, 100);
    createPatrolEnemy(GAME_WIDTH - 250, 400, 80);

    // Create the player with team state
    const player = add([
        rect(40, 40),
        pos(playerTeam === "red" ? 100 : GAME_WIDTH - 100, GAME_HEIGHT / 2),
        anchor("center"),
        area(),
        color(playerTeam === "red" ? [255, 0, 0] : [0, 0, 255]),
        "player",
        {
            team: playerTeam,
            hasFlag: false,
            carriedFlag: null,
        },
    ]);

    // Player picks up enemy flag
    player.onCollide("flag", (flag) => {
        const isEnemyFlag = (player.team === "red" && flag.is("blueFlag")) ||
                            (player.team === "blue" && flag.is("redFlag"));

        if (isEnemyFlag && !player.hasFlag) {
            player.hasFlag = true;
            player.carriedFlag = flag;
            flag.hidden = true;
            AudioManager.playFlagPickup();
            debug.log("Got the flag! Bring it back to your base!");
        }
    });

    // Player returns flag to their base
    player.onCollide("base", (base) => {
        const isOwnBase = (player.team === "red" && base.is("redBase")) ||
                          (player.team === "blue" && base.is("blueBase"));

        if (isOwnBase && player.hasFlag) {
            if (player.team === "red") {
                redScore++;
            } else {
                blueScore++;
            }

            destroy(player.carriedFlag);
            player.hasFlag = false;
            player.carriedFlag = null;

            AudioManager.playFlagCapture();
            updateScore();
            debug.log("SCORE! Flag captured!");

            // Check for win
            if (redScore >= 3) {
                go("gameover", { winner: "red", playerTeam: playerTeam });
            } else if (blueScore >= 3) {
                go("gameover", { winner: "blue", playerTeam: playerTeam });
            }
        }
    });

    // Battle collision - home field advantage!
    player.onCollide("enemy", (enemy) => {
        const playerInEnemyTerritory = isInEnemyTerritory(player);

        if (playerInEnemyTerritory) {
            AudioManager.playPlayerTagged();
            debug.log("Tagged! Respawning...");

            if (player.hasFlag && player.carriedFlag) {
                player.carriedFlag.hidden = false;
                player.carriedFlag.pos = player.pos.clone();
                player.hasFlag = false;
                player.carriedFlag = null;
            }

            if (player.team === "red") {
                player.pos = vec2(100, GAME_HEIGHT / 2);
            } else {
                player.pos = vec2(GAME_WIDTH - 100, GAME_HEIGHT / 2);
            }
        } else {
            AudioManager.playEnemyTagged();
            debug.log("Enemy tagged! They respawn.");
            enemy.pos = vec2(enemy.startX, enemy.pos.y);
        }
    });

    // Player movement with arrow keys
    onKeyDown("left", () => {
        player.move(-PLAYER_SPEED, 0);
    });

    onKeyDown("right", () => {
        player.move(PLAYER_SPEED, 0);
    });

    onKeyDown("up", () => {
        player.move(0, -PLAYER_SPEED);
    });

    onKeyDown("down", () => {
        player.move(0, PLAYER_SPEED);
    });

    // WASD controls
    onKeyDown("a", () => player.move(-PLAYER_SPEED, 0));
    onKeyDown("d", () => player.move(PLAYER_SPEED, 0));
    onKeyDown("w", () => player.move(0, -PLAYER_SPEED));
    onKeyDown("s", () => player.move(0, PLAYER_SPEED));

    // Keep player inside the game area and show flag indicator
    player.onUpdate(() => {
        if (player.pos.x < 20) player.pos.x = 20;
        if (player.pos.x > GAME_WIDTH - 20) player.pos.x = GAME_WIDTH - 20;
        if (player.pos.y < 20) player.pos.y = 20;
        if (player.pos.y > GAME_HEIGHT - 20) player.pos.y = GAME_HEIGHT - 20;

        if (player.hasFlag) {
            drawRect({
                pos: vec2(player.pos.x, player.pos.y - 35),
                width: 15,
                height: 20,
                anchor: "center",
                color: player.team === "red" ? rgb(0, 0, 255) : rgb(255, 0, 0),
            });
        }
    });

    // Check if we're on a touch device
    const isTouchDevice = "ontouchstart" in window;

    let moveDir = { x: 0, y: 0 };

    if (isTouchDevice) {
        const btnSize = 60;
        const padding = 20;
        const dpadX = padding + btnSize;
        const dpadY = GAME_HEIGHT - padding - btnSize * 1.5;

        const upBtn = add([
            rect(btnSize, btnSize),
            pos(dpadX, dpadY - btnSize),
            anchor("center"),
            color(100, 100, 100),
            opacity(0.7),
            fixed(),
            area(),
            "upBtn",
        ]);
        add([
            text("^", { size: 32 }),
            pos(dpadX, dpadY - btnSize),
            anchor("center"),
            color(255, 255, 255),
            fixed(),
        ]);

        const downBtn = add([
            rect(btnSize, btnSize),
            pos(dpadX, dpadY + btnSize),
            anchor("center"),
            color(100, 100, 100),
            opacity(0.7),
            fixed(),
            area(),
            "downBtn",
        ]);
        add([
            text("v", { size: 32 }),
            pos(dpadX, dpadY + btnSize),
            anchor("center"),
            color(255, 255, 255),
            fixed(),
        ]);

        const leftBtn = add([
            rect(btnSize, btnSize),
            pos(dpadX - btnSize, dpadY),
            anchor("center"),
            color(100, 100, 100),
            opacity(0.7),
            fixed(),
            area(),
            "leftBtn",
        ]);
        add([
            text("<", { size: 32 }),
            pos(dpadX - btnSize, dpadY),
            anchor("center"),
            color(255, 255, 255),
            fixed(),
        ]);

        const rightBtn = add([
            rect(btnSize, btnSize),
            pos(dpadX + btnSize, dpadY),
            anchor("center"),
            color(100, 100, 100),
            opacity(0.7),
            fixed(),
            area(),
            "rightBtn",
        ]);
        add([
            text(">", { size: 32 }),
            pos(dpadX + btnSize, dpadY),
            anchor("center"),
            color(255, 255, 255),
            fixed(),
        ]);

        onTouchStart((touchPos) => {
            if (upBtn.hasPoint(touchPos)) moveDir.y = -1;
            if (downBtn.hasPoint(touchPos)) moveDir.y = 1;
            if (leftBtn.hasPoint(touchPos)) moveDir.x = -1;
            if (rightBtn.hasPoint(touchPos)) moveDir.x = 1;
        });

        onTouchEnd(() => {
            moveDir = { x: 0, y: 0 };
        });

        onUpdate(() => {
            if (moveDir.x !== 0 || moveDir.y !== 0) {
                player.move(moveDir.x * PLAYER_SPEED, moveDir.y * PLAYER_SPEED);
            }
        });
    }

    // Mute button (top right corner)
    const muteBtn = add([
        rect(40, 40),
        pos(GAME_WIDTH - 30, 30),
        anchor("center"),
        color(60, 60, 60),
        opacity(0.8),
        area(),
        fixed(),
        "muteBtn",
    ]);

    const muteBtnText = add([
        text(AudioManager.muted ? "🔇" : "🔊", { size: 20 }),
        pos(GAME_WIDTH - 30, 30),
        anchor("center"),
        color(255, 255, 255),
        fixed(),
    ]);

    onClick("muteBtn", () => {
        const muted = AudioManager.toggleMute();
        muteBtnText.text = muted ? "🔇" : "🔊";
    });

    onKeyPress("m", () => {
        const muted = AudioManager.toggleMute();
        muteBtnText.text = muted ? "🔇" : "🔊";
    });

    debug.log("Game started! Team: " + playerTeam);
});

// ==================
// GAME OVER SCENE
// ==================
scene("gameover", ({ winner, playerTeam }) => {
    // Stop game music and play appropriate sound
    AudioManager.stopMusic();

    const playerWon = winner === playerTeam;
    if (playerWon) {
        AudioManager.playVictory();
    } else {
        AudioManager.playDefeat();
    }

    const winnerColor = winner === "red" ? [255, 0, 0] : [0, 0, 255];

    add([
        text(`${winner.toUpperCase()} WINS!`, { size: 64 }),
        pos(center().x, 200),
        anchor("center"),
        color(...winnerColor),
    ]);

    // Show personalized message
    add([
        text(playerWon ? "Congratulations!" : "Better luck next time!", { size: 28 }),
        pos(center().x, 280),
        anchor("center"),
        color(200, 200, 200),
    ]);

    add([
        text("Click to play again", { size: 24 }),
        pos(center().x, 380),
        anchor("center"),
        color(150, 150, 150),
    ]);

    // Mute button
    const muteBtn = add([
        rect(50, 50),
        pos(GAME_WIDTH - 35, 35),
        anchor("center"),
        color(80, 80, 80),
        area(),
        "muteBtn",
    ]);

    const muteBtnText = add([
        text(AudioManager.muted ? "🔇" : "🔊", { size: 24 }),
        pos(GAME_WIDTH - 35, 35),
        anchor("center"),
        color(255, 255, 255),
    ]);

    onClick("muteBtn", () => {
        const muted = AudioManager.toggleMute();
        muteBtnText.text = muted ? "🔇" : "🔊";
    });

    onKeyPress("m", () => {
        const muted = AudioManager.toggleMute();
        muteBtnText.text = muted ? "🔇" : "🔊";
    });

    onClick(() => {
        AudioManager.playButtonClick();
        go("menu");
    });

    onKeyPress(() => {
        go("menu");
    });
});

// Start at menu
go("menu");
