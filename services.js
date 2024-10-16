let mode = document.querySelector('.darkMode i');
let button = document.querySelector('.darkMode');
let body = document.querySelector('body');
let modeChanger = function () {
    if (mode.classList.contains('bx-sun')) {
        mode.classList.remove('bx-sun');
        mode.classList.add('bxs-moon');
        body.classList.add('dark-mode');
    } else {
        mode.classList.remove('bxs-moon');
        body.classList.remove('dark-mode');
        mode.classList.add('bx-sun');
    }
};

button.addEventListener('click', modeChanger);
