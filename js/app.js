import GameOfLife from './gameOfLife.js';

const c = document.querySelector('#myCanvas');
const ctx = c.getContext('2d');

const game = new GameOfLife(400,400, c);

let myInterval;

const draw = () => {
    requestAnimationFrame(draw);

    c.width = c.clientWidth;
    c.height = c.clientHeight;

    ctx.fillStyle = "white";
    ctx.clearRect(0,0,c.width,c.height);
    ctx.fillRect(0,0,c.width,c.height);

    game.draw();
}

window.onload = () => {
    draw();
    myInterval = setInterval(()=>{
        game.update();
    }, 100);
}