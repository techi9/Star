import {Component} from "react";
import "./ColorSelector.css";

class ColorSelector extends Component{
    constructor(props) {
        super(props);
        this.setColor = this.props.setColor;  // call this.setColor(number) to set new color in program
        this.colorWheel = null;
        this.center=null
        this.sector=null
        this.prevAngle=null
        this.inProgress=false
        this.handleColor='#404040'
        this.borderColor = '#898989'
        this.colorTable=[   '#7cedff',
                            '#d1f9ff',
                            '#fdfdfd',
                            '#fffac0',
                            '#ffed76',
                            '#ffca4e',
                            '#ff5f46',
                            '#c64d1f',
                            '#994d27']
        this.nameTable=['blue',
                        'light-blue',
                        'white',
                        'light-yellow',
                        'yellow',
                        'orange',
                        'red',
                        'dark-red',
                        'brown']
        this.setColorWheelRef = element => {
            this.colorWheel = element;
        };
        this.handleClick = (event) => {
            // Focus the text input using the raw DOM API
            if (this.colorWheel && !this.inProgress) {
                let box = this.colorWheel.getBoundingClientRect()
                let x = event.clientX - box.left - box.width/2
                let y = event.clientY - box.top - box.height/2
                let angle = Math.atan2(y,x)+Math.PI/2
                let intAngle = Math.floor((angle+0.5*this.sector)/this.sector)
                if (intAngle<0) intAngle+=9

                this.animate(this.prevAngle,intAngle,this,()=>{
                    this.test(this.nameTable[(intAngle+4)%9])
                    this.prevAngle = intAngle
                    this.inProgress=false
                })



                //console.log(intAngle % 9)

            }
        };
    }
    // test how it works
    test = (color) => {
        this.setColor(color);
    }

    animate(start,stop,wheel,callback){
        if(!wheel) return
        if (start===stop) return
        this.inProgress=true
        let sigmoid = (x) => 1/(1+Math.exp(-x))
        let dsigmoid = (x) => sigmoid(x)*(1-sigmoid(x))
        let startA = start*this.sector
        let stopA = stop*this.sector
        let curr=startA
        if (stopA-startA>Math.PI) stopA-=2*Math.PI
        else if (startA-stopA>Math.PI) stopA+=2*Math.PI
        let delta=(stopA-startA)/20

        let int = setInterval(()=>{
            if (wheel) wheel.drawColorWheel(curr)
            curr+=5*dsigmoid((((curr-startA)/(stopA-startA))-0.5)*6)*delta
            if (curr*Math.sign(delta)>stopA*Math.sign(delta)) {
                clearInterval(int);
                wheel.drawColorWheel(stopA)
                callback()
            }
        },20)

    }



    getRadial(angle,radius) {
        return {x:Math.cos(angle+Math.PI/2)*radius,y:Math.sin(angle+Math.PI/2)*radius}
    }
    add(vec1,vec2) {
        return {x: vec1.x + vec2.x, y: vec1.y + vec2.y}
    }
    drawCircle(ctx,center, radius,color) {
        ctx.save()
        ctx.translate(center.x,center.y)
        let sectors=48
        let sectorAngle = 2*Math.PI / sectors
        ctx.fillStyle = color
        ctx.beginPath();
        let p1 = this.getRadial(0, radius)
        ctx.moveTo(p1.x, p1.y);
        for(let i=0;i<sectors;i++) {
            let p1 = this.getRadial(sectorAngle * i, radius)
            ctx.lineTo(p1.x, p1.y);
        }
        ctx.fill();
        ctx.restore()
    }
    drawBorder(ctx,r1,r2,center) {
        let sectors=48
        let sectorAngle = 2*Math.PI / sectors
        ctx.save()
        ctx.translate(center.x,center.y)
        ctx.fillStyle = this.borderColor
        for (let i=0;i<sectors;i++) {
            ctx.beginPath();
            let p1 = this.getRadial(sectorAngle * i, r2)
            ctx.moveTo(p1.x, p1.y);
            p1 = this.getRadial(sectorAngle * i, r1)
            ctx.lineTo(p1.x, p1.y);
            p1 = this.getRadial(sectorAngle * (i+1)+0.01, r1)
            ctx.lineTo(p1.x, p1.y);
            p1 = this.getRadial(sectorAngle * (i+1)+0.01, r2)
            ctx.lineTo(p1.x, p1.y);
            ctx.fill();
        }
        ctx.restore()
    }
    drawHandle(ctx,center,width,height,angle) {
        ctx.save()

            ctx.translate(center.x,center.y)
            ctx.save()
                ctx.rotate(Math.PI+angle)
                ctx.translate(-width/2,-height/1.5)

                ctx.fillStyle = this.handleColor
                ctx.beginPath();
                ctx.lineTo(0, height);
                //
                ctx.lineTo(width/2, height*1.5);
                ctx.lineTo(width, height);
                ctx.lineTo(width, height*2/3);
                ctx.lineTo(width*1.5, 0);
                ctx.lineTo(-width*0.5, 0);
                ctx.lineTo(0, height*2/3);
                ctx.fill()
            ctx.restore()
        ctx.restore()
    }

    drawColorWheel = (angle) => {
        let size = 400
        this.colorWheel.width = size;
        this.colorWheel.height = size;
        let radius = ((this.colorWheel.width)/2)/1.1
        let center = {x:this.colorWheel.width/2,y:this.colorWheel.width/2}
        this.center=center
        let colors = 9
        let sectors = 5
        let sectorAngle = 2*Math.PI / (colors*sectors)
        this.sector = 2*Math.PI / (colors)
        if (this.colorWheel.getContext) {
            let ctx = this.colorWheel.getContext('2d');
            ctx.clearRect(0,0,this.colorWheel.width,this.colorWheel.width);
            ctx.save()
            ctx.translate(center.x,center.y)
            for (let i=0;i<(colors);i++) {
                ctx.fillStyle = this.colorTable[Math.floor(i)]
                ctx.beginPath();
                let p1 = this.getRadial(sectorAngle * (i*sectors), radius*0.5)
                ctx.moveTo(p1.x, p1.y);
                p1 = this.getRadial(sectorAngle * (i*sectors), radius)
                ctx.lineTo(p1.x, p1.y);
                for (let s=0;s<sectors;s++) {
                    let p1 = this.getRadial(sectorAngle * (i*sectors+(s+1))+0.01, radius)
                    ctx.lineTo(p1.x, p1.y);
                }
                p1 = this.getRadial(sectorAngle * ((i+1)*sectors)+0.01, radius*0.5)
                ctx.lineTo(p1.x, p1.y);
                ctx.fill();
            }
            ctx.restore()
            this.drawCircle(ctx,center,radius*0.55,this.borderColor)
            this.drawBorder(ctx,radius*0.95,radius*1.1,center)
            this.drawHandle(ctx,center,radius*0.4,radius*1.1,angle)
            this.drawCircle(ctx,center,radius*0.25,this.handleColor)
            let intAngle = Math.floor((angle+0.5*this.sector)/this.sector)
            this.drawCircle(ctx,center,radius*0.2,this.colorTable[(intAngle+4)%9])
        }

    }

    componentDidMount() {
        this.prevAngle=0
        this.drawColorWheel(0)
        this.test(this.nameTable[4])
    }


    render() {
        return (  // here's your html (jsx)
            <div >
                <canvas className="canvas" ref={this.setColorWheelRef} onClick={this.handleClick}></canvas>
            </div>
        );
    }

}
export default ColorSelector