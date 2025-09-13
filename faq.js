const faqItems = document.querySelectorAll('.faq-item');
const searchInput = document.getElementById('faqSearch');
const categoryButtons = document.querySelectorAll('.category-btn');

// Accordion behavior
faqItems.forEach(item => {
  const questionBtn = item.querySelector('.faq-question');
  const lottie = item.querySelector('.faq-lottie');

  questionBtn.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');

    // Close all other items
    faqItems.forEach(i => {
      if (i !== item) {
        i.classList.remove('open');
        const otherLottie = i.querySelector('.faq-lottie');
        if (otherLottie) otherLottie.pause();
      }
    });

    // Toggle current item
    item.classList.toggle('open');

    // Play Lottie if opening, pause if closing
    if (!isOpen && lottie) {
      lottie.play();
    } else if (isOpen && lottie) {
      lottie.stop();
    }
  });
});


// Live search
searchInput.addEventListener('input', e => {
  const search = e.target.value.toLowerCase();
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question').textContent.toLowerCase();
    item.style.display = question.includes(search) ? 'block' : 'none';
  });
});

// Category filtering
categoryButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    categoryButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const category = btn.dataset.category;
    faqItems.forEach(item => {
      const matches = category === "all" || item.dataset.category === category;
      item.style.display = matches ? 'block' : 'none';
    });
  });
});
