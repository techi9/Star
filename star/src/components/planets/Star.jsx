import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import fragment from "../../public/planet/shader/fragment.glsl";
import fragmentSun from "../../../public/planet/sun/fragment.glsl";
import fragmentSunAround from "../../../public/planet/sunAround/fragment.glsl";
import fragmentTube from "../../../public/planet/tube/fragment.glsl";
import vertex from "../../../public/planet/shader/vertex.glsl";
import vertexSun from "../../../public/planet/sun/vertex.glsl";
import vertexSunAround from "../../../public/planet/sunAround/vertex.glsl";
import vertexTube from "../../../public/planet/tube/vertex.glsl";
import * as dat from "dat.gui";
import gsap from "gsap";


export default class Star {
    // scene
    constructor(options) {
        this.scene = options.scene;

        this.getCube();
        this.addObjects();
        this.addAround();
        this.addTubes()
    }

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


}
