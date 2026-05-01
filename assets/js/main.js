/**
 * Intermind Agency - Main JavaScript
 * Handles interactive elements like the Advisory Navigator and Tally form integration.
 */

const TALLY_FORM_URL = "https://tally.so/r/eq9ROl";

document.addEventListener('DOMContentLoaded', () => {
    initNavigator();
    initContactForm();
    initSmoothScroll();
});

/**
 * Global state for navigator answers to be shared with contact section
 */
let navigatorAnswers = null;

/**
 * Advisory Navigator Logic
 */
function initNavigator() {
    const navigator = document.getElementById('advisory-navigator');
    if (!navigator) return;

    const steps = navigator.querySelectorAll('.navigator-step');
    const nextBtn = document.getElementById('nav-next');
    const prevBtn = document.getElementById('nav-prev');
    const restartBtn = document.getElementById('nav-restart');
    const summaryContainer = document.getElementById('nav-summary-content');
    
    let currentStepIndex = 0;
    const answers = {
        challenge: '',
        situation: '',
        support: '',
        timeline: ''
    };

    const stepKeys = ['challenge', 'situation', 'support', 'timeline'];

    // Option selection
    steps.forEach((step, index) => {
        const buttons = step.querySelectorAll('.option-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Deselect others in this step
                buttons.forEach(b => b.classList.remove('selected'));
                // Select this one
                btn.classList.add('selected');
                // Store answer
                answers[stepKeys[index]] = btn.textContent.trim();
                // Enable next button
                nextBtn.disabled = false;
            });
        });
    });

    function updateStep() {
        steps.forEach((step, index) => {
            step.classList.toggle('active', index === currentStepIndex);
        });

        // Button visibility
        prevBtn.style.visibility = currentStepIndex > 0 && currentStepIndex < steps.length ? 'visible' : 'hidden';
        
        if (currentStepIndex === steps.length - 1) {
            nextBtn.style.display = 'none';
            restartBtn.style.display = 'inline-flex';
            navigatorAnswers = { ...answers }; // Update global state
            showSummary();
            updateContactCTA(); // Update the main contact button as well
        } else {
            nextBtn.style.display = 'inline-flex';
            restartBtn.style.display = 'none';
            // Disable next if no answer for current step
            nextBtn.disabled = !answers[stepKeys[currentStepIndex]];
        }
    }

    function showSummary() {
        if (!summaryContainer) return;
        
        const tallyUrl = buildTallyUrl(answers);
        
        summaryContainer.innerHTML = `
            <div class="summary-card">
                <div class="summary-item">
                    <span class="summary-label">Challenge area</span>
                    <span class="summary-value">${answers.challenge}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Current need</span>
                    <span class="summary-value">${answers.situation}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Suggested support</span>
                    <span class="summary-value">${answers.support}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Time horizon</span>
                    <span class="summary-value">${answers.timeline}</span>
                </div>
                <div class="summary-item" style="margin-top: 2rem; border-top: 1px solid rgba(0,0,0,0.05); padding-top: 1.5rem;">
                    <span class="summary-label">Recommended next step</span>
                    <span class="summary-value">Confidential consultation</span>
                </div>
            </div>
            <p style="font-size: 0.875rem; color: var(--color-text-muted); margin-top: 1.5rem; text-align: center;">
                Your navigator answers can be passed to the consultation form to help us understand the context of your request.
            </p>
            <div class="mt-2 text-center">
                <a href="${tallyUrl}" target="_blank" rel="noopener" class="btn btn-primary">Continue to Consultation Form</a>
            </div>
        `;
    }

    nextBtn.addEventListener('click', () => {
        if (currentStepIndex < steps.length - 1) {
            currentStepIndex++;
            updateStep();
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentStepIndex > 0) {
            currentStepIndex--;
            updateStep();
        }
    });

    restartBtn.addEventListener('click', () => {
        currentStepIndex = 0;
        navigatorAnswers = null; // Reset global state
        // Reset answers
        Object.keys(answers).forEach(key => answers[key] = '');
        // Reset buttons
        navigator.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('selected'));
        updateStep();
        updateContactCTA();
    });

    updateStep();
}

/**
 * Builds the plain text summary for Tally
 */
function buildNavigatorSummary(answers = {}) {
    return [
        "[ Please enter your message here ]",
        "",
        "___",
        "Consultation summary from the Intermind Advisory Navigator:",
        "",
        `Challenge area: ${answers.challenge || "-"}`,
        `Current situation: ${answers.situation || "-"}`,
        `Suggested support: ${answers.support || "-"}`,
        `Time horizon: ${answers.timeline || "-"}`,
        "",
        "Recommended next step: Confidential consultation"
    ].join("\n");
}

/**
 * Builds the full Tally URL with encoded summary
 */
function buildTallyUrl(answers = {}) {
    if (!answers || !answers.challenge) return TALLY_FORM_URL;
    
    const summary = buildNavigatorSummary(answers);
    
    const params = new URLSearchParams();
    // Using the hidden field name re-added by the user
    params.set("navigatorSummary", summary);
    
    return `${TALLY_FORM_URL}?${params.toString()}`;
}

/**
 * Contact Form Integration (Tally CTA)
 */
function initContactForm() {
    updateContactCTA();
}

/**
 * Updates the main contact button with the latest navigator context if available
 */
function updateContactCTA() {
    const contactCta = document.getElementById('contact-tally-cta');
    if (!contactCta) return;

    if (navigatorAnswers) {
        contactCta.href = buildTallyUrl(navigatorAnswers);
        contactCta.textContent = "Continue to Consultation Form";
    } else {
        contactCta.href = TALLY_FORM_URL;
        contactCta.textContent = "Start a Consultation Request";
    }
}

/**
 * Smooth Scrolling for Anchor Links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId.includes('.html')) return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Offset for sticky header
                    behavior: 'smooth'
                });
            }
        });
    });
}
