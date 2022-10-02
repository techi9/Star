import THREE from "three";
import sunFragment from "../../starShaders/sunFragmentBlue.glsl";
import sunVertex from "../../starShaders/sunVertex.glsl";




let uniforms, mesh;
init();


function init() {

    uniforms = {
        time: 	{ type: "f", value: 1.0 },
        scale: 	{ type: "f", value: 1.5 }
    };
    let material = new THREE.ShaderMaterial( {
        uniforms: uniforms,
        vertexShader: sunVertex,
        fragmentShader: sunFragment
    } );
    let size = 0.75;
    mesh = new THREE.Mesh( new THREE.SphereGeometry( size, 64, 32 ), material );
    scene.add( mesh );
}


let oldTime = new Date().getTime();
let time = 0


function render() {
    let time = new Date().getTime();
    let delta = 0.001 * ( time - oldTime );
    oldTime = time;
    uniforms.time.value += 0.275 * delta;
    mesh.rotation.y += 0.5 * delta;
    mesh.rotation.x += 0.1 * delta;


}