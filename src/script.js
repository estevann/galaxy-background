import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import galaxyvertexShader from './shaders/galaxy.vs.glsl'
import galaxyFragmentShader from './shaders/galaxy.fs.glsl'
import { AxesHelper, ShaderMaterial } from 'three'

/**
 * Base
 */
// Debug
// const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Galaxy
 */
const parameters = {}
parameters.count = 48000
parameters.size = 0.005
parameters.radius = 2.5
parameters.branches = 2
parameters.spin = 1
parameters.randomness = 0.346
parameters.randomnessPower = 50
parameters.insideColor = '#4557FF'
parameters.outsideColor = '#0084ff'



let geometry = null
let material = null
let points = null

const generateGalaxy = () =>
{
    if(points !== null)
    {
        geometry.dispose()
        material.dispose()
        scene.remove(points)
    }

    /**
     * Geometry
     */
    geometry = new THREE.BufferGeometry()

    const positions = new Float32Array(parameters.count * 3)
    const colors = new Float32Array(parameters.count * 3)
    const scales = new Float32Array(parameters.count * 1)
    const randomness = new Float32Array(parameters.count * 3)

    const insideColor = new THREE.Color(parameters.insideColor)
    const outsideColor = new THREE.Color(parameters.outsideColor)

    for(let i = 0; i < parameters.count; i++)
    {
        const i3 = i * 3

        // Position
        const radius = Math.random() * parameters.radius

        const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2

        positions[i3    ] = Math.cos(branchAngle) * radius
        positions[i3 + 1] = 0
        positions[i3 + 2] = Math.sin(branchAngle) * radius

        // Randomness

        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius

        randomness[i3 + 0] = randomX    
        randomness[i3 + 1] = randomY
        randomness[i3 + 2] = randomZ    

        // Color
        const mixedColor = insideColor.clone()
        mixedColor.lerp(outsideColor, radius / parameters.radius)

        colors[i3    ] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b

        // Scales

        scales[i] = Math.random()
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('aScale', new THREE.BufferAttribute(colors, 1))
    geometry.setAttribute('aRandomness', new THREE.BufferAttribute(randomness, 3))

    /**
     * Material
     */
    material = new THREE.ShaderMaterial({
        vertexShader: galaxyvertexShader,
        fragmentShader: galaxyFragmentShader,
        uniforms: {
            uTime: {value: 0},
            uSize: {value: 30 * renderer.getPixelRatio() }
        },
        side: THREE.DoubleSide,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    })

    /**
     * Points
     */
    points = new THREE.Points(geometry, material)
    scene.add(points)
}


// gui.add(parameters, 'count').min(100).max(1000000).step(100).onFinishChange(generateGalaxy)
// gui.add(parameters, 'radius').min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy)
// gui.add(parameters, 'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy)
// gui.add(parameters, 'randomness').min(0).max(2).step(0.001).onFinishChange(generateGalaxy)
// gui.add(parameters, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(generateGalaxy)
// gui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy)
// gui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 0.2
camera.position.y = 14
camera.position.z = 11
scene.add(camera)

// gui.add(camera.position, 'x').min(0).max(15).step(1).name('cameraX')
// gui.add(camera.position, 'y').min(0).max(15).step(1).name('cameraY')
// gui.add(camera.position, 'z').min(0).max(15).step(1).name('cameraz')

// const axisHelper = new THREE.AxesHelper(3)
// scene.add(axisHelper)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, -12, 11)
controls.enabled = false


// gui.add(controls.target, 'x').min(-15).max(15).step(0.5).name('controlsX')
// gui.add(controls.target, 'y').min(-15).max(15).step(0.5).name('controlsY')
// gui.add(controls.target, 'z').min(-15).max(15).step(0.5).name('controlsZ')

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setClearColor('#060606')
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

//  Generate galaxy

generateGalaxy()



/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    //  Update material
    material.uniforms.uTime.value = elapsedTime 

    // Update controls
    controls.update()



    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}


tick()