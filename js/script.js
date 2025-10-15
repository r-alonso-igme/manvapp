// Modern JavaScript for ManvApp

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
            });
        });
    }

    // Smooth scrolling for navigation links
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Contact Form Handling
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const name = formData.get('name');
            const email = formData.get('email');
            const message = formData.get('message');
            
            // Basic validation
            if (!name || !email || !message) {
                showNotification('Por favor completa todos los campos.', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showNotification('Por favor ingresa una dirección de email válida.', 'error');
                return;
            }
            
            // Simulate form submission
            showNotification('¡Gracias por tu mensaje! Te responderemos pronto.', 'success');
            this.reset();
        });
    }

    // Get Started Button
    const getStartedBtn = document.querySelector('.btn-primary');
    if (getStartedBtn && getStartedBtn.textContent === 'Get Started') {
        getStartedBtn.addEventListener('click', function() {
            const aboutSection = document.querySelector('#about');
            if (aboutSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = aboutSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    }

    // Initialize animations
    initScrollAnimations();
});

// Email validation function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '100px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '0.5rem',
        color: 'white',
        fontWeight: '600',
        zIndex: '9999',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease',
        backgroundColor: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'
    });

    // Add to DOM
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 5000);
}

// Scroll animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe service cards
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

// Utility functions
const utils = {
    // Debounce function for performance
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Get element position
    getElementPosition: function(element) {
        const rect = element.getBoundingClientRect();
        return {
            top: rect.top + window.pageYOffset,
            left: rect.left + window.pageXOffset
        };
    },

    // Check if element is in viewport
    isInViewport: function(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
};

// Volleyball Scoreboard Functionality
class VolleyballScoreboard {
    constructor() {
        this.gameState = {
            teamA: {
                name: 'Equipo A',
                score: 0,
                sets: 0,
                timeouts: 0
            },
            teamB: {
                name: 'Equipo B',
                score: 0,
                sets: 0,
                timeouts: 0
            },
            currentSet: 1,
            matchType: 5, // Best of 3 or 5
            setHistory: [],
            gameEnded: false,
            timeoutActive: false,
            lastAction: null // For undo functionality
        };
        
        this.initializeScoreboard();
        this.bindEvents();
    }

    initializeScoreboard() {
        // Read match type from HTML (in case it was set there)
        const htmlMatchType = document.getElementById('matchType').value;
        if (htmlMatchType) {
            this.gameState.matchType = parseInt(htmlMatchType);
        }
        
        // Update display
        this.updateDisplay();
        
        // Set initial match type in HTML
        document.getElementById('matchType').value = this.gameState.matchType.toString();
        
        // Update status
        this.updateGameStatus();
    }

    bindEvents() {
        // Control buttons
        document.getElementById('newGameBtn').addEventListener('click', () => this.newMatch());
        document.getElementById('resetSetBtn').addEventListener('click', () => this.resetSet());
        document.getElementById('undoBtn').addEventListener('click', () => this.undoLastAction());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportResult());
        document.getElementById('exportHistoryBtn').addEventListener('click', () => this.exportSetHistory());
        
        // Timeout controls
        document.getElementById('timeoutActive').addEventListener('change', (e) => {
            this.gameState.timeoutActive = e.target.checked;
        });
        
        // Match type change
        document.getElementById('matchType').addEventListener('change', (e) => {
            this.gameState.matchType = parseInt(e.target.value);
            this.checkMatchEnd();
        });
        
        // Team name changes
        document.getElementById('teamAName').addEventListener('input', (e) => {
            this.gameState.teamA.name = e.target.value || 'Equipo A';
        });
        
        document.getElementById('teamBName').addEventListener('input', (e) => {
            this.gameState.teamB.name = e.target.value || 'Equipo B';
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    addPoint(team) {
        if (this.gameState.gameEnded) return;

        // Save state for undo
        this.saveStateForUndo();

        if (team === 'A') {
            this.gameState.teamA.score++;
        } else {
            this.gameState.teamB.score++;
        }

        this.updateDisplay();
        this.checkSetEnd();
    }

    removePoint(team) {
        if (this.gameState.gameEnded) return;

        // Save state for undo
        this.saveStateForUndo();

        if (team === 'A' && this.gameState.teamA.score > 0) {
            this.gameState.teamA.score--;
        } else if (team === 'B' && this.gameState.teamB.score > 0) {
            this.gameState.teamB.score--;
        }

        this.updateDisplay();
    }

    checkSetEnd() {
        const { teamA, teamB } = this.gameState;
        const scoreA = teamA.score;
        const scoreB = teamB.score;

        // Volleyball rules: Win by 2, minimum 25 points (or 15 for deciding set)
        const isDecidingSet = this.isDecidingSet();
        const minPoints = isDecidingSet ? 15 : 25;
        
        let setWinner = null;

        if (scoreA >= minPoints && scoreA - scoreB >= 2) {
            setWinner = 'A';
        } else if (scoreB >= minPoints && scoreB - scoreA >= 2) {
            setWinner = 'B';
        }

        if (setWinner) {
            this.endSet(setWinner);
        }
    }

    isDecidingSet() {
        const maxSets = Math.ceil(this.gameState.matchType / 2);
        return this.gameState.currentSet === this.gameState.matchType;
    }

    endSet(winner) {
        // Record set result
        const setResult = {
            setNumber: this.gameState.currentSet,
            teamAScore: this.gameState.teamA.score,
            teamBScore: this.gameState.teamB.score,
            winner: winner
        };
        
        this.gameState.setHistory.push(setResult);

        // Update sets won
        if (winner === 'A') {
            this.gameState.teamA.sets++;
        } else {
            this.gameState.teamB.sets++;
        }

        // Show set completion notification
        const winnerName = winner === 'A' ? this.gameState.teamA.name : this.gameState.teamB.name;
        showNotification(`¡${winnerName} gana el Set ${this.gameState.currentSet}!`, 'success');

        // Check if match is over
        if (this.checkMatchEnd()) {
            return;
        }

        // Start next set
        this.gameState.currentSet++;
        this.gameState.teamA.score = 0;
        this.gameState.teamB.score = 0;
        this.gameState.teamA.timeouts = 0; // Reset timeouts for new set
        this.gameState.teamB.timeouts = 0;
        this.gameState.timeoutActive = false;

        this.updateDisplay();
        this.updateSetHistory();
        this.updateGameStatus();
    }

    checkMatchEnd() {
        const setsNeeded = Math.ceil(this.gameState.matchType / 2);
        
        if (this.gameState.teamA.sets >= setsNeeded) {
            this.endMatch('A');
            return true;
        } else if (this.gameState.teamB.sets >= setsNeeded) {
            this.endMatch('B');
            return true;
        }
        
        return false;
    }

    endMatch(winner) {
        this.gameState.gameEnded = true;
        const winnerName = winner === 'A' ? this.gameState.teamA.name : this.gameState.teamB.name;
        
        // Highlight winner
        if (winner === 'A') {
            document.getElementById('teamA').classList.add('winner');
        } else {
            document.getElementById('teamB').classList.add('winner');
        }

        showNotification(`🏆 ¡${winnerName} gana el partido!`, 'success');
        this.updateSetHistory(); // Update set history to show the final set
        this.updateGameStatus();
    }

    newMatch() {
        // Reset all game state
        this.gameState = {
            teamA: {
                name: document.getElementById('teamAName').value || 'Equipo A',
                score: 0,
                sets: 0,
                timeouts: 0
            },
            teamB: {
                name: document.getElementById('teamBName').value || 'Equipo B',
                score: 0,
                sets: 0,
                timeouts: 0
            },
            currentSet: 1,
            matchType: parseInt(document.getElementById('matchType').value),
            setHistory: [],
            gameEnded: false,
            timeoutActive: false,
            lastAction: null
        };

        // Clear visual highlights
        document.getElementById('teamA').classList.remove('winner', 'serving');
        document.getElementById('teamB').classList.remove('winner', 'serving');

        this.updateDisplay();
        this.updateSetHistory();
        this.updateGameStatus();
        
        showNotification('¡Nuevo partido iniciado!', 'info');
    }

    resetSet() {
        if (this.gameState.gameEnded) return;

        this.saveStateForUndo();
        
        this.gameState.teamA.score = 0;
        this.gameState.teamB.score = 0;
        
        this.updateDisplay();
        showNotification('¡Set reiniciado!', 'info');
    }

    saveStateForUndo() {
        this.gameState.lastAction = {
            teamA: { ...this.gameState.teamA },
            teamB: { ...this.gameState.teamB },
            currentSet: this.gameState.currentSet,
            setHistory: [...this.gameState.setHistory],
            gameEnded: this.gameState.gameEnded,
            timeoutActive: this.gameState.timeoutActive
        };
    }

    undoLastAction() {
        if (!this.gameState.lastAction) {
            showNotification('¡No hay nada que deshacer!', 'error');
            return;
        }

        // Clear visual highlights
        document.getElementById('teamA').classList.remove('winner', 'serving');
        document.getElementById('teamB').classList.remove('winner', 'serving');

        // Restore previous state
        this.gameState.teamA = { ...this.gameState.lastAction.teamA };
        this.gameState.teamB = { ...this.gameState.lastAction.teamB };
        this.gameState.currentSet = this.gameState.lastAction.currentSet;
        this.gameState.setHistory = [...this.gameState.lastAction.setHistory];
        this.gameState.gameEnded = this.gameState.lastAction.gameEnded;
        this.gameState.timeoutActive = this.gameState.lastAction.timeoutActive;

        this.updateDisplay();
        this.updateSetHistory();
        this.updateGameStatus();
        
        showNotification('¡Última acción deshecha!', 'info');
        this.gameState.lastAction = null;
    }

    updateDisplay() {
        // Update scores
        document.getElementById('teamAScore').textContent = this.gameState.teamA.score;
        document.getElementById('teamBScore').textContent = this.gameState.teamB.score;
        
        // Update sets
        document.getElementById('teamASets').textContent = this.gameState.teamA.sets;
        document.getElementById('teamBSets').textContent = this.gameState.teamB.sets;
        
        // Update current set
        document.getElementById('currentSet').textContent = this.gameState.currentSet;
        
        // Update team names in inputs
        document.getElementById('teamAName').value = this.gameState.teamA.name;
        document.getElementById('teamBName').value = this.gameState.teamB.name;
        
        // Update timeout counts
        document.getElementById('teamATimeouts').textContent = this.gameState.teamA.timeouts;
        document.getElementById('teamBTimeouts').textContent = this.gameState.teamB.timeouts;
        
        // Update timeout active status
        document.getElementById('timeoutActive').checked = this.gameState.timeoutActive;
    }

    updateSetHistory() {
        const historyContainer = document.getElementById('setHistory');
        historyContainer.innerHTML = '';

        if (this.gameState.setHistory.length === 0) {
            historyContainer.innerHTML = '<p style="text-align: center; color: #64748b;">No sets completed yet</p>';
            return;
        }

        this.gameState.setHistory.forEach(set => {
            const setDiv = document.createElement('div');
            setDiv.className = `set-result winner-${set.winner.toLowerCase()}`;
            setDiv.innerHTML = `
                <div class="set-number">Set ${set.setNumber}</div>
                <div class="scores">${set.teamAScore} - ${set.teamBScore}</div>
            `;
            historyContainer.appendChild(setDiv);
        });
    }

    updateGameStatus() {
        const statusElement = document.getElementById('gameStatus');
        const statusText = statusElement.querySelector('.status-text');
        
        if (this.gameState.gameEnded) {
            const winner = this.gameState.teamA.sets > this.gameState.teamB.sets ? 
                          this.gameState.teamA.name : this.gameState.teamB.name;
            statusText.textContent = `🏆 ${winner} wins the match!`;
            statusText.className = 'status-text match-won';
        } else {
            statusText.textContent = `Partido en Progreso - Set ${this.gameState.currentSet}`;
            statusText.className = 'status-text in-progress';
        }
    }

    handleKeyPress(e) {
        // Prevent if user is typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

        switch(e.key.toLowerCase()) {
            case 'a':
                e.preventDefault();
                this.addPoint('A');
                break;
            case 's':
                e.preventDefault();
                this.removePoint('A');
                break;
            case 'l':
                e.preventDefault();
                this.addPoint('B');
                break;
            case 'k':
                e.preventDefault();
                this.removePoint('B');
                break;
            case 'n':
                e.preventDefault();
                this.newMatch();
                break;
            case 'u':
                e.preventDefault();
                this.undoLastAction();
                break;
            case 'r':
                e.preventDefault();
                this.resetSet();
                break;
        }
    }

    addTimeout(team) {
        // Save state for undo
        this.saveStateForUndo();

        const maxTimeouts = 2; // Standard volleyball allows 2 timeouts per set per team
        
        if (team === 'A' && this.gameState.teamA.timeouts < maxTimeouts) {
            this.gameState.teamA.timeouts++;
        } else if (team === 'B' && this.gameState.teamB.timeouts < maxTimeouts) {
            this.gameState.teamB.timeouts++;
        } else {
            showNotification(`¡Máximo ${maxTimeouts} tiempos por set alcanzado!`, 'error');
            return;
        }

        this.updateDisplay();
        
        const teamName = team === 'A' ? this.gameState.teamA.name : this.gameState.teamB.name;
        showNotification(`Tiempo solicitado por ${teamName}`, 'info');
    }

    removeTimeout(team) {
        // Save state for undo
        this.saveStateForUndo();

        if (team === 'A' && this.gameState.teamA.timeouts > 0) {
            this.gameState.teamA.timeouts--;
        } else if (team === 'B' && this.gameState.teamB.timeouts > 0) {
            this.gameState.teamB.timeouts--;
        }

        this.updateDisplay();
    }

    exportResult() {
        // Format: "[points_home]:[points_guest] (sets_home/sets_guest) timeout (yes/not)"
        const homeScore = this.gameState.teamA.score;
        const guestScore = this.gameState.teamB.score;
        const homeSets = this.gameState.teamA.sets;
        const guestSets = this.gameState.teamB.sets;
        const timeoutStatus = this.gameState.timeoutActive ? 'Tiempo' : '';

        const exportString = `${homeScore}:${guestScore} (${homeSets}/${guestSets}) ${timeoutStatus}`;

        // Create a modal or notification with the export string
        this.showExportModal(exportString);
    }

    exportSetHistory() {
        // Format: "25:14 24:26 23:24 25:22 15:12 (3/2) [Set 5]/Final"
        let setScores = [];
        
        // Add completed sets
        this.gameState.setHistory.forEach(set => {
            setScores.push(`${set.teamAScore}:${set.teamBScore}`);
        });
        
        // Add current set if in progress (not ended)
        if (!this.gameState.gameEnded && (this.gameState.teamA.score > 0 || this.gameState.teamB.score > 0)) {
            setScores.push(`${this.gameState.teamA.score}:${this.gameState.teamB.score}`);
        }
        
        const homeSets = this.gameState.teamA.sets;
        const guestSets = this.gameState.teamB.sets;
        const setScoresString = setScores.join(' ');
        const matchStatus = this.gameState.gameEnded ? 'Final' : `Set ${this.gameState.currentSet}`;
        
        const exportString = `${setScoresString} (${homeSets}/${guestSets}) [${matchStatus}]`;
        
        // Create a modal or notification with the export string
        this.showExportModal(exportString, 'Exportar Historial de Sets', 'Formato: [puntaje1] [puntaje2] ... (sets_ganados) [Set X/Final]');
    }

    showExportModal(exportString, title = 'Exportar Resultado', format = '[puntos_local]:[puntos_visitante] (sets_local/sets_visitante) [Tiempo]') {
        // Create modal overlay
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;

        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            padding: 2rem;
            border-radius: 1rem;
            max-width: 500px;
            width: 90%;
            text-align: center;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        `;

        modalContent.innerHTML = `
            <h3 style="margin-bottom: 1rem; color: #1e293b;">${title}</h3>
            <div style="background: #f8fafc; padding: 1rem; border-radius: 0.5rem; margin: 1rem 0; font-family: monospace; font-size: 1.1rem; word-break: break-all;">
                ${exportString}
            </div>
            <div style="margin: 1rem 0;">
                <button id="copyBtn" style="background: #2563eb; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; margin-right: 0.5rem; cursor: pointer;">
                    Portapapeles
                </button>
                <button id="shareBtn" style="background: #10b981; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; margin-right: 0.5rem; cursor: pointer;">
                    Compartir
                </button>
                <button id="closeModalBtn" style="background: #64748b; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer;">
                    Cerrar
                </button>
            </div>
            <div style="margin-top: 1rem; font-size: 0.9rem; color: #64748b;">
                <strong>Formato:</strong> ${format}
            </div>
        `;

        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // Add event listeners
        document.getElementById('copyBtn').addEventListener('click', () => {
            navigator.clipboard.writeText(exportString).then(() => {
                showNotification('¡Resultado copiado al portapapeles!', 'success');
                document.body.removeChild(modal);
            }).catch(() => {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = exportString;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showNotification('¡Resultado copiado al portapapeles!', 'success');
                document.body.removeChild(modal);
            });
        });

        document.getElementById('shareBtn').addEventListener('click', () => {
            this.shareToApp(exportString, title);
        });

        document.getElementById('closeModalBtn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });

        // Close on Escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                document.body.removeChild(modal);
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
    }

    shareToApp(text, title = 'Volleyball Match Result') {
        // Check if Web Share API is supported
        if (navigator.share) {
            navigator.share({
                title: title,
                text: text
            }).then(() => {
                showNotification('Shared successfully!', 'success');
            }).catch((error) => {
                console.log('Error sharing:', error);
                // Fallback to URL-based sharing
                this.fallbackShare(text);
            });
        } else {
            // Fallback for browsers that don't support Web Share API
            this.fallbackShare(text);
        }
    }

    fallbackShare(text) {
        // Create a temporary modal with sharing options
        const shareModal = document.createElement('div');
        shareModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10001;
        `;

        const shareContent = document.createElement('div');
        shareContent.style.cssText = `
            background: white;
            padding: 2rem;
            border-radius: 1rem;
            max-width: 400px;
            width: 90%;
            text-align: center;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        `;

        const encodedText = encodeURIComponent(text);
        
        shareContent.innerHTML = `
            <h3 style="margin-bottom: 1.5rem; color: #1e293b;">Compartir en App</h3>
            <div style="display: flex; flex-direction: column; gap: 1rem;">
                <a href="https://wa.me/?text=${encodedText}" target="_blank" 
                   style="background: #25d366; color: white; padding: 1rem; border-radius: 0.5rem; text-decoration: none; font-weight: 600;">
                   📱 WhatsApp
                </a>
                <a href="https://t.me/share/url?text=${encodedText}" target="_blank"
                   style="background: #0088cc; color: white; padding: 1rem; border-radius: 0.5rem; text-decoration: none; font-weight: 600;">
                   ✈️ Telegram
                </a>
                <a href="mailto:?subject=Resultado Partido de Voleibol&body=${encodedText}" 
                   style="background: #ea4335; color: white; padding: 1rem; border-radius: 0.5rem; text-decoration: none; font-weight: 600;">
                   📧 Email
                </a>
                <a href="sms:?body=${encodedText}" 
                   style="background: #34a853; color: white; padding: 1rem; border-radius: 0.5rem; text-decoration: none; font-weight: 600;">
                   💬 SMS
                </a>
            </div>
            <button id="closeFallbackBtn" style="background: #64748b; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; margin-top: 1.5rem; cursor: pointer;">
                Cerrar
            </button>
        `;

        shareModal.appendChild(shareContent);
        document.body.appendChild(shareModal);

        // Add event listeners
        document.getElementById('closeFallbackBtn').addEventListener('click', () => {
            document.body.removeChild(shareModal);
        });

        // Close on overlay click
        shareModal.addEventListener('click', (e) => {
            if (e.target === shareModal) {
                document.body.removeChild(shareModal);
            }
        });

        // Auto-close after sharing (for links that open in same window)
        const shareLinks = shareContent.querySelectorAll('a');
        shareLinks.forEach(link => {
            link.addEventListener('click', () => {
                setTimeout(() => {
                    if (document.body.contains(shareModal)) {
                        document.body.removeChild(shareModal);
                    }
                }, 1000);
            });
        });
    }
}

// Global functions for button onclick handlers
function addPoint(team) {
    if (window.scoreboard) {
        window.scoreboard.addPoint(team);
    }
}

function removePoint(team) {
    if (window.scoreboard) {
        window.scoreboard.removePoint(team);
    }
}

function addTimeout(team) {
    if (window.scoreboard) {
        window.scoreboard.addTimeout(team);
    }
}

function removeTimeout(team) {
    if (window.scoreboard) {
        window.scoreboard.removeTimeout(team);
    }
}

// Initialize scoreboard after existing DOM content loaded functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize volleyball scoreboard
    window.scoreboard = new VolleyballScoreboard();
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { utils, showNotification, isValidEmail, VolleyballScoreboard };
}