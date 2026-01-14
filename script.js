document.addEventListener("DOMContentLoaded", () => {
  const PAUSE_DURATION = 0;
  const ICONS = {
    play: 'C-medien/play-button-icon.webp',
    pause: 'C-medien/Pause-button-icon.webp',
    soundOn: 'C-medien/Sound-On-icon.webp',
    soundOff: 'C-medien/Sound-Off-icon.webp'
  };

  const setupVideo = (container) => {
    const video = container.querySelector('video');
    if (!video) return;
    const playImg = container.querySelector('.play-pause-btn img');
    const muteImg = container.querySelector('.mute-btn img');

    container.querySelector('.mute-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      video.muted = !video.muted;
      if (muteImg) muteImg.src = video.muted ? ICONS.soundOff : ICONS.soundOn;
    });

    container.querySelector('.play-pause-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      video.paused ? video.play() : video.pause();
      if (video.closest('.section3')) video.loop = !video.paused;
    });

    video.addEventListener('play', () => { if(playImg) playImg.src = ICONS.pause; });
    video.addEventListener('pause', () => { if(playImg) playImg.src = ICONS.play; });
    video.addEventListener('ended', () => {
      if (video.closest('.section3')) { video.currentTime = 0; video.pause(); } 
      else { setTimeout(() => { if(video.closest('.slide.active')) video.play(); }, PAUSE_DURATION); }
    });
  };

  document.querySelectorAll('.video-container').forEach(setupVideo);

  document.querySelectorAll('.nav-links a, .dropdown-content a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (!href.startsWith('#') || href.length <= 1) return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (!target) return;

      document.querySelectorAll('.reveal').forEach(el => {
        el.style.transition = 'none';
        el.classList.add('visible');
        setTimeout(() => el.style.transition = '', 1000);
      });

      const drop = document.querySelector('.dropdown-content');
      if (drop) drop.style.display = 'none';

      const start = window.pageYOffset;
      const targetPos = (target.getBoundingClientRect().top + start) - (window.innerHeight / 2) + (target.offsetHeight / 2);
      const startTime = performance.now();

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / 950, 1);
        const ease = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        window.scrollTo(0, start + (targetPos - start) * ease);
        if (elapsed < 950) requestAnimationFrame(animate);
        else if (drop) setTimeout(() => drop.style.removeProperty('display'), 100);
      };
      requestAnimationFrame(animate);
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        setTimeout(() => {
          const vids = entry.target.querySelectorAll('video');
          if (entry.target.classList.contains('section3')) {
            if(vids[0]) vids[0].play();
            setTimeout(() => { if(vids[1]) vids[1].play(); }, 35000);
          } else {
            const activeVid = entry.target.querySelector('.slide.active video');
            if(activeVid) activeVid.play();
          }
        }, 800);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  const initCarousel = (sel) => {
    const sec = document.querySelector(sel);
    if (!sec || sec.classList.contains('section3')) return;
    const slides = sec.querySelectorAll('.slide'), dots = sec.querySelectorAll('.dot'), texts = sec.querySelectorAll('.slide-text p');
    
    const update = (idx) => {
      slides.forEach((s, i) => {
        const active = (i === idx);
        s.classList.toggle('active', active);
        const v = s.querySelector('video');
        if (v) {
          if (active) { v.currentTime = 0; if(sec.classList.contains('visible')) v.play(); } 
          else { v.pause(); }
        }
      });
      texts.forEach((t, i) => t.classList.toggle('active', i === idx));
      dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    };

    sec.querySelector('.prev')?.addEventListener('click', () => {
      const cur = [...slides].findIndex(s => s.classList.contains('active'));
      update((cur - 1 + slides.length) % slides.length);
    });
    sec.querySelector('.next')?.addEventListener('click', () => {
      const cur = [...slides].findIndex(s => s.classList.contains('active'));
      update((cur + 1) % slides.length);
    });
    dots.forEach((d, i) => d.addEventListener('click', () => update(i)));
  };

  ['.section1', '.section2', '.section4', '.section5', '.section6'].forEach(initCarousel);
});