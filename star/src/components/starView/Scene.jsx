import React, { Component } from "react";
import * as THREE from "three";
import sunVertex from "../../starShaders/sunVertex.glsl";
import sunFragmentRed from "../../starShaders/sunFragmentRed.glsl";
import sunFragmentBlue from "../../starShaders/sunFragmentBlue.glsl";
import sunFragmentYellow from "../../starShaders/sunFragmentYellow.glsl";
import sunFragmentOrange from "../../starShaders/sunFragmentOrange.glsl";
import sunFragmentBrown from "../../starShaders/sunFragmentBrown.glsl";
import sunFragmentWhite from "../../starShaders/sunFragmentWhite.glsl";

class Scene extends Component {
    constructor(props) {
        super(props);

        this.height = props.height
        this.width = props.width

        this.initSpace();

    }

    initSpace() {
        this.aspectRatio = this.width / this.height;
        this.fieldOfView = 75;
        this.nearPlane = 1;
        this.farPlane = 1000;

        this.camera = new THREE.PerspectiveCamera(this.fieldOfView, this.aspectRatio, this.nearPlane, this.farPlane);

        this.camera.position.z = this.farPlane / 2;

        this.scene = new THREE.Scene({antialias:true});
        this.scene.fog = new THREE.FogExp2( 0x000000, 0.0003 );

        this.starForge();



        this.renderer = new THREE.WebGLRenderer({alpha: true});
        this.renderer.setClearColor(0x000011, 1);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize( this.width, this.height);
        this.renderer.physicallyCorrectLights = true;
        this.renderer.outputEncoding = THREE.sRGBEncoding;

    }


    onWindowResize = () => {
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.camera.aspect = this.aspectRatio;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width, this.height);
    }

    starForge = () => {
        let material = new THREE.PointsMaterial({
            color: 'white'
        });
        let range = this.height;
        let arr = new Float32Array(15000)
        for (let i = 0; i < 5000; i+=3) {
            arr[i] = Math.random() * range - range / 2
            arr[i+1] = Math.random() * range - range / 2
            arr[i+2] = Math.random() * range - range / 2

        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute( 'position', new THREE.BufferAttribute( arr, 3 ) );

        this.cloud = new THREE.Points(geometry, material);

        this.scene.add(this.cloud);
    }



    componentDidMount() {
        this.mount.appendChild(this.renderer.domElement); // mount a scene inside of React using a ref
        let camera = this.camera
        let renderer = this.renderer
        let scene = this.scene
        let cloud = this.cloud
        let uniforms = this.star.material.uniforms
        let star = this.star

        let oldTime = new Date().getTime();
        let time = 0
        let delta = 0

        let animate = () => {
            requestAnimationFrame(animate);

            time = new Date().getTime();
            delta = 0.001 * ( time - oldTime );
            oldTime = time;

            uniforms.time.value += 0.1 * delta;
            star.rotation.y += 0.02 * delta;
            star.rotation.x += 0.005 * delta;


            cloud.rotateX(0.00008)
            cloud.rotateY(0.00005)
            cloud.rotateZ(0.00003)


            renderer.render(scene, camera);

        }

        animate()
    }

    //------------------------------------------------------------------------------------------------------------------








    //------------------------------------------------------------------------------------------------------------------

    render() {

        return(
            <div onResize={this.onWindowResize} ref={ref => (this.mount = ref)}>
            </div>

        );
    }
}

export default Scene