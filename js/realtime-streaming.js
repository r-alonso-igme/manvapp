// Firebase Realtime Streaming Module
import firebaseConfig from './firebase-config.js';

class RealtimeScoreboard {
    constructor() {
        this.isFirebaseEnabled = false;
        this.database = null;
        this.currentMatchRef = null;
        this.isReferee = false;
        this.matchId = null;
        this.connectedUsers = 0;
        this.uiInitialized = false;
        this.streamingStartTime = null;
        this.streamingTimer = null;
        
        this.initFirebase();
    }

    async initFirebase() {
        try {
            // Check if Firebase config is properly set
            if (firebaseConfig.apiKey === "YOUR_API_KEY") {
                console.log("Firebase not configured yet. Running in offline mode.");
                this.showFirebaseSetupInstructions();
                return;
            }

            // Load Firebase scripts dynamically
            await this.loadFirebaseScripts();
            
            // Initialize Firebase using global variables
            const app = firebase.initializeApp(firebaseConfig);
            this.database = firebase.database(app);
            this.isFirebaseEnabled = true;
            
            // Store Firebase functions for later use - using global firebase object
            this.firebaseFunctions = {
                ref: (path) => firebase.database().ref(path),
                onValue: (ref, callback, options) => ref.on('value', callback, options),
                set: (ref, value) => ref.set(value),
                push: (ref, value) => ref.push(value),
                onDisconnect: (ref) => ref.onDisconnect(),
                serverTimestamp: firebase.database.ServerValue.TIMESTAMP
            };
            
            console.log("Firebase initialized successfully!");
            this.setupUI();
            this.showStreamingControls();
            
        } catch (error) {
            console.error("Error initializing Firebase:", error);
            this.showFirebaseError(error.message);
        }
    }

    async loadFirebaseScripts() {
        return new Promise((resolve, reject) => {
            // Check if Firebase is already loaded
            if (window.firebase) {
                resolve();
                return;
            }

            // Load Firebase core
            const firebaseCore = document.createElement('script');
            firebaseCore.src = 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js';
            
            firebaseCore.onload = () => {
                // Load Firebase Database
                const firebaseDatabase = document.createElement('script');
                firebaseDatabase.src = 'https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js';
                
                firebaseDatabase.onload = () => resolve();
                firebaseDatabase.onerror = () => reject(new Error('Failed to load Firebase Database'));
                
                document.head.appendChild(firebaseDatabase);
            };
            
            firebaseCore.onerror = () => reject(new Error('Failed to load Firebase Core'));
            document.head.appendChild(firebaseCore);
        });
    }

    setupUI() {
        // Prevent duplicate UI initialization
        if (this.uiInitialized || document.getElementById('streaming-controls')) {
            return;
        }
        this.uiInitialized = true;
        
        // Add streaming controls to the page
        const streamingHTML = `
            <div id="streaming-controls" class="streaming-section" style="display: none;">
                <h3>🔴 Streaming en Tiempo Real</h3>
                <div class="streaming-options">
                    <button id="startRefereeBtn" class="btn btn-primary" title="Solo administradores">
                        👨‍⚖️ Iniciar como Árbitro
                    </button>
                    <button id="joinSpectatorBtn" class="btn btn-secondary">
                        👁️ Unirse como Espectador
                    </button>
                </div>
                <div class="admin-info">
                    <p style="font-size: 0.9rem; color: var(--text-light); margin-top: 0.5rem;">
                        <strong>Nota:</strong> Se requiere contraseña de administrador para iniciar como árbitro
                    </p>
                </div>
                <div id="match-info" style="display: none;">
                    <div class="live-indicator">
                        <div class="live-animation">🔴 EN VIVO</div>
                        <div class="streaming-time">
                            <strong>⏱️ Tiempo Activo:</strong> <span id="streaming-timer">00:00:00</span>
                        </div>
                    </div>
                    <div class="match-details">
                        <p><strong>ID del Partido:</strong> <span id="current-match-id"></span></p>
                        <p><strong>Usuarios Conectados:</strong> <span id="connected-count">0</span></p>
                        <p><strong>Tu Rol:</strong> <span id="user-role"></span></p>
                    </div>
                    <div class="sharing-options">
                        <button id="shareMatchBtn" class="btn btn-export">📱 Compartir Partido</button>
                        <button id="qrCodeBtn" class="btn btn-secondary">📱 Mostrar QR</button>
                        <button id="stopStreamingBtn" class="btn" style="background: #ef4444; color: white;">
                            ⏹️ Detener Streaming
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Indicador EN VIVO para espectadores -->
            <div id="spectator-live-indicator" class="live-indicator" style="display: none;">
                <div class="live-animation">🔴 VIENDO EN VIVO</div>
                <div class="streaming-time">
                    <strong>⏱️ Tiempo de Transmisión:</strong> <span id="spectator-timer">00:00:00</span>
                </div>
            </div>
            
            <div id="firebase-setup" class="setup-instructions" style="display: none;">
                <h3>🔧 Configuración Firebase Requerida</h3>
                <div class="setup-steps">
                    <ol>
                        <li>Ve a <a href="https://console.firebase.google.com/" target="_blank">Firebase Console</a></li>
                        <li>Crea un nuevo proyecto</li>
                        <li>Activa "Realtime Database"</li>
                        <li>Ve a Configuración del Proyecto > Aplicaciones Web</li>
                        <li>Copia la configuración a <code>js/firebase-config.js</code></li>
                    </ol>
                    <button id="retryFirebaseBtn" class="btn btn-primary">🔄 Reintentar Conexión</button>
                </div>
            </div>

            <div id="qr-modal" class="modal-overlay" style="display: none;">
                <div class="modal-content">
                    <h3>📱 Escanea para Unirte</h3>
                    <div id="qr-code"></div>
                    <p>O comparte este enlace:</p>
                    <input type="text" id="share-url" readonly style="width: 100%; padding: 0.5rem; margin: 1rem 0;">
                    <button id="closeQrBtn" class="btn btn-secondary">Cerrar</button>
                </div>
            </div>
        `;

        // Insert after game controls
        const gameControls = document.querySelector('.game-controls');
        gameControls.insertAdjacentHTML('afterend', streamingHTML);
        
        this.bindStreamingEvents();
    }

    bindStreamingEvents() {
        // Referee mode
        document.getElementById('startRefereeBtn')?.addEventListener('click', () => {
            this.startAsReferee();
        });

        // Spectator mode
        document.getElementById('joinSpectatorBtn')?.addEventListener('click', () => {
            this.joinAsSpectator();
        });

        // Share match
        document.getElementById('shareMatchBtn')?.addEventListener('click', () => {
            this.shareMatch();
        });

        // QR Code
        document.getElementById('qrCodeBtn')?.addEventListener('click', () => {
            this.showQRCode();
        });

        // Stop streaming
        document.getElementById('stopStreamingBtn')?.addEventListener('click', () => {
            this.stopStreaming();
        });

        // Retry Firebase
        document.getElementById('retryFirebaseBtn')?.addEventListener('click', () => {
            this.initFirebase();
        });

        // Close QR modal
        document.getElementById('closeQrBtn')?.addEventListener('click', () => {
            document.getElementById('qr-modal').style.display = 'none';
        });
    }

    showStreamingControls() {
        document.getElementById('streaming-controls').style.display = 'block';
        document.getElementById('firebase-setup').style.display = 'none';
    }

    showFirebaseSetupInstructions() {
        if (!this.uiInitialized) {
            this.setupUI();
        }
        document.getElementById('firebase-setup').style.display = 'block';
    }

    showFirebaseError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'firebase-error';
        errorDiv.innerHTML = `
            <h3>❌ Error de Firebase</h3>
            <p>${message}</p>
            <p>Verifica tu configuración en <code>js/firebase-config.js</code></p>
        `;
        document.querySelector('.streaming-section').appendChild(errorDiv);
    }

    async startAsReferee() {
        if (!this.isFirebaseEnabled) return;
        
        // Admin authentication
        const adminPassword = prompt('🔐 Contraseña de Administrador:');
        if (!this.verifyAdminPassword(adminPassword)) {
            showNotification('❌ Contraseña incorrecta. Solo administradores pueden iniciar como árbitro.', 'error');
            return;
        }
        
        // Verify scoreboard is available
        if (!window.scoreboard || !window.scoreboard.gameState) {
            showNotification('Error: Marcador no inicializado. Espera un momento e intenta de nuevo.', 'error');
            return;
        }

        this.isReferee = true;
        this.matchId = this.generateMatchId();
        
        const { ref, set, onValue, onDisconnect, push } = this.firebaseFunctions;
        
        // Create match reference
        this.currentMatchRef = ref(`matches/${this.matchId}`);
        
        // Initialize match data
        const initialGameState = window.scoreboard.gameState;
        const streamingStartTime = Date.now();
        await set(this.currentMatchRef, {
            ...initialGameState,
            matchId: this.matchId,
            referee: true,
            createdAt: streamingStartTime,
            streamingStartTime: streamingStartTime,
            lastUpdate: Date.now()
        });

        // Track connected users
        const connectionsRef = ref(`matches/${this.matchId}/connections`);
        const userRef = push(connectionsRef, {
            role: 'referee',
            joinedAt: Date.now()
        });

        // Remove user on disconnect
        onDisconnect(userRef).remove();

        // Listen for connection changes
        onValue(connectionsRef, (snapshot) => {
            const connections = snapshot.val() || {};
            this.connectedUsers = Object.keys(connections).length;
            this.updateUI();
        });

        this.updateUI();
        this.startBroadcasting();
        this.startStreamingTimer();
        
        // Initial sync of timeout states
        this.syncTimeoutStates();
        this.broadcastGameState();
        
        showNotification('¡Streaming iniciado como Árbitro! 🔴', 'success');
    }

    async joinAsSpectator() {
        if (!this.isFirebaseEnabled) return;

        const matchId = prompt('Ingresa el ID del partido:');
        if (!matchId) return;

        this.isReferee = false;
        this.matchId = matchId;
        
        const { ref, onValue, push, onDisconnect } = this.firebaseFunctions;
        
        this.currentMatchRef = ref(`matches/${matchId}`);
        
        // Check if match exists
        this.currentMatchRef.once('value', (snapshot) => {
            const data = snapshot.val();
            if (!data) {
                showNotification('Partido no encontrado', 'error');
                return;
            }
            
            // Ensure complete game state structure
            const completeGameState = {
                ...window.scoreboard.gameState, // Keep existing structure
                ...data, // Override with Firebase data
                setHistory: data.setHistory || [], // Ensure setHistory is always an array
                gameHistory: data.gameHistory || [] // Ensure gameHistory is always an array
            };
            
            // Update local scoreboard with all components
            window.scoreboard.gameState = completeGameState;
            window.scoreboard.updateDisplay();
            
            // Update timeout checkboxes for spectators
            this.updateTimeoutCheckboxes(completeGameState);
            
            window.scoreboard.updateSetHistory();
            window.scoreboard.updateGameStatus();
            
            // Set streaming start time for spectators and start timer
            if (data.streamingStartTime) {
                this.streamingStartTime = data.streamingStartTime;
                this.startStreamingTimer();
            }
        });

        // Add user to connections
        const connectionsRef = ref(`matches/${matchId}/connections`);
        const userRef = push(connectionsRef, {
            role: 'spectator',
            joinedAt: Date.now()
        });

        onDisconnect(userRef).remove();

        // Listen for connection changes
        onValue(connectionsRef, (snapshot) => {
            const connections = snapshot.val() || {};
            this.connectedUsers = Object.keys(connections).length;
            this.updateUI();
        });

        this.startListening();
        this.updateUI();
        
        showNotification('¡Conectado como Espectador! 👁️', 'success');
    }

    startBroadcasting() {
        // Check if scoreboard is available
        if (!window.scoreboard) {
            console.error('Scoreboard not available for broadcasting');
            return;
        }

        // Override scoreboard methods to broadcast changes
        const originalAddPoint = window.scoreboard.addPoint ? window.scoreboard.addPoint.bind(window.scoreboard) : null;
        const originalRemovePoint = window.scoreboard.removePoint ? window.scoreboard.removePoint.bind(window.scoreboard) : null;
        const originalNewGame = window.scoreboard.newGame ? window.scoreboard.newGame.bind(window.scoreboard) : null;
        const originalResetSet = window.scoreboard.resetSet ? window.scoreboard.resetSet.bind(window.scoreboard) : null;

        if (originalAddPoint) {
            window.scoreboard.addPoint = (team) => {
                originalAddPoint(team);
                this.broadcastGameState();
            };
        }

        if (originalRemovePoint) {
            window.scoreboard.removePoint = (team) => {
                originalRemovePoint(team);
                this.broadcastGameState();
            };
        }

        if (originalNewGame) {
            window.scoreboard.newGame = () => {
                originalNewGame();
                this.broadcastGameState();
            };
        }

        if (originalResetSet) {
            window.scoreboard.resetSet = () => {
                originalResetSet();
                this.broadcastGameState();
            };
        }

        // Listen for timeout checkbox changes
        const timeoutCheckboxes = document.querySelectorAll('.timeout-indicator input[type="checkbox"]');
        timeoutCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.syncTimeoutStates();
                this.broadcastGameState();
            });
        });
    }

    startListening() {
        if (!this.currentMatchRef) return;
        
        this.currentMatchRef.on('value', (snapshot) => {
            const data = snapshot.val();
            if (!data) return;

            // Ensure complete game state structure
            const completeGameState = {
                ...window.scoreboard.gameState, // Keep existing structure
                ...data, // Override with Firebase data
                setHistory: data.setHistory || [], // Ensure setHistory is always an array
                gameHistory: data.gameHistory || [] // Ensure gameHistory is always an array
            };

            // Update local scoreboard without triggering broadcasts
            window.scoreboard.gameState = completeGameState;
            window.scoreboard.updateDisplay();
            
            // Update timeout checkboxes for spectators
            this.updateTimeoutCheckboxes(completeGameState);
            
            // Ensure all UI components are updated for spectators
            window.scoreboard.updateSetHistory();
            window.scoreboard.updateGameStatus();
            
            // Update streaming start time for spectators if not already set
            if (data.streamingStartTime && !this.streamingStartTime && !this.isReferee) {
                this.streamingStartTime = data.streamingStartTime;
                if (!this.streamingTimer) {
                    this.startStreamingTimer();
                }
            }
        });
    }

    syncTimeoutStates() {
        // Sync timeout checkbox states to game state
        const team1TimeoutCheckbox = document.getElementById('team1Timeout');
        const team2TimeoutCheckbox = document.getElementById('team2Timeout');
        
        if (team1TimeoutCheckbox && team2TimeoutCheckbox) {
            window.scoreboard.gameState.team1TimeoutActive = team1TimeoutCheckbox.checked;
            window.scoreboard.gameState.team2TimeoutActive = team2TimeoutCheckbox.checked;
        }
    }

    updateTimeoutCheckboxes(gameState) {
        // Update timeout checkboxes from game state (for spectators)
        const team1TimeoutCheckbox = document.getElementById('team1Timeout');
        const team2TimeoutCheckbox = document.getElementById('team2Timeout');
        
        if (team1TimeoutCheckbox && gameState.hasOwnProperty('team1TimeoutActive')) {
            team1TimeoutCheckbox.checked = gameState.team1TimeoutActive || false;
        }
        
        if (team2TimeoutCheckbox && gameState.hasOwnProperty('team2TimeoutActive')) {
            team2TimeoutCheckbox.checked = gameState.team2TimeoutActive || false;
        }
    }

    async broadcastGameState() {
        if (!this.isReferee || !this.currentMatchRef) return;
        
        // Ensure timeout states are synced before broadcasting
        this.syncTimeoutStates();
        
        const gameState = {
            ...window.scoreboard.gameState,
            matchId: this.matchId,
            streamingStartTime: this.streamingStartTime,
            lastUpdate: Date.now()
        };

        try {
            await this.currentMatchRef.set(gameState);
        } catch (error) {
            console.error('Error broadcasting game state:', error);
        }
    }

    generateMatchId() {
        return Math.random().toString(36).substr(2, 8).toUpperCase();
    }

    verifyAdminPassword(password) {
        // Default admin passwords - change these for production
        const adminPasswords = [
            'admin123',
            'referee2024',
            'voleibol'
        ];
        
        return adminPasswords.includes(password);
    }

    async verifyAdminPasswordPrompt() {
        return new Promise((resolve) => {
            const adminPassword = prompt('🔐 Contraseña de Administrador:');
            if (!adminPassword) {
                resolve(false);
                return;
            }
            
            if (this.verifyAdminPassword(adminPassword)) {
                resolve(true);
            } else {
                showNotification('❌ Contraseña incorrecta. Acceso denegado.', 'error');
                resolve(false);
            }
        });
    }

    updateUI() {
        document.getElementById('current-match-id').textContent = this.matchId || 'N/A';
        document.getElementById('connected-count').textContent = this.connectedUsers;
        document.getElementById('user-role').textContent = this.isReferee ? 'Árbitro 👨‍⚖️' : 'Espectador 👁️';
        
        // Only show match-info section if there's a match AND user is referee
        document.getElementById('match-info').style.display = (this.matchId && this.isReferee) ? 'block' : 'none';
        
        // Show spectator live indicator if user is spectator in an active match
        document.getElementById('spectator-live-indicator').style.display = (!this.isReferee && this.matchId) ? 'block' : 'none';
        
        // Hide/show controls based on role
        const controls = document.querySelectorAll('.game-controls .btn');
        const scoreButtons = document.querySelectorAll('.score-btn');
        const timeoutButtons = document.querySelectorAll('.timeout-btn');
        const timeoutCheckboxes = document.querySelectorAll('.timeout-indicator input[type="checkbox"]');
        
        if (!this.isReferee && this.matchId) {
            // In spectator mode, hide all administrative controls
            controls.forEach(btn => {
                const isExportButton = btn.id === 'exportBtn' || btn.id === 'exportHistoryBtn';
                const isGameControlButton = btn.id === 'newGameBtn' || btn.id === 'undoBtn';
                const isAdminButton = btn.textContent.includes('Nuevo Set') || 
                                    btn.textContent.includes('Reiniciar') || 
                                    btn.textContent.includes('Exportar') ||
                                    btn.textContent.includes('Nuevo Partido') ||
                                    btn.textContent.includes('Deshacer');
                btn.style.display = (isExportButton || isGameControlButton || isAdminButton) ? 'none' : 'inline-block';
            });
            
            // Hide score control buttons
            scoreButtons.forEach(btn => btn.style.display = 'none');
            
            // Hide timeout buttons
            timeoutButtons.forEach(btn => btn.style.display = 'none');
            
            // Disable timeout checkboxes
            timeoutCheckboxes.forEach(checkbox => {
                checkbox.disabled = true;
                checkbox.style.opacity = '0.5';
            });
            
            // Disable team name inputs
            const teamInputs = document.querySelectorAll('.team-input');
            teamInputs.forEach(input => {
                input.disabled = true;
                input.style.opacity = '0.7';
                input.style.backgroundColor = 'var(--border-color)';
            });
            
            // Disable match type selector
            const matchTypeSelect = document.querySelector('.match-type select');
            if (matchTypeSelect) {
                matchTypeSelect.disabled = true;
                matchTypeSelect.style.opacity = '0.7';
            }
            
            // Completely disable score sections for spectators
            const scoreSections = document.querySelectorAll('.team-section');
            scoreSections.forEach(section => {
                section.style.pointerEvents = 'none';
                section.style.opacity = '0.8';
                section.style.cursor = 'not-allowed';
            });
            
            // Disable all clickable score elements specifically
            const clickableElements = document.querySelectorAll('.team-clickable, .score-display, .current-score, .sets-won');
            clickableElements.forEach(element => {
                element.style.pointerEvents = 'none';
                element.style.cursor = 'not-allowed';
                // Remove onclick handlers
                element.onclick = null;
                element.removeAttribute('onclick');
            });
            
            // Add overlay to prevent any interaction
            const scoreboardOverlay = document.createElement('div');
            scoreboardOverlay.id = 'spectator-overlay';
            scoreboardOverlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: transparent;
                z-index: 1000;
                pointer-events: auto;
                cursor: not-allowed;
            `;
            
            const scoreboard = document.querySelector('.scoreboard');
            if (scoreboard && !document.getElementById('spectator-overlay')) {
                scoreboard.style.position = 'relative';
                scoreboard.appendChild(scoreboardOverlay);
            }
            
            // Hide streaming control buttons in spectator mode
            const streamingButtons = document.querySelectorAll('.streaming-options .btn');
            streamingButtons.forEach(btn => btn.style.display = 'none');
            
            // Hide the entire streaming options section
            const streamingOptions = document.querySelector('.streaming-options');
            if (streamingOptions) {
                streamingOptions.style.display = 'none';
            }
            
            // Note: match-info div is already hidden by the condition above
        } else {
            // Show all controls for referees or when not in a match
            controls.forEach(btn => btn.style.display = 'inline-block');
            scoreButtons.forEach(btn => btn.style.display = 'inline-block');
            timeoutButtons.forEach(btn => btn.style.display = 'inline-block');
            timeoutCheckboxes.forEach(checkbox => {
                checkbox.disabled = false;
                checkbox.style.opacity = '1';
            });
            
            // Enable team name inputs
            const teamInputs = document.querySelectorAll('.team-input');
            teamInputs.forEach(input => {
                input.disabled = false;
                input.style.opacity = '1';
                input.style.backgroundColor = '';
            });
            
            // Enable match type selector
            const matchTypeSelect = document.querySelector('.match-type select');
            if (matchTypeSelect) {
                matchTypeSelect.disabled = false;
                matchTypeSelect.style.opacity = '1';
            }
            
            // Re-enable score sections
            const scoreSections = document.querySelectorAll('.team-section');
            scoreSections.forEach(section => {
                section.style.pointerEvents = 'auto';
                section.style.opacity = '1';
                section.style.cursor = 'pointer';
            });
            
            // Re-enable clickable elements
            const clickableElements = document.querySelectorAll('.team-clickable, .score-display, .current-score, .sets-won');
            clickableElements.forEach(element => {
                element.style.pointerEvents = 'auto';
                element.style.cursor = 'pointer';
            });
            
            // Remove spectator overlay
            const spectatorOverlay = document.getElementById('spectator-overlay');
            if (spectatorOverlay) {
                spectatorOverlay.remove();
            }
            
            // Show streaming control buttons for referees or when not in a match
            const streamingButtons = document.querySelectorAll('.streaming-options .btn');
            streamingButtons.forEach(btn => btn.style.display = 'inline-block');
            
            // Show the streaming options section
            const streamingOptions = document.querySelector('.streaming-options');
            if (streamingOptions) {
                streamingOptions.style.display = 'flex';
            }
        }
    }

    async shareMatchWithAuth() {
        if (!await this.verifyAdminPasswordPrompt()) {
            showNotification('Acceso denegado. Solo administradores pueden compartir el partido.', 'error');
            return;
        }
        this.shareMatch();
    }

    shareMatch() {
        if (!this.matchId) return;

        const shareUrl = `${window.location.origin}${window.location.pathname}?match=${this.matchId}&mode=spectator`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Partido de Voleibol en Vivo',
                text: `¡Únete para ver el partido en tiempo real! ID: ${this.matchId}`,
                url: shareUrl
            });
        } else {
            navigator.clipboard.writeText(shareUrl).then(() => {
                showNotification('¡Enlace copiado al portapapeles!', 'success');
            });
        }
    }

    async showQRCodeWithAuth() {
        if (!await this.verifyAdminPasswordPrompt()) {
            showNotification('Acceso denegado. Solo administradores pueden mostrar el código QR.', 'error');
            return;
        }
        this.showQRCode();
    }

    showQRCode() {
        const shareUrl = `${window.location.origin}${window.location.pathname}?match=${this.matchId}&mode=spectator`;
        
        // Generate QR code using QR Server API
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;
        
        document.getElementById('qr-code').innerHTML = `<img src="${qrCodeUrl}" alt="QR Code">`;
        document.getElementById('share-url').value = shareUrl;
        document.getElementById('qr-modal').style.display = 'flex';
    }

    async stopStreamingWithAuth() {
        if (!await this.verifyAdminPasswordPrompt()) {
            showNotification('Acceso denegado. Solo administradores pueden detener el streaming.', 'error');
            return;
        }
        this.stopStreaming();
    }

    stopStreaming() {
        if (this.currentMatchRef && this.isReferee) {
            this.currentMatchRef.remove(); // Remove match data
        }
        
        this.stopStreamingTimer();
        this.matchId = null;
        this.isReferee = false;
        this.connectedUsers = 0;
        this.updateUI();
        
        showNotification('Streaming detenido', 'info');
    }

    startStreamingTimer() {
        // Stop any existing timer to avoid duplicates
        this.stopStreamingTimer();
        
        // For referees, set the start time to now
        // For spectators, the start time should already be set from Firebase data
        if (this.isReferee) {
            this.streamingStartTime = Date.now();
        }
        
        this.streamingTimer = setInterval(() => {
            this.updateStreamingTime();
        }, 1000);
        
        // Immediately update the time
        this.updateStreamingTime();
    }

    stopStreamingTimer() {
        if (this.streamingTimer) {
            clearInterval(this.streamingTimer);
            this.streamingTimer = null;
        }
        this.streamingStartTime = null;
    }

    updateStreamingTime() {
        if (!this.streamingStartTime) {
            return;
        }
        
        const now = Date.now();
        const elapsed = now - this.streamingStartTime;
        const hours = Math.floor(elapsed / (1000 * 60 * 60));
        const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
        
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Update timer for referee
        const timerElement = document.getElementById('streaming-timer');
        if (timerElement) {
            timerElement.textContent = timeString;
        }
        
        // Update timer for spectators
        const spectatorTimerElement = document.getElementById('spectator-timer');
        if (spectatorTimerElement) {
            spectatorTimerElement.textContent = timeString;
        }
    }

    // Check URL parameters for auto-join
    checkURLParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const matchId = urlParams.get('match');
        const mode = urlParams.get('mode');
        
        if (matchId && mode === 'spectator') {
            // Auto-join as spectator with provided match ID
            setTimeout(() => {
                this.joinAsSpectatorWithId(matchId);
            }, 2000); // Wait for Firebase to initialize
        }
    }

    async joinAsSpectatorWithId(matchId) {
        if (!this.isFirebaseEnabled) return;

        this.isReferee = false;
        this.matchId = matchId;
        
        const { ref, onValue, push, onDisconnect } = this.firebaseFunctions;
        
        this.currentMatchRef = ref(`matches/${matchId}`);
        
        // Check if match exists
        this.currentMatchRef.once('value', (snapshot) => {
            const data = snapshot.val();
            if (!data) {
                showNotification('Partido no encontrado', 'error');
                return;
            }
            
            // Ensure complete game state structure
            const completeGameState = {
                ...window.scoreboard.gameState, // Keep existing structure
                ...data, // Override with Firebase data
                setHistory: data.setHistory || [], // Ensure setHistory is always an array
                gameHistory: data.gameHistory || [] // Ensure gameHistory is always an array
            };
            
            // Update local scoreboard with all components
            window.scoreboard.gameState = completeGameState;
            window.scoreboard.updateDisplay();
            
            // Update timeout checkboxes for spectators
            this.updateTimeoutCheckboxes(completeGameState);
            
            window.scoreboard.updateSetHistory();
            window.scoreboard.updateGameStatus();
            
            // Set streaming start time for spectators and start timer
            if (data.streamingStartTime) {
                this.streamingStartTime = data.streamingStartTime;
                this.startStreamingTimer();
            }
        });

        // Add user to connections
        const connectionsRef = ref(`matches/${matchId}/connections`);
        const userRef = push(connectionsRef, {
            role: 'spectator',
            joinedAt: Date.now()
        });

        onDisconnect(userRef).remove();

        // Listen for connection changes
        onValue(connectionsRef, (snapshot) => {
            const connections = snapshot.val() || {};
            this.connectedUsers = Object.keys(connections).length;
            this.updateUI();
        });

        this.startListening();
        this.updateUI();
        
        showNotification('¡Conectado como Espectador! 👁️', 'success');
    }
}

// Export for use in main script
window.RealtimeScoreboard = RealtimeScoreboard;

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for the main script to initialize the scoreboard
    const initializeStreaming = () => {
        if (window.scoreboard && window.scoreboard.gameState && !window.realtimeScoreboard) {
            window.realtimeScoreboard = new RealtimeScoreboard();
            window.realtimeScoreboard.checkURLParameters();
        } else if (!window.scoreboard || !window.scoreboard.gameState) {
            // Retry after a short delay
            setTimeout(initializeStreaming, 500);
        }
    };
    
    setTimeout(initializeStreaming, 1000);
});