// lets start script 
let menuIcon = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');

menuIcon.onclick = () => {
    menuIcon.classList.toggle('bx-x');
    navbar.classList.toggle('active');
}

// lets start script 
let sections = document.querySelectorAll('section');
let navLinks = document.querySelectorAll('header nav a');

window.onscroll = () => {
    sections.forEach(sec => {
        let top = window.scrollY;
        let offset = sec.offsetTop - 150;
        let hight = sec.offsetHeight;
        let id = sec.getAttribute('id');

        if (top >= offset && top < offset + hight) {
            navLinks.forEach(links => {
                links.classList.remove('active');
                document.querySelector('header nav a[href*=' + id + ']').classList.add('active');
            });
        };
    });
    // sticky nav
    let header = document.querySelector('header');

    header.classList.toggle('sticky', window.scrollY > 100);

    // remove toggle icon when  click navbar link (scroll)
    menuIcon.classList.remove('bx-x');
    navbar.classList.remove('active');
};


//Scroll Reveal
ScrollReveal({
    reset: true,
    distance: '80px',
    duration: 2000,
    delay: 200
});

ScrollReveal().reveal('.home-content', { origin: 'top' });
ScrollReveal().reveal('.home-img', { origin: 'bottom' });
ScrollReveal().reveal('.home-content h1', { origin: 'left' });
ScrollReveal().reveal('.home-content p', { origin: 'right' });

// Typed js

const typed = new Typed('.multiple-text', {
    strings: ['Frontend Developer', 'Backend Developer', 'MERN Stack', 'Web Developer'],
    typeSpeed: 100,
    backSpeed: 100,
    backDelay: 1000,
    loop: true
});


// Read more box try

let readButton = document.querySelector('.read-more');
let content = document.querySelector('.extra-content');

let toggleRead = function () {
    if (content.style.display == 'none' || content.style.display === '') {
        content.style.display = 'block';
        readButton.textContent = 'Read Less';
    }
    else {
        content.style.display = 'none';
        readButton.textContent = 'Read More';
    }
}
readButton.addEventListener('click', toggleRead);

let sun = document.querySelector('.darkMode i');
let button = document.querySelector('.darkMode');
let body = document.querySelector('body');

let modeChanger = function () {
    if (sun.classList.contains('bx-sun')) {
        sun.classList.remove('bx-sun');
        sun.classList.add('bxs-moon');
        body.classList.add('dark-mode');
    }
    else {
        sun.classList.remove('bxs-moon');
        body.classList.remove('dark-mode');
        sun.classList.add('bx-sun');
    }
}

button.addEventListener('click', modeChanger);

