export class Transformations{
  constructor(c){
    this.c = c;
    this.ctx = c.getContext('2d');
    this.camera = {x: c.width/2,y: c.height/2};
    this.anchor = {x: c.width/2,y: c.height/2};
    this.scale = 1;
    this.moving = false;
    this.isStatic = false;
    this.oC = null;
    this.addEvents();
  }
  addEvents(){
    this.c.addEventListener('mousedown',(e)=>{
      if(!this.isStatic){
        this.moving = true;
        const m = this.getMousePos(e);
        this.oC = this.screenToWorld(m);
      }
    })
    this.c.addEventListener('mousemove',(e)=>{
      const m = this.getMousePos(e);
      if(this.moving){
        const world_m = this.screenToWorld(m);
        this.camera = {x: this.oC.x + (this.oC.x - world_m.x), y: this.oC.y + (this.oC.y - world_m.y)};
      }
      this.camera = this.screenToWorld(m);
      this.anchor = m;
    })
    this.c.addEventListener('mouseup',(e)=>{
      this.moving = false;
    })
    this.c.addEventListener('wheel',(e)=>{
      e.preventDefault();
      if(this.isStatic) return;
      const change = .75;
      this.scale = e.deltaY > 0? this.scale * change : this.scale / change;
    })
  }
  getMousePos(e){
    const rect = this.c.getBoundingClientRect();
    return{
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }
  screenToWorld(point){
    return{
      x: (point.x - this.anchor.x)/this.scale + this.camera.x,
      y: (point.y - this.anchor.y)/this.scale + this.camera.y
    }
  }
  getShapeCenter(shape){
    let xSum = 0;
    let ySum = 0;
    for(let i=0;i<shape.length;i++){
      xSum += shape[i].x;
      ySum += shape[i].y;
    }
    return{
      x: xSum / shape.length,
      y: ySum / shape.length,
    }
  }
  transformLineWidth(lineWidth){
    const points = [this.transformPoint({x: 0,y: 0}),
      this.transformPoint({x: lineWidth, y:0 })];
    return points[1].x - points[0].x;
  }
  translateShape(shape,x,y){
    for(let i=0;i<shape.length;i++){
      shape[i].x += x;
      shape[i].y += y;
    }
  }
  rotateShape(shape,angle,point){
    const ax = [
      [Math.cos(angle), -Math.sin(angle)],
      [Math.sin(angle), Math.cos(angle)]
    ]
    for(let i=0;i<shape.length;i++){
      const x = shape[i].x - point.x;
      const y = shape[i].y - point.y;
      shape[i].x = ax[0][0] * x + ax[0][1] * y + point.y;
      shape[i].y = ax[1][0] * x + ax[1][1] * y + point.y;
    }
  }
  setIsStatic(isStatic){this.isStatic = isStatic; this.moving = false;}
  setScale(scale){this.scale = scale}
  setAnchor(anchor){this.anchor = anchor}
  setCamera(camera){this.camera = camera}
  transformPoint(point){
    const x = point.x - this.camera.x;
    const y = point.y - this.camera.y;

    return {
      x: x*this.scale + this.anchor.x,
      y: y*this.scale + this.anchor.y
    }
  }
  drawShape(shape,color,fill){
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = color;
    this.ctx.beginPath();
    const point = this.transformPoint(shape[0]);
    this.ctx.moveTo(point.x,point.y);
    for(let i=1;i<shape.length;i++){
      const point2 = this.transformPoint(shape[i]);
      this.ctx.lineTo(point2.x,point2.y);
    }
    this.ctx.lineTo(point.x,point.y);
    if(fill){
      this.ctx.fill();
    } else{
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }
  }

  drawLine(shape,color,width){
    this.ctx.lineWidth = width? width : 1;
    this.ctx.strokeStyle = color;
    this.ctx.beginPath();
    const point = this.transformPoint(shape[0]);
    this.ctx.moveTo(point.x,point.y);
    for(let i=1;i<shape.length;i++){
      const point2 = this.transformPoint(shape[i]);
      this.ctx.lineTo(point2.x,point2.y);
    }
    this.ctx.stroke();
  }
}


export const getRectangle = (x,y,width,height) =>{
  const points = [];
  points.push({x: x - width/2, y: y - height/2});
  points.push({x: x + width/2, y: y - height/2});
  points.push({x: x + width/2, y: y + height/2});
  points.push({x: x - width/2, y: y + height/2});
  return points;
}

export const getCircle = (x,y,radius) => {
  const points = [];
  const bigAngle = 2*Math.PI;
  for(let i=0;i<30;i++){
    const angle = bigAngle * (i/30);
    points.push({
      x: x + radius*Math.cos(angle),
      y: y + radius*Math.sin(angle),
    })
  }
  return points;
}