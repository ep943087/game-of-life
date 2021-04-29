import {getRectangle, Transformations} from './transformations.js';

class Cell{
    constructor(i,j){
        this.i = i;
        this.j = j;
        this.alive = Math.random() < .1;
    }

    getColor(){
        return this.alive? "black" : "white";
    }

    setNeighbors(grid){
        this.neighbors = [];
        for(let i=-1;i<=1;i++){
            for(let j=-1;j<=1;j++){
                if(i === 0 && j === 0)
                    continue;
                let ci = this.i + i;
                let cj = this.j + j;

                if(ci < 0 || cj < 0 || ci >= grid.length || cj >= grid[0].length)
                    continue;
                
                // ci = ci < 0? grid.length - 1 : ci;
                // cj = cj < 0? grid[0].length - 1 : cj;
                // ci = ci >= grid.length? 0 : ci;
                // cj = cj >= grid[0].length? 0 : cj;

                this.neighbors.push(grid[ci][cj]);
            }
        }
    }

    aliveNeighbors(){
        let count = 0;

        for(let i=0;i<this.neighbors.length;i++){
            if(this.neighbors[i].alive)
                count++;
        }

        return count;
    }

    getStatus(){
        const aliveCount = this.aliveNeighbors();

        if(this.alive){
            if(aliveCount < 2){
                return false;
            } else if(aliveCount <= 3){
                return true;
            } else{
                return false;
            }
        } else if(aliveCount === 3){
            return true;
        } else{
            return false;
        }
    }
}

export default class GameOfLife{
    constructor(rows, cols, c){
        this.rows = rows;
        this.cols = cols;
        this.gridColor = "gray";
        this.wrapAround = true;
        this.initGrid();        
        this.transforms = new Transformations(c);
        this.width = 25;
        this.height = 25;
        this.gridWidth = this.cols * this.width;
        this.gridHeight = this.rows * this.height;
        this.transforms.setCamera({x: this.gridWidth/2, y: this.gridHeight/2});
        this.setControls();
        this.currentCell = null;        
        this.mouse(c);
        this.clearNodesButton();
    }

    getCurrentIJ = (e) =>{
        const m = this.transforms.getMousePos(e);
        const wm = this.transforms.screenToWorld(m);
        if(wm.x < 0 || wm.y < 0 || wm.x >= this.gridWidth || wm.y >= this.gridHeight){
            return (this.currentCell = null);
        }
        const i = Math.floor((wm.y / this.gridHeight) * this.rows);
        const j = Math.floor((wm.x / this.gridWidth) * this.cols);
        return {i,j};
    }

    clearNodesButton(){
        document.querySelector('.clear-button').onclick = (e)=>{
            for(let i=0;i<this.rows;i++){
                for(let j=0;j<this.cols;j++){
                    this.grid[i][j].alive = false;
                }
            }
        }
    }

    setCurrentNode(e, alive){
        const {i,j} = this.getCurrentIJ(e);
        this.grid[i][j].alive = alive;
    }

    mouse(c){
        c.addEventListener('mousedown',(e)=>{
            this.mouseDown = true;
            if(!this.editMode.checked || this.editType === "move-around") return;
            switch(this.editType){
                case "life":
                    this.setCurrentNode(e,true);
                    break;
                case "death":
                    this.setCurrentNode(e,false);
                    break;
            }
        })
        c.addEventListener('mousemove',(e)=>{
            if(!this.mouseDown || !this.editMode.checked || this.editType === "move-around") return;
            switch(this.editType){
                case "life":
                    this.setCurrentNode(e,true);
                    break;
                case "death":
                    this.setCurrentNode(e,false);
                    break;
            }
        });
        c.addEventListener('mouseup',(e)=>{
            this.mouseDown = false;
        });
    }

    deactivateAllButtons(){
        document.querySelector('.buttons').querySelectorAll('button').forEach(button=>{
            button.classList.remove('active');
        });
        document.querySelector(`.${this.editType}`).classList.add('active');
    }

    editModeChanged = (e) =>{
        document.querySelector('.buttons').classList.toggle('showing');
        this.deactivateAllButtons();

        if(!this.editMode.checked)
            this.transforms.isStatic = false;
        else if(this.editType !== "move-around")
            this.transforms.isStatic = true;
    }

    buttonClicked = (e) => {
        this.editType = e.target.classList[0];
        this.deactivateAllButtons();
        const isStatic = this.editType !== "move-around";
        this.transforms.setIsStatic(isStatic);
    }

    buttonsClicked(){
        document.querySelector('.buttons').querySelectorAll('button').forEach(button=>{
            button.addEventListener('click',this.buttonClicked);
        });
    }

    setControls(){
        this.editType = "move-around";
        this.editMode = document.querySelector('#edit-mode');
        this.editMode.onchange = this.editModeChanged;
        this.buttonsClicked();
    }


    initGrid(){
        this.grid = [];
        for(let i=0;i<this.rows;i++){
            const row = [];
            for(let j=0;j<this.cols;j++){
                row.push(new Cell(i,j));
            }
            this.grid.push(row);
        }

        for(let i=0;i<this.rows;i++){
            for(let j=0;j<this.cols;j++){
                this.grid[i][j].setNeighbors(this.grid);
            }
        }
    }

    update(){

        if(this.editMode.checked) return;

        this.copy = [];
        for(let i=0;i<this.rows;i++){
            const row = [];
            for(let j=0;j<this.cols;j++){
                row.push(this.grid[i][j].getStatus(this.grid));
            }
            this.copy.push(row);
        }

        for(let i=0;i<this.rows;i++){
            for(let j=0;j<this.cols;j++){
                this.grid[i][j].alive = this.copy[i][j];
            }
        }
    }

    draw(){
        this.halfWidth = this.width/2;
        this.halfHeight = this.height/2;
        this.gridWidth = this.width * this.cols;
        this.gridHeight = this.height * this.rows;
        this.drawCells();
        this.drawGrid();
    }

    drawCells(){
        for(let i=0;i<this.rows;i++){
            for(let j=0;j<this.cols;j++){
                if(!this.grid[i][j].alive)
                    continue;
                
                const rect = getRectangle(this.width * j + this.halfWidth, this.height * i + this.halfHeight, this.width, this.height);
                this.transforms.drawShape(rect, "black", true); 
                
            }
        }
    }

    drawGrid(){
        const lineWidth = this.transforms.transformLineWidth(1.5);
        for(let i=0;i<this.rows+1;i++){

            const width = i%10 === 0? 2 * lineWidth : lineWidth;

            this.transforms.drawLine([{x: 0,y: i*this.height},{x: this.gridWidth, y: i*this.height}], this.gridColor, width);
            this.transforms.drawLine([{x: i*this.width, y: 0},{x: i*this.width, y: this.gridHeight}], this.gridColor, width);
        }
    }
}