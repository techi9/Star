import * as THREE from "https://cdn.skypack.dev/three@0.124.0";
import ky from "https://cdn.skypack.dev/kyouka@1.2.2";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.124.0/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.124.0/examples/jsm/loaders/GLTFLoader";
import { FBXLoader } from "https://cdn.skypack.dev/three@0.124.0/examples/jsm/loaders/FBXLoader";
import { EffectComposer } from "https://cdn.skypack.dev/three@0.124.0/examples/jsm/postprocessing/EffectComposer";
import Stats from "https://cdn.skypack.dev/three@0.124.0/examples/jsm/libs/stats.module";
import * as dat from "https://cdn.skypack.dev/dat.gui@0.7.7";

const calcAspect = (el: HTMLElement) => el.clientWidth / el.clientHeight;

const getNormalizedMousePos = (e: MouseEvent | Touch) => {
    return {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
    };
};

const templateVertexShader = `
varying vec2 vUv;

void main(){
    vec4 modelPosition=modelMatrix*vec4(position,1.);
    vec4 viewPosition=viewMatrix*modelPosition;
    vec4 projectedPosition=projectionMatrix*viewPosition;
    gl_Position=projectedPosition;
    
    vUv=uv;
}
`;

const templateFragmentShader = `
uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;

varying vec2 vUv;

void main(){
    vec3 color=vec3(vUv.x,vUv.y,1.);
    gl_FragColor=vec4(color,1.);
}
`;

const sunNoiseVertexShader = `
#define GLSLIFY 1
varying vec2 vUv;
varying vec3 vPosition;

void main(){
    vec4 modelPosition=modelMatrix*vec4(position,1.);
    vec4 viewPosition=viewMatrix*modelPosition;
    vec4 projectedPosition=projectionMatrix*viewPosition;
    gl_Position=projectedPosition;
    
    vUv=uv;
    vPosition=position;
}
`;

const sunNoiseFragmentShader = `
#define GLSLIFY 1
//
// Description : Array and textureless GLSL 2D/3D/4D simplex
//               noise functions.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : ijm
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0; }

float mod289(float x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0; }

vec4 permute(vec4 x) {
     return mod289(((x*34.0)+1.0)*x);
}

float permute(float x) {
     return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

float taylorInvSqrt(float r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec4 grad4(float j, vec4 ip)
  {
  const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
  vec4 p,s;

  p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
  p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
  s = vec4(lessThan(p, vec4(0.0)));
  p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www;

  return p;
  }

// (sqrt(5) - 1)/4 = F4, used once below
#define F4 0.309016994374947451

float snoise(vec4 v)
  {
  const vec4  C = vec4( 0.138196601125011,  // (5 - sqrt(5))/20  G4
                        0.276393202250021,  // 2 * G4
                        0.414589803375032,  // 3 * G4
                       -0.447213595499958); // -1 + 4 * G4

// First corner
  vec4 i  = floor(v + dot(v, vec4(F4)) );
  vec4 x0 = v -   i + dot(i, C.xxxx);

// Other corners

// Rank sorting originally contributed by Bill Licea-Kane, AMD (formerly ATI)
  vec4 i0;
  vec3 isX = step( x0.yzw, x0.xxx );
  vec3 isYZ = step( x0.zww, x0.yyz );
//  i0.x = dot( isX, vec3( 1.0 ) );
  i0.x = isX.x + isX.y + isX.z;
  i0.yzw = 1.0 - isX;
//  i0.y += dot( isYZ.xy, vec2( 1.0 ) );
  i0.y += isYZ.x + isYZ.y;
  i0.zw += 1.0 - isYZ.xy;
  i0.z += isYZ.z;
  i0.w += 1.0 - isYZ.z;

  // i0 now contains the unique values 0,1,2,3 in each channel
  vec4 i3 = clamp( i0, 0.0, 1.0 );
  vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );
  vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );

  //  x0 = x0 - 0.0 + 0.0 * C.xxxx
  //  x1 = x0 - i1  + 1.0 * C.xxxx
  //  x2 = x0 - i2  + 2.0 * C.xxxx
  //  x3 = x0 - i3  + 3.0 * C.xxxx
  //  x4 = x0 - 1.0 + 4.0 * C.xxxx
  vec4 x1 = x0 - i1 + C.xxxx;
  vec4 x2 = x0 - i2 + C.yyyy;
  vec4 x3 = x0 - i3 + C.zzzz;
  vec4 x4 = x0 + C.wwww;

// Permutations
  i = mod289(i);
  float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);
  vec4 j1 = permute( permute( permute( permute (
             i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))
           + i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))
           + i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))
           + i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));

// Gradients: 7x7x6 points over a cube, mapped onto a 4-cross polytope
// 7*7*6 = 294, which is close to the ring size 17*17 = 289.
  vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;

  vec4 p0 = grad4(j0,   ip);
  vec4 p1 = grad4(j1.x, ip);
  vec4 p2 = grad4(j1.y, ip);
  vec4 p3 = grad4(j1.z, ip);
  vec4 p4 = grad4(j1.w, ip);

// Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  p4 *= taylorInvSqrt(dot(p4,p4));

// Mix contributions from the five corners
  vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);
  vec2 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4)            ), 0.0);
  m0 = m0 * m0;
  m1 = m1 * m1;
  return 49.0 * ( dot(m0*m0, vec3( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 )))
               + dot(m1*m1, vec2( dot( p3, x3 ), dot( p4, x4 ) ) ) ) ;

  }

#define OCTAVES 6

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;

varying vec2 vUv;
varying vec3 vPosition;

float fbm4d(vec4 p){
    float sum=0.;
    float amp=1.;
    float scale=1.;
    for(int i=0;i<OCTAVES;i++){
        sum+=snoise(p*scale)*amp;
        p.w+=100.;
        amp*=.9;
        scale*=2.;
    }
    return sum;
}

void main(){
    vec4 p=vec4(vPosition*4.,uTime*.025);
    float noise=fbm4d(p);
    vec4 p1=vec4(vPosition*2.,uTime*.25);
    float spot=max(snoise(p1),0.);
    vec4 color=vec4(noise);
    color*=mix(1.,spot,.7);
    gl_FragColor=color;
}
`;

const sunShapeVertexShader = `
#define GLSLIFY 1
mat2 rotation2d(float angle) {
	float s = sin(angle);
	float c = cos(angle);

	return mat2(
		c, -s,
		s, c
	);
}

mat4 rotation3d(vec3 axis, float angle) {
  axis = normalize(axis);
  float s = sin(angle);
  float c = cos(angle);
  float oc = 1.0 - c;

  return mat4(
		oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
    oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
    oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
		0.0,                                0.0,                                0.0,                                1.0
	);
}

vec2 rotate(vec2 v, float angle) {
	return rotation2d(angle) * v;
}

vec3 rotate(vec3 v, vec3 axis, float angle) {
	return (rotation3d(axis, angle) * vec4(v, 1.0)).xyz;
}

// https://tympanus.net/codrops/2019/10/29/real-time-multiside-refraction-in-three-steps/
vec3 getEyeVector(mat4 modelMat,vec3 pos,vec3 camPos){
    vec4 worldPosition=modelMat*vec4(pos,1.);
    vec3 eyeVector=normalize(worldPosition.xyz-camPos);
    return eyeVector;
}

const float HALF_PI=1.570796327;

uniform float uTime;
uniform float uVelocity;
uniform float uStagger;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vLayer1;
varying vec3 vLayer2;
varying vec3 vLayer3;
varying vec3 vNormal;
varying vec3 vEyeVector;

void main(){
    vec4 modelPosition=modelMatrix*vec4(position,1.);
    vec4 viewPosition=viewMatrix*modelPosition;
    vec4 projectedPosition=projectionMatrix*viewPosition;
    gl_Position=projectedPosition;
    
    vec3 pos=position;
    float displacement1=uVelocity*uTime;
    float displacement2=uVelocity*(uTime*1.5+uStagger*1.);
    float displacement3=uVelocity*(uTime*2.+uStagger*2.);
    vec3 xy=vec3(1.,1.,0.);
    vec3 xz=vec3(1.,0.,1.);
    vec3 yz=vec3(0.,1.,1.);
    vec3 layer1=rotate(pos,xy,displacement1);
    vec3 layer2=rotate(pos,xz,displacement2);
    vec3 layer3=rotate(pos,yz,displacement3);
    
    vUv=uv;
    vPosition=position;
    vLayer1=layer1;
    vLayer2=layer2;
    vLayer3=layer3;
    vNormal=normal;
    vEyeVector=getEyeVector(modelMatrix,position,cameraPosition);
}
`;

const sunShapeFragmentShader = `
#define GLSLIFY 1
// https://www.shadertoy.com/view/4scSW4
float fresnel(float bias,float scale,float power,vec3 I,vec3 N)
{
    return bias+scale*pow(1.+dot(I,N),power);
}

// https://www.shadertoy.com/view/XlSSzK
vec3 firePalette(float i){
    float T=1400.+1300.*i;// Temperature range (in Kelvin).
    vec3 L=vec3(7.4,5.6,4.4);// Red, green, blue wavelengths (in hundreds of nanometers).
    L=pow(L,vec3(5.))*(exp(1.43876719683e5/(T*L))-1.);
    return 1.-exp(-5e8/L);// Exposure level. Set to "50." For "70," change the "5" to a "7," etc.
}

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform samplerCube uNoiseTexture;
uniform float uBrightness;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vLayer1;
varying vec3 vLayer2;
varying vec3 vLayer3;
varying vec3 vNormal;
varying vec3 vEyeVector;

float layerSum(){
    float sum=0.;
    sum+=textureCube(uNoiseTexture,vLayer1).r;
    sum+=textureCube(uNoiseTexture,vLayer2).r;
    sum+=textureCube(uNoiseTexture,vLayer3).r;
    sum*=uBrightness;
    return sum;
}

void main(){
    float brightness=layerSum();
    brightness=4.*brightness+1.;
    float F=fresnel(0.,1.,2.,vEyeVector,vNormal);
    brightness+=F;
    brightness*=.5;
    vec4 color=vec4(firePalette(brightness),1.);
    gl_FragColor=color;
}
`;

const sunRingVertexShader = `
#define GLSLIFY 1
varying vec2 vUv;
varying vec3 vPosition;

void main(){
    vec4 modelPosition=modelMatrix*vec4(position,1.);
    vec4 viewPosition=viewMatrix*modelPosition;
    vec4 projectedPosition=projectionMatrix*viewPosition;
    gl_Position=projectedPosition;
    
    vUv=uv;
    vPosition=position;
}
`;

const sunRingFragmentShader = `
#define GLSLIFY 1

float invert(float n){
    return 1.-n;
}

vec3 invert(vec3 n){
    return 1.-n;
}

// https://www.shadertoy.com/view/XlSSzK
vec3 firePalette(float i){
    float T=1400.+1300.*i;// Temperature range (in Kelvin).
    vec3 L=vec3(7.4,5.6,4.4);// Red, green, blue wavelengths (in hundreds of nanometers).
    L=pow(L,vec3(5.))*(exp(1.43876719683e5/(T*L))-1.);
    return 1.-exp(-5e8/L);// Exposure level. Set to "50." For "70," change the "5" to a "7," etc.
}

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;

varying vec2 vUv;
varying vec3 vPosition;

void main(){
    float radial=invert(vPosition.z);
    radial=pow(radial,3.);
    float brightness=(1.+radial*.83)*radial*.4;
    vec3 ringColor=firePalette(brightness);
    vec4 color=vec4(ringColor,radial);
    gl_FragColor=color;
}
`;

class Base {
    debug: boolean;
    container: HTMLElement | null;
    scene!: THREE.Scene;
    camera!: THREE.PerspectiveCamera | THREE.OrthographicCamera;
    rendererParams!: Record<string, any>;
    perspectiveCameraParams!: Record<string, any>;
    orthographicCameraParams!: Record<string, any>;
    cameraPosition!: THREE.Vector3;
    lookAtPosition!: THREE.Vector3;
    renderer!: THREE.WebGLRenderer;
    controls!: OrbitControls;
    mousePos!: THREE.Vector2;
    raycaster!: THREE.Raycaster;
    sound!: THREE.Audio;
    stats!: Stats;
    composer!: EffectComposer;
    constructor(sel: string, debug = false) {
        this.debug = debug;
        this.container = document.querySelector(sel);
        this.perspectiveCameraParams = {
            fov: 75,
            near: 0.1,
            far: 100
        };
        this.orthographicCameraParams = {
            zoom: 2,
            near: -100,
            far: 1000
        };
        this.cameraPosition = new THREE.Vector3(0, 3, 10);
        this.lookAtPosition = new THREE.Vector3(0, 0, 0);
        this.rendererParams = {
            outputEncoding: THREE.LinearEncoding,
            config: {
                alpha: true,
                antialias: true
            }
        };
        this.mousePos = new THREE.Vector2(0, 0);
    }
    // 初始化
    init() {
        this.createScene();
        this.createPerspectiveCamera();
        this.createRenderer();
        this.createMesh({});
        this.createLight();
        this.createOrbitControls();
        this.addListeners();
        this.setLoop();
    }
    // 创建场景
    createScene() {
        const scene = new THREE.Scene();
        if (this.debug) {
            scene.add(new THREE.AxesHelper());
            const stats = Stats();
            this.container!.appendChild(stats.dom);
            this.stats = stats;
        }
        this.scene = scene;
    }
    // 创建透视相机
    createPerspectiveCamera() {
        const { perspectiveCameraParams, cameraPosition, lookAtPosition } = this;
        const { fov, near, far } = perspectiveCameraParams;
        const aspect = calcAspect(this.container!);
        const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        camera.position.copy(cameraPosition);
        camera.lookAt(lookAtPosition);
        this.camera = camera;
    }
    // 创建正交相机
    createOrthographicCamera() {
        const { orthographicCameraParams, cameraPosition, lookAtPosition } = this;
        const { left, right, top, bottom, near, far } = orthographicCameraParams;
        const camera = new THREE.OrthographicCamera(
            left,
            right,
            top,
            bottom,
            near,
            far
        );
        camera.position.copy(cameraPosition);
        camera.lookAt(lookAtPosition);
        this.camera = camera;
    }
    // 更新正交相机参数
    updateOrthographicCameraParams() {
        const { container } = this;
        const { zoom, near, far } = this.orthographicCameraParams;
        const aspect = calcAspect(container!);
        this.orthographicCameraParams = {
            left: -zoom * aspect,
            right: zoom * aspect,
            top: zoom,
            bottom: -zoom,
            near,
            far,
            zoom
        };
    }
    // 创建渲染
    createRenderer(useWebGL1 = false) {
        const { rendererParams } = this;
        const { outputEncoding, config } = rendererParams;
        const renderer = !useWebGL1
            ? new THREE.WebGLRenderer(config)
            : new THREE.WebGL1Renderer(config);
        renderer.setSize(this.container!.clientWidth, this.container!.clientHeight);
        renderer.outputEncoding = outputEncoding;
        this.resizeRendererToDisplaySize();
        this.container?.appendChild(renderer.domElement);
        this.renderer = renderer;
        this.renderer.setClearColor(0x000000, 0);
    }
    // 允许投影
    enableShadow() {
        this.renderer.shadowMap.enabled = true;
    }
    // 调整渲染器尺寸
    resizeRendererToDisplaySize() {
        const { renderer } = this;
        if (!renderer) {
            return;
        }
        const canvas = renderer.domElement;
        const pixelRatio = window.devicePixelRatio;
        const { clientWidth, clientHeight } = canvas;
        const width = (clientWidth * pixelRatio) | 0;
        const height = (clientHeight * pixelRatio) | 0;
        const isResizeNeeded = canvas.width !== width || canvas.height !== height;
        if (isResizeNeeded) {
            renderer.setSize(width, height, false);
        }
        return isResizeNeeded;
    }
    // 创建网格
    createMesh(
        meshObject: MeshObject,
        container: THREE.Scene | THREE.Mesh = this.scene
    ) {
        const {
            geometry = new THREE.BoxGeometry(1, 1, 1),
            material = new THREE.MeshStandardMaterial({
                color: new THREE.Color("#d9dfc8")
            }),
            position = new THREE.Vector3(0, 0, 0)
        } = meshObject;
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        container.add(mesh);
        return mesh;
    }
    // 创建光源
    createLight() {
        const dirLight = new THREE.DirectionalLight(
            new THREE.Color("#ffffff"),
            0.5
        );
        dirLight.position.set(0, 50, 0);
        this.scene.add(dirLight);
        const ambiLight = new THREE.AmbientLight(new THREE.Color("#ffffff"), 0.4);
        this.scene.add(ambiLight);
    }
    // 创建轨道控制
    createOrbitControls() {
        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        const { lookAtPosition } = this;
        controls.target.copy(lookAtPosition);
        controls.update();
        this.controls = controls;
    }
    // 监听事件
    addListeners() {
        this.onResize();
    }
    // 监听画面缩放
    onResize() {
        window.addEventListener("resize", (e) => {
            if (this.camera instanceof THREE.PerspectiveCamera) {
                const aspect = calcAspect(this.container!);
                const camera = this.camera as THREE.PerspectiveCamera;
                camera.aspect = aspect;
                camera.updateProjectionMatrix();
            } else if (this.camera instanceof THREE.OrthographicCamera) {
                this.updateOrthographicCameraParams();
                const camera = this.camera as THREE.OrthographicCamera;
                const {
                    left,
                    right,
                    top,
                    bottom,
                    near,
                    far
                } = this.orthographicCameraParams;
                camera.left = left;
                camera.right = right;
                camera.top = top;
                camera.bottom = bottom;
                camera.near = near;
                camera.far = far;
                camera.updateProjectionMatrix();
            }
            this.renderer.setSize(
                this.container!.clientWidth,
                this.container!.clientHeight
            );
        });
    }
    // 动画
    update() {
        console.log("animation");
    }
    // 渲染
    setLoop() {
        this.renderer.setAnimationLoop(() => {
            this.resizeRendererToDisplaySize();
            this.update();
            if (this.controls) {
                this.controls.update();
            }
            if (this.stats) {
                this.stats.update();
            }
            if (this.composer) {
                this.composer.render();
            } else {
                this.renderer.render(this.scene, this.camera);
            }
        });
    }
    // 创建文本
    createText(
        text = "",
        config: THREE.TextGeometryParameters,
        material: THREE.Material = new THREE.MeshStandardMaterial({
            color: "#ffffff"
        })
    ) {
        const geo = new THREE.TextGeometry(text, config);
        const mesh = new THREE.Mesh(geo, material);
        return mesh;
    }
    // 创建音效源
    createAudioSource() {
        const listener = new THREE.AudioListener();
        this.camera.add(listener);
        const sound = new THREE.Audio(listener);
        this.sound = sound;
    }
    // 加载音效
    loadAudio(url: string): Promise<AudioBuffer> {
        const loader = new THREE.AudioLoader();
        return new Promise((resolve) => {
            loader.load(url, (buffer) => {
                this.sound.setBuffer(buffer);
                resolve(buffer);
            });
        });
    }
    // 加载模型
    loadModel(url: string): Promise<THREE.Object3D> {
        const loader = new GLTFLoader();
        return new Promise((resolve, reject) => {
            loader.load(
                url,
                (gltf) => {
                    const model = gltf.scene;
                    resolve(model);
                },
                undefined,
                (err) => {
                    console.log(err);
                    reject();
                }
            );
        });
    }
    // 加载FBX模型
    loadFBXModel(url: string): Promise<THREE.Object3D> {
        const loader = new FBXLoader();
        return new Promise((resolve, reject) => {
            loader.load(
                url,
                (obj) => {
                    resolve(obj);
                },
                undefined,
                (err) => {
                    console.log(err);
                    reject();
                }
            );
        });
    }
    // 加载字体
    loadFont(url: string): Promise<THREE.Font> {
        const loader = new THREE.FontLoader();
        return new Promise((resolve) => {
            loader.load(url, (font) => {
                resolve(font);
            });
        });
    }
    // 创建点选模型
    createRaycaster() {
        this.raycaster = new THREE.Raycaster();
        this.trackMousePos();
    }
    // 追踪鼠标位置
    trackMousePos() {
        window.addEventListener("mousemove", (e) => {
            this.setMousePos(e);
        });
        window.addEventListener("mouseout", () => {
            this.clearMousePos();
        });
        window.addEventListener("mouseleave", () => {
            this.clearMousePos();
        });
        window.addEventListener(
            "touchstart",
            (e: TouchEvent) => {
                this.setMousePos(e.touches[0]);
            },
            { passive: false }
        );
        window.addEventListener("touchmove", (e: TouchEvent) => {
            this.setMousePos(e.touches[0]);
        });
        window.addEventListener("touchend", () => {
            this.clearMousePos();
        });
    }
    // 设置鼠标位置
    setMousePos(e: MouseEvent | Touch) {
        const { x, y } = getNormalizedMousePos(e);
        this.mousePos.x = x;
        this.mousePos.y = y;
    }
    // 清空鼠标位置
    clearMousePos() {
        this.mousePos.x = -100000;
        this.mousePos.y = -100000;
    }
    // 获取点击物
    getInterSects(): THREE.Intersection[] {
        this.raycaster.setFromCamera(this.mousePos, this.camera);
        const intersects = this.raycaster.intersectObjects(
            this.scene.children,
            true
        );
        return intersects;
    }
    // 选中点击物时
    onChooseIntersect(target: THREE.Object3D) {
        const intersects = this.getInterSects();
        const intersect = intersects[0];
        if (!intersect || !intersect.face) {
            return null;
        }
        const { object } = intersect;
        return target === object ? intersect : null;
    }
}

class Sun extends Base {
    clock!: THREE.Clock;
    sunNoiseMaterial!: THREE.ShaderMaterial;
    sunShapeMaterial!: THREE.ShaderMaterial;
    sunRingMaterial!: THREE.ShaderMaterial;
    cubeRt!: THREE.WebGLCubeRenderTarget;
    cubeCamera!: THREE.CubeCamera;
    cubeScene!: THREE.Scene;
    constructor(sel: string, debug: boolean) {
        super(sel, debug);
        this.clock = new THREE.Clock();
        this.cameraPosition = new THREE.Vector3(0, 0, 2);
    }
    // 初始化
    init() {
        this.createScene();
        this.createPerspectiveCamera();
        this.createRenderer();
        this.createSunNoiseMaterial();
        this.createCubeRt();
        this.createSunShapeMaterial();
        this.createSun();
        this.createSunRingMaterial();
        this.createSunRing();
        this.createLight();
        this.trackMousePos();
        this.createOrbitControls();
        this.addListeners();
        this.setLoop();
    }
    // 创建噪声材质
    createSunNoiseMaterial() {
        const sunNoiseMaterial = new THREE.ShaderMaterial({
            vertexShader: sunNoiseVertexShader,
            fragmentShader: sunNoiseFragmentShader,
            side: THREE.DoubleSide,
            uniforms: {
                uTime: {
                    value: 0
                },
                uMouse: {
                    value: new THREE.Vector2(0, 0)
                },
                uResolution: {
                    value: new THREE.Vector2(window.innerWidth, window.innerHeight)
                }
            }
        });
        this.sunNoiseMaterial = sunNoiseMaterial;
    }
    // 创建立方体离屏渲染目标，将其作为太阳本体的噪声贴图
    createCubeRt() {
        const cubeRt = new THREE.WebGLCubeRenderTarget(256);
        this.cubeRt = cubeRt;
        const cubeCamera = new THREE.CubeCamera(0.1, 10, cubeRt);
        this.cubeCamera = cubeCamera;
        const cubeScene = new THREE.Scene();
        const geometry = new THREE.SphereBufferGeometry(1, 100, 100);
        const material = this.sunNoiseMaterial;
        this.createMesh(
            {
                geometry,
                material
            },
            cubeScene
        );
        this.cubeScene = cubeScene;
    }
    // 创建太阳本体材质
    createSunShapeMaterial() {
        const sunShapeMaterial = new THREE.ShaderMaterial({
            vertexShader: sunShapeVertexShader,
            fragmentShader: sunShapeFragmentShader,
            side: THREE.DoubleSide,
            uniforms: {
                uTime: {
                    value: 0
                },
                uMouse: {
                    value: new THREE.Vector2(0, 0)
                },
                uResolution: {
                    value: new THREE.Vector2(window.innerWidth, window.innerHeight)
                },
                uNoiseTexture: {
                    value: null
                },
                uVelocity: {
                    value: 0.05
                },
                uBrightness: {
                    value: 0.33
                },
                uStagger: {
                    value: 16
                }
            }
        });
        this.sunShapeMaterial = sunShapeMaterial;
    }
    // 创建太阳
    createSun() {
        const geometry = new THREE.SphereBufferGeometry(1, 100, 100);
        const material = this.sunShapeMaterial;
        this.createMesh({
            geometry,
            material
        });
    }
    // 创建太阳环材质
    createSunRingMaterial() {
        const sunRingMaterial = new THREE.ShaderMaterial({
            vertexShader: sunRingVertexShader,
            fragmentShader: sunRingFragmentShader,
            side: THREE.BackSide,
            uniforms: {
                uTime: {
                    value: 0
                },
                uMouse: {
                    value: new THREE.Vector2(0, 0)
                },
                uResolution: {
                    value: new THREE.Vector2(window.innerWidth, window.innerHeight)
                }
            }
        });
        this.sunRingMaterial = sunRingMaterial;
    }
    // 创建太阳环
    createSunRing() {
        const geometry = new THREE.SphereBufferGeometry(1.2, 100, 100);
        const material = this.sunRingMaterial;
        this.createMesh({
            geometry,
            material
        });
    }
    // 动画
    update() {
        const elapsedTime = this.clock.getElapsedTime();
        const mousePos = this.mousePos;
        if (this.sunNoiseMaterial && this.sunShapeMaterial) {
            this.cubeCamera.update(this.renderer, this.cubeScene);
            this.sunNoiseMaterial.uniforms.uTime.value = elapsedTime;
            this.sunNoiseMaterial.uniforms.uMouse.value = mousePos;
            this.sunShapeMaterial.uniforms.uTime.value = elapsedTime;
            this.sunShapeMaterial.uniforms.uMouse.value = mousePos;
            this.sunShapeMaterial.uniforms.uNoiseTexture.value = this.cubeRt.texture;
            this.sunRingMaterial.uniforms.uTime.value = elapsedTime;
            this.sunRingMaterial.uniforms.uMouse.value = mousePos;
        }
    }
}

const start = () => {
    const sun = new Sun(".sun", false);
    sun.init();
};

start();
