// Fade-in scroll animations
const sections = document.querySelectorAll('.mission-section, .team-card, .values-list li');
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = 1;
      e.target.style.transform = 'none';
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.2 });

sections.forEach(el => {
  el.style.opacity = 0;
  el.style.transform = 'translateY(20px)';
  observer.observe(el);
});
