import React, { Component } from "react";
import * as THREE from "three";
import fragment from "../../planet/shader/fragment.glsl";
import fragmentSun from "../../planet/sun/fragment.glsl";
import fragmentSunAround from "../../planet/sunAround/fragment.glsl";
import fragmentTube from "../../planet/tube/fragment.glsl";
import vertex from "../../planet/shader/vertex.glsl";
import vertexSun from "../../planet/sun/vertex.glsl";
import vertexSunAround from "../../planet/sunAround/vertex.glsl";
import vertexTube from "../../planet/tube/vertex.glsl";

class Scene extends Component {
    constructor(props) {
        super(props);

        this.height = props.height
        this.width = props.width

        this.initSpace();

        this.time = 0;

        this.isPlaying = true;
        this.getCube();


        this.addObjects();
        this.addAround();
        this.addTubes()
        this.render();

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

        let animate = () => {
            requestAnimationFrame(animate);
            cloud.rotateX(0.00008)
            cloud.rotateY(0.00005)
            cloud.rotateZ(0.00003)


            this.cubeCamera1.update( this.renderer, this.scene1 );
            this.material.uniforms.uPerlinCube.value =  this.cubeRenderTarget1.texture;

            if (!this.isPlaying) return;
            this.time += 0.05;
            this.material.uniforms.time.value = this.time;
            this.materialPerlin.uniforms.time.value = this.time;

            renderer.render(scene, camera);

        }

        animate()
    }

    //------------------------------------------------------------------------------------------------------------------

    addTubes(){
        class CustomSinCurve extends THREE.Curve {
            constructor( scale = 1 ) {
                super();
                this.scale = scale;
            }

            getPoint( t, optionalTarget = new THREE.Vector3() ) {
                const tx = t * 3 - 1.5;
                const ty = Math.sin( 2 * Math.PI * t );
                const tz = 0;
                return optionalTarget.set( tx, ty, tz ).multiplyScalar( this.scale );

            }

        }

        this.materialTube = new THREE.ShaderMaterial({
            extensions: {
                derivatives: "#extension GL_OES_standard_derivatives : enable"
            },
            side: THREE.DoubleSide,
            uniforms: {
                time: { value: 0 },
                resolution: { value: new THREE.Vector4() },
            },
            // wireframe: true,
            transparent: true,
            vertexShader: vertexTube,
            fragmentShader: fragmentTube
        });

        const path = new CustomSinCurve( 2 );
        const geometry = new THREE.TubeGeometry( path, 20, 0.1, 8, false );
        const mesh = new THREE.Mesh( geometry,this.materialTube );
        this.scene.add( mesh );

    }

    getCube(){
        this.scene1 = new THREE.Scene()
        this.cubeRenderTarget1 = new THREE.WebGLCubeRenderTarget( 256, {
            format: THREE.RGBFormat,
            generateMipmaps: true,
            minFilter: THREE.LinearMipmapLinearFilter,
            encoding: THREE.sRGBEncoding // temporary -- to prevent the material's shader from recompiling every frame
        } );

        this.cubeCamera1 = new THREE.CubeCamera( 0.1, 10, this.cubeRenderTarget1 );
        this.materialPerlin = new THREE.ShaderMaterial({
            extensions: {
                derivatives: "#extension GL_OES_standard_derivatives : enable"
            },
            side: THREE.DoubleSide,
            uniforms: {
                time: { value: 0 },
                resolution: { value: new THREE.Vector4() },
            },
            vertexShader: vertex,
            fragmentShader: fragment
        });

        this.geometry = new THREE.SphereBufferGeometry(1,40,40);
        this.perlin = new THREE.Mesh(this.geometry, this.materialPerlin);
        this.scene1.add(this.perlin);
    }

    addObjects() {
        this.material = new THREE.ShaderMaterial({
            extensions: {
                derivatives: "#extension GL_OES_standard_derivatives : enable"
            },
            side: THREE.DoubleSide,
            uniforms: {
                time: { value: 0 },
                uPerlinCube: { value: null },
                resolution: { value: new THREE.Vector4() },
            },
            vertexShader: vertexSun,
            fragmentShader: fragmentSun
        });

        this.geometry = new THREE.SphereBufferGeometry(1,40,40);
        this.plane = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.plane);
    }

    addAround(){
        this.materialAround = new THREE.ShaderMaterial({
            extensions: {
                derivatives: "#extension GL_OES_standard_derivatives : enable"
            },
            uniforms: {
                time: { value: 0 },
                uPerlinCube: { value: null },
                resolution: { value: new THREE.Vector4() },
            },
            transparent: true,
            side: THREE.BackSide,
            vertexShader: vertexSunAround,
            fragmentShader: fragmentSunAround
        });

        this.geometry = new THREE.SphereBufferGeometry(1.2,40,40);
        this.around = new THREE.Mesh(this.geometry, this.materialAround);
        // this.around = new THREE.Mesh(this.geometry, new THREE.MeshBasicMaterial({color:0xff0000,side: THREE.BackSide,}));
        this.scene.add(this.around);
    }

    stop() {
        this.isPlaying = false;
    }

    play() {
        if(!this.isPlaying){
            this.render()
            this.isPlaying = true;
        }
    }








    //------------------------------------------------------------------------------------------------------------------

    render() {

        return(
            <div onResize={this.onWindowResize} ref={ref => (this.mount = ref)}>
            </div>

        );
    }
}

export default Scene