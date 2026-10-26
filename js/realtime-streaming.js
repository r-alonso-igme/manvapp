// Firebase Realtime Streaming Module
import firebaseConfig from './firebase-config.js';

class RealtimeScoreboard {
    constructor() {
        this.isFirebaseEnabled = false;
        this.database = null;
        this.currentMatchRef = null;
        this.ownConnectionRef = null;
        this.listenerRefs = [];
        this.isReferee = false;
        this.matchId = null;
        this.connectedUsers = 0;
        this.uiInitialized = false;
        this.streamingStartTime = null;
        this.streamingTimer = null;
        this.lastSeenNotificationId = null;

        // Resolves once Firebase has finished initializing (successfully or not)
        this.ready = this.initFirebase();
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

            // Initialize Firebase using global variables (reuse the app on retry)
            const app = firebase.apps.length ? firebase.app() : firebase.initializeApp(firebaseConfig);
            this.database = firebase.database(app);
            this.isFirebaseEnabled = true;

            // Store Firebase functions for later use - using global firebase object
            this.firebaseFunctions = {
                ref: (path) => firebase.database().ref(path),
                set: (ref, value) => ref.set(value),
                update: (ref, value) => ref.update(value),
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
            <details id="streaming-controls" class="streaming-section online-panel">
                <summary>Marcador en tiempo real</summary>
                <div class="streaming-options">
                    <button id="startRefereeBtn" class="btn btn-primary" title="Solo administradores">
                        📡 Iniciar marcador Online
                    </button>
                    <button id="joinSpectatorBtn" class="btn btn-secondary">
                        👁️ Unirse como Espectador
                    </button>
                </div>
                <div class="admin-info">
                    <p style="font-size: 0.9rem; color: var(--text-light); margin-top: 0.5rem;">
                        <strong>Nota:</strong> Se requiere contraseña de administrador para iniciar el marcador online
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
            </details>

            <!-- Indicador EN VIVO para espectadores -->
            <div id="spectator-live-indicator" class="live-indicator" style="display: none;">
                <div class="live-animation">🔴 MARCADOR EN VIVO</div>
                <div class="streaming-time">
                    <strong>⏱️ Tiempo de Retransmisión:</strong> <span id="spectator-timer">00:00:00</span>
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
            this.ready = this.initFirebase();
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
            <p class="firebase-error-message"></p>
            <p>Verifica tu configuración en <code>js/firebase-config.js</code></p>
        `;
        errorDiv.querySelector('.firebase-error-message').textContent = message;

        const container = document.querySelector('.streaming-section') || document.querySelector('.game-controls');
        container?.appendChild(errorDiv);
    }

    // Subscribe to a ref and remember it so it can be detached when leaving the match
    listen(ref, callback) {
        ref.on('value', callback);
        this.listenerRefs.push(ref);
    }

    detachListeners() {
        this.listenerRefs.forEach(ref => ref.off('value'));
        this.listenerRefs = [];
    }

    async startAsReferee() {
        if (!this.isFirebaseEnabled) return;

        // Admin authentication
        const adminPassword = prompt('🔐 Contraseña de Administrador:');
        if (!this.verifyAdminPassword(adminPassword)) {
            showNotification('❌ Contraseña incorrecta. Solo administradores pueden iniciar como Organizador.', 'error');
            return;
        }

        // Verify scoreboard is available
        if (!window.scoreboard || !window.scoreboard.gameState) {
            showNotification('Error: Marcador no inicializado. Espera un momento e intenta de nuevo.', 'error');
            return;
        }

        this.isReferee = true;
        this.matchId = this.generateMatchId();

        const { ref, set, onDisconnect, push } = this.firebaseFunctions;

        // Create match reference
        this.currentMatchRef = ref(`matches/${this.matchId}`);

        // Initialize match data
        const streamingStartTime = Date.now();
        await set(this.currentMatchRef, {
            ...window.scoreboard.gameState,
            matchId: this.matchId,
            referee: true,
            createdAt: streamingStartTime,
            streamingStartTime: streamingStartTime,
            lastUpdate: Date.now()
        });

        // Track connected users
        const connectionsRef = ref(`matches/${this.matchId}/connections`);
        this.ownConnectionRef = push(connectionsRef, {
            role: 'referee',
            joinedAt: Date.now()
        });

        // Remove user on disconnect
        onDisconnect(this.ownConnectionRef).remove();

        // Listen for connection changes
        this.listen(connectionsRef, (snapshot) => {
            const connections = snapshot.val() || {};
            this.connectedUsers = Object.keys(connections).length;
            this.updateUI();
        });

        // Listen for notifications (referee also receives them for consistency)
        this.setupNotificationListener();

        this.updateUI();
        this.startBroadcasting();
        this.startStreamingTimer(streamingStartTime);

        showNotification('¡Streaming iniciado como Árbitro! 🔴', 'success');
    }

    joinAsSpectator() {
        if (!this.isFirebaseEnabled) return;

        const matchId = prompt('Ingresa el ID del partido:');
        if (!matchId || !matchId.trim()) return;

        this.joinAsSpectatorWithId(matchId.trim().toUpperCase());
    }

    async joinAsSpectatorWithId(matchId) {
        if (!this.isFirebaseEnabled) return;

        const { ref, push, onDisconnect } = this.firebaseFunctions;
        const matchRef = ref(`matches/${matchId}`);

        // Check the match exists before registering a connection under it
        let snapshot;
        try {
            snapshot = await matchRef.once('value');
        } catch (error) {
            console.error('Error joining as spectator:', error);
            showNotification('❌ Error al conectar con el partido. Inténtalo de nuevo.', 'error');
            return;
        }

        if (!snapshot.exists()) {
            showNotification('Partido no encontrado', 'error');
            return;
        }

        this.isReferee = false;
        this.matchId = matchId;
        this.currentMatchRef = matchRef;

        const data = snapshot.val();
        this.syncMatchFromFirebase(data);

        if (data.streamingStartTime) {
            this.startStreamingTimer(data.streamingStartTime);
        }

        // Add user to connections
        const connectionsRef = ref(`matches/${matchId}/connections`);
        this.ownConnectionRef = push(connectionsRef, {
            role: 'spectator',
            joinedAt: Date.now()
        });

        onDisconnect(this.ownConnectionRef).remove();

        // Listen for connection changes
        this.listen(connectionsRef, (snapshot) => {
            const connections = snapshot.val() || {};
            this.connectedUsers = Object.keys(connections).length;
            this.updateUI();
        });

        this.setupNotificationListener();
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

        // Every state change in the scoreboard (points, timeouts, undo, names...) is sent to Firebase
        window.scoreboard.onStateChange = () => this.broadcastGameState();
        this.broadcastGameState();
    }

    startListening() {
        if (!this.currentMatchRef) return;

        this.listen(this.currentMatchRef, (snapshot) => {
            const data = snapshot.val();

            // The referee stopped streaming and the match was removed
            if (!data) {
                showNotification('La retransmisión del partido ha finalizado', 'info');
                this.leaveMatch();
                return;
            }

            this.syncMatchFromFirebase(data);
        });
    }

    syncMatchFromFirebase(data) {
        if (!window.scoreboard || !data) return;

        // Ensure complete game state structure
        const completeGameState = {
            teamA: {
                name: data.teamA?.name || 'Manzanares Voley',
                score: data.teamA?.score || 0,
                sets: data.teamA?.sets || 0,
                timeouts: data.teamA?.timeouts || 0
            },
            teamB: {
                name: data.teamB?.name || 'Equipo contrario',
                score: data.teamB?.score || 0,
                sets: data.teamB?.sets || 0,
                timeouts: data.teamB?.timeouts || 0
            },
            currentSet: data.currentSet || 1,
            matchType: data.matchType || 5,
            setHistory: data.setHistory || [],
            gameEnded: data.gameEnded || false,
            timeoutActive: data.timeoutActive || false,
            lastAction: data.lastAction || null
        };

        // Update local scoreboard with synchronized data
        window.scoreboard.gameState = completeGameState;

        // Update all UI components (names, scores, sets, timeouts, history and status)
        window.scoreboard.updateDisplay();

        // Update match type selector
        document.getElementById('matchType').value = completeGameState.matchType.toString();

        // Sync visual highlights
        document.getElementById('teamA').classList.remove('winner', 'serving');
        document.getElementById('teamB').classList.remove('winner', 'serving');

        if (completeGameState.gameEnded) {
            const winner = completeGameState.teamA.sets > completeGameState.teamB.sets ? 'teamA' : 'teamB';
            document.getElementById(winner).classList.add('winner');
        }
    }

    async broadcastGameState() {
        if (!this.isReferee || !this.currentMatchRef) return;

        const gameState = {
            ...window.scoreboard.gameState,
            matchId: this.matchId,
            streamingStartTime: this.streamingStartTime,
            lastUpdate: Date.now()
        };

        try {
            // update() instead of set() so the connections and notifications children are kept
            await this.firebaseFunctions.update(this.currentMatchRef, gameState);
        } catch (error) {
            console.error('Error broadcasting game state:', error);
        }
    }

    async broadcastNotification(message, type = 'info', duration = 5000) {
        if (!this.isReferee || !this.currentMatchRef) return;

        const notificationData = {
            message: message,
            type: type,
            duration: duration,
            timestamp: Date.now(),
            id: Math.random().toString(36).slice(2, 11)
        };

        try {
            // Send notification to Firebase
            const notificationRef = this.firebaseFunctions.ref(`matches/${this.matchId}/notifications/${notificationData.id}`);
            await this.firebaseFunctions.set(notificationRef, notificationData);

            // Auto-remove notification after a short delay to keep Firebase clean
            setTimeout(async () => {
                try {
                    await notificationRef.remove();
                } catch (error) {
                    console.error('Error removing notification:', error);
                }
            }, duration + 1000);
        } catch (error) {
            console.error('Error broadcasting notification:', error);
        }
    }

    setupNotificationListener() {
        if (!this.matchId) return;

        const notificationsRef = this.firebaseFunctions.ref(`matches/${this.matchId}/notifications`);

        this.listen(notificationsRef, (snapshot) => {
            const notifications = snapshot.val();
            if (notifications) {
                // Get the latest notification
                const notificationKeys = Object.keys(notifications);
                const latestKey = notificationKeys[notificationKeys.length - 1];
                const latestNotification = notifications[latestKey];

                // Only show if this notification is newer than our last seen
                if (!this.lastSeenNotificationId || latestNotification.id !== this.lastSeenNotificationId) {
                    showNotification(latestNotification.message, latestNotification.type, latestNotification.duration);
                    this.lastSeenNotificationId = latestNotification.id;
                }
            }
        });
    }

    generateMatchId() {
        return Math.random().toString(36).slice(2, 10).toUpperCase();
    }

    verifyAdminPassword(password) {
        // NOTE: this only hides the UI. The passwords are visible in the published JS and
        // Firebase rules allow anyone to write, so this is not real access control.
        const adminPasswords = [
            'admin123',
            'referee2024',
            'voleibol'
        ];

        return adminPasswords.includes(password);
    }

    updateUI() {
        document.getElementById('current-match-id').textContent = this.matchId || 'N/A';
        document.getElementById('connected-count').textContent = this.connectedUsers;
        document.getElementById('user-role').textContent = this.isReferee ? 'Árbitro 📡' : 'Espectador 👁️';

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

    shareMatch() {
        if (!this.matchId) return;

        const shareUrl = `${window.location.origin}${window.location.pathname}?match=${this.matchId}&mode=spectator`;

        if (navigator.share) {
            navigator.share({
                title: 'Partido de Voleibol en Vivo',
                text: `¡Únete para ver el partido en tiempo real! ID: ${this.matchId}`,
                url: shareUrl
            }).catch(() => {
                // User cancelled the share sheet
            });
        } else {
            navigator.clipboard.writeText(shareUrl).then(() => {
                showNotification('¡Enlace copiado al portapapeles!', 'success');
            });
        }
    }

    showQRCode() {
        const shareUrl = `${window.location.origin}${window.location.pathname}?match=${this.matchId}&mode=spectator`;

        // Generate QR code using QR Server API
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;

        document.getElementById('qr-code').innerHTML = `<img src="${qrCodeUrl}" alt="QR Code">`;
        document.getElementById('share-url').value = shareUrl;
        document.getElementById('qr-modal').style.display = 'flex';
    }

    stopStreaming() {
        if (window.scoreboard) {
            window.scoreboard.onStateChange = null;
        }
        this.detachListeners();

        if (this.currentMatchRef && this.isReferee) {
            this.currentMatchRef.remove(); // Remove match data
        }

        this.resetMatchState();
        showNotification('Streaming detenido', 'info');
    }

    // Spectator leaves the match (e.g. the referee stopped streaming)
    leaveMatch() {
        this.detachListeners();

        if (this.ownConnectionRef) {
            this.ownConnectionRef.remove().catch(() => {
                // The match may already have been removed
            });
        }

        this.resetMatchState();
    }

    resetMatchState() {
        this.stopStreamingTimer();
        this.currentMatchRef = null;
        this.ownConnectionRef = null;
        this.matchId = null;
        this.isReferee = false;
        this.connectedUsers = 0;
        this.lastSeenNotificationId = null;
        this.updateUI();
    }

    startStreamingTimer(startTime = Date.now()) {
        // Stop any existing timer to avoid duplicates
        this.stopStreamingTimer();

        // Referees pass their own start time; spectators pass the one stored in Firebase
        this.streamingStartTime = startTime;

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
        const elapsed = Math.max(0, now - this.streamingStartTime);
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
    async checkURLParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const matchId = urlParams.get('match');
        const mode = urlParams.get('mode');

        if (matchId && mode === 'spectator') {
            // Wait for Firebase to finish initializing instead of a fixed delay
            await this.ready;
            this.joinAsSpectatorWithId(matchId);
        }
    }
}

// Export for use in main script (script.js creates the instance on DOMContentLoaded)
window.RealtimeScoreboard = RealtimeScoreboard;
