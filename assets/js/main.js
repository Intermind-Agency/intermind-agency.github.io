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
        topic: '',
        situation: '',
        outcome: '',
        support: '',
        timing: ''
    };

    const stepKeys = ['topic', 'situation', 'outcome', 'support', 'timing'];

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
                if (stepKeys[index]) {
                    answers[stepKeys[index]] = btn.textContent.trim();
                }
                // Enable next button
                nextBtn.disabled = false;
            });
        });
    });

    function getRecommendedNextStep(answers) {
        if (answers.topic === 'AI advisory') {
            return 'AI opportunity and governance consultation';
        }
        if (answers.topic === 'Robotics & automation') {
            return 'Automation potential and feasibility discussion';
        }
        if (answers.topic === 'Interim management or special project') {
            return 'Confidential scoping call for temporary senior support';
        }
        if (answers.topic === 'Not sure yet' || answers.support === 'Confidential first conversation before defining the scope') {
            return 'Confidential orientation conversation';
        }
        return 'Confidential consultation';
    }

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
        const nextStep = getRecommendedNextStep(answers);
        
        summaryContainer.innerHTML = `
            <div class="summary-card">
                <div class="summary-item">
                    <span class="summary-label">Primary topic</span>
                    <span class="summary-value">${answers.topic}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Current situation</span>
                    <span class="summary-value">${answers.situation}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Desired outcome</span>
                    <span class="summary-value">${answers.outcome}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Preferred support</span>
                    <span class="summary-value">${answers.support}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Timing / readiness</span>
                    <span class="summary-value">${answers.timing}</span>
                </div>
                <div class="summary-item" style="margin-top: 2rem; border-top: 1px solid rgba(0,0,0,0.05); padding-top: 1.5rem;">
                    <span class="summary-label">Recommended next step</span>
                    <span class="summary-value">${nextStep}</span>
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
    const nextStep = [
        answers.topic === 'AI advisory' ? 'AI opportunity and governance consultation' : null,
        answers.topic === 'Robotics & automation' ? 'Automation potential and feasibility discussion' : null,
        answers.topic === 'Interim management or special project' ? 'Confidential scoping call for temporary senior support' : null,
        (answers.topic === 'Not sure yet' || answers.support === 'Confidential first conversation before defining the scope') ? 'Confidential orientation conversation' : null,
        'Confidential consultation'
    ].find(s => s !== null);

    return [
        "[ Please enter your message here ]",
        "",
        "___",
        "Consultation summary from the Intermind Advisory Navigator:",
        "",
        `Primary topic: ${answers.topic || "-"}`,
        `Current business situation: ${answers.situation || "-"}`,
        `Desired outcome: ${answers.outcome || "-"}`,
        `Preferred support mode: ${answers.support || "-"}`,
        `Timing / readiness: ${answers.timing || "-"}`,
        "",
        `Recommended next step: ${nextStep}`,
        "",
        "Context:",
        "The visitor used the Advisory Navigator to describe a potential consulting need. The answers indicate the business topic, current situation, desired outcome, preferred support type and approximate timing."
    ].join("\n");
}

/**
 * Builds the full Tally URL with encoded summary
 */
function buildTallyUrl(answers = {}) {
    if (!answers || !answers.topic) return TALLY_FORM_URL;
    
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
