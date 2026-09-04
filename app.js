// ===== Solitaire Finz Mart — Construction Finance site behaviour =====

// --- Supabase project connection (public anon key — safe to expose; RLS restricts writes to insert-only) ---
const SUPABASE_URL = 'https://nbpvamrwzqrgoiwpadwc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5icHZhbXJ3enFyZ29pd3BhZHdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyNTcwNDgsImV4cCI6MjEwMDgzMzA0OH0.2CQhyBhbQ7SYAXDuMqnO5qNhiIBpx4jxvDUtwyCGlpQ';

async function submitEnquiry(payload) {
  const body = {
    source: 'construction-finance-website',
    page_url: window.location.href,
    utm_source: new URLSearchParams(window.location.search).get('utm_source') || null,
    utm_medium: new URLSearchParams(window.location.search).get('utm_medium') || null,
    utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign') || null,
    ...payload,
  };
  const res = await fetch(`${SUPABASE_URL}/rest/v1/website_enquiries`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Submission failed (${res.status}): ${text}`);
  }
}

// --- Mobile nav toggle ---
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');
if (navToggle) {
  navToggle.addEventListener('click', () => {
    const open = mainNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  mainNav.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => {
      mainNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    })
  );
}

// --- Footer year ---
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// --- Reduced motion check ---
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// --- Scroll reveal ---
if (!prefersReducedMotion && 'IntersectionObserver' in window) {
  const revealTargets = document.querySelectorAll('.reveal, .reveal-item');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        entry.target.closest('.reveal-group')?.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  revealTargets.forEach((el) => revealObserver.observe(el));
} else {
  document.querySelectorAll('.reveal, .reveal-item, .reveal-group').forEach((el) => el.classList.add('in-view'));
}

// --- Hero stat counters (run once on load) ---
document.querySelectorAll('[data-counter]').forEach((el) => {
  const target = parseInt(el.getAttribute('data-counter'), 10) || 0;
  const suffix = el.getAttribute('data-suffix') || '';
  if (prefersReducedMotion) {
    el.textContent = target + suffix;
    return;
  }
  const duration = 1400;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
    else el.setAttribute('data-counted', 'true');
  }
  requestAnimationFrame(tick);
});

// --- Gallery lightbox ---
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
document.querySelectorAll('.gallery-item img').forEach((img) => {
  img.addEventListener('click', () => {
    lightboxImg.src = img.src.replace(/w=\d+/, 'w=1600');
    lightboxImg.alt = img.alt;
    lightbox.classList.add('open');
  });
});
function closeLightbox() {
  lightbox?.classList.remove('open');
  if (lightboxImg) lightboxImg.src = '';
}
lightboxClose?.addEventListener('click', closeLightbox);
lightbox?.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

// --- Eligibility calculator ---
const eligibilityForm = document.getElementById('eligibilityForm');
const calcResult = document.getElementById('calcResult');
let lastEligibilityPayload = null;

function formatINR(n) {
  if (!isFinite(n) || n <= 0) return '—';
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

if (eligibilityForm) {
  eligibilityForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(eligibilityForm);
    const projectCost = parseFloat(fd.get('projectCost')) || 0;
    const fundingRequirement = parseFloat(fd.get('fundingRequirement')) || 0;
    const promoterContribution = parseFloat(fd.get('promoterContribution')) || 0;
    const salesValue = parseFloat(fd.get('salesValue')) || 0;
    const location = fd.get('location') || '';
    const projectType = fd.get('projectType');
    const stage = fd.get('stage');

    if (projectCost <= 0 || fundingRequirement <= 0) return;

    // Indicative heuristic only — not an underwriting model.
    const maxFunding = projectCost * 0.70;
    const minFunding = projectCost * 0.55;
    const ltv = (fundingRequirement / projectCost) * 100;
    const recommendedPromoter = Math.max(promoterContribution, projectCost * 0.25);

    let nextStep = '';
    if (stage === 'Land / Approvals') {
      nextStep = 'Next step: share land title documents and project approvals so our legal desk can begin verification early.';
    } else if (stage === 'Early Construction') {
      nextStep = 'Next step: share your construction schedule and cost estimate so we can size the funding tranches correctly.';
    } else if (stage === 'Mid Construction') {
      nextStep = 'Next step: share your current construction and sales progress for technical assessment.';
    } else {
      nextStep = 'Next step: since the project is near completion, ask about construction completion or balance-funding options.';
    }
    if (fundingRequirement > maxFunding) {
      nextStep += ' Your requirement is above our typical indicative range for this project cost — a higher promoter contribution or additional security may be needed.';
    }

    document.getElementById('resFundingRange').textContent = `${formatINR(minFunding)} – ${formatINR(maxFunding)}`;
    document.getElementById('resLtv').textContent = `${ltv.toFixed(1)}%`;
    document.getElementById('resPromoter').textContent = formatINR(recommendedPromoter);
    document.getElementById('resNextStep').textContent = nextStep;
    calcResult.hidden = false;
    calcResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    lastEligibilityPayload = {
      enquiry_type: 'eligibility_check',
      full_name: 'Eligibility Calculator Visitor',
      mobile: 'not provided',
      project_location: location,
      estimated_project_cost: projectCost,
      funding_requirement: fundingRequirement,
      promoter_contribution: promoterContribution,
      project_stage: stage,
      eligibility_result: {
        projectType, minFunding, maxFunding, ltv, recommendedPromoter, salesValue,
      },
    };
  });
}

const calcApplyBtn = document.getElementById('calcApplyBtn');
if (calcApplyBtn) {
  calcApplyBtn.addEventListener('click', () => {
    document.getElementById('apply').scrollIntoView({ behavior: 'smooth' });
    const msgField = document.querySelector('#applyForm textarea[name="message"]');
    if (msgField && lastEligibilityPayload) {
      msgField.value = `Ran the eligibility calculator: project cost ${formatINR(lastEligibilityPayload.estimated_project_cost)}, funding requirement ${formatINR(lastEligibilityPayload.funding_requirement)}, stage: ${lastEligibilityPayload.project_stage}.`;
    }
  });
}

// --- Generic form handler for Apply / Callback forms ---
function wireForm(formId, statusId) {
  const form = document.getElementById(formId);
  const status = document.getElementById(statusId);
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());
    // Normalise numeric fields
    if (payload.funding_requirement) payload.funding_requirement = parseFloat(payload.funding_requirement) || null;

    submitBtn.disabled = true;
    status.textContent = 'Submitting…';
    try {
      await submitEnquiry(payload);
      status.textContent = "Thank you — we've received your details. A relationship manager will contact you shortly.";
      form.reset();
    } catch (err) {
      console.error(err);
      status.textContent = 'Something went wrong submitting this form. Please call us directly or try again in a moment.';
    } finally {
      submitBtn.disabled = false;
    }
  });
}

wireForm('applyForm', 'applyStatus');
wireForm('callbackForm', 'callbackStatus');
