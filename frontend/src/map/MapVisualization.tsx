import React, {useEffect, useRef, useState} from 'react';
import mapboxgl from 'mapbox-gl';

import {MAP_BOX_TOKEN} from "./MapBoxToken.tsx";

import line1 from '../assets/line 1.png';
import line2 from '../assets/line 2.png';
import line3 from '../assets/line 3.png';

import {SearchBox} from '@mapbox/search-js-react';
import '../App.css';

import * as THREE from "three";

const DEMO_FILES = [
    [[20, 10], line1],
    [[200, 0], line2],
    [[390, 25], line3]
] as const;
const size = 10;

export const MapComponent: React.FC<{setSidebar: React.Dispatch<boolean>}> = ({setSidebar}) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const scene = useRef<THREE.Scene>(new THREE.Scene()).current;
    useEffect(() => {
        if (mapContainerRef.current && !map.current) {
            mapboxgl.accessToken = MAP_BOX_TOKEN;
            // Create the map instance
            map.current = new mapboxgl.Map({
                container: mapContainerRef.current,
                
                style: 'mapbox://styles/muhammedhab/cm7nnypj101co01qv542d0e4b', // Map style
                center: [-91.180421, 30.417421], // Initial map center [lng, lat]
                zoom: 1, // Initial zoom level
                projection: 'globe'
            });

            const modelOrigin: [number, number] = [-91.180421, 30.417421];
            const modelAltitude = 0;
            const modelRotation: [number, number, number] = [0, 0, 0];

            const modelCoords = mapboxgl.MercatorCoordinate.fromLngLat(modelOrigin, modelAltitude);

            const modelTransform = {
                translateX: modelCoords.x,
                translateY: modelCoords.y,
                translateZ: modelCoords.z,
                rotateX: modelRotation[0],
                rotateY: modelRotation[1],
                rotateZ: modelRotation[2],
                /* Since the 3D model is in real world meters, a scale transform needs to be
                 * applied since the CustomLayerInterface expects units in MercatorCoordinates.
                 */
                scale: modelCoords.meterInMercatorCoordinateUnits()
            };


            // 1 30.418720467918135, -91.17671024308265
            // 2 30.41912175488056, -91.17688913839325
            // 3 30.41968133054108, -91.17716437241761

            const camera = new THREE.PerspectiveCamera(
                75, map.current!.getCanvas().getBoundingClientRect().width / map.current!.getCanvas().getBoundingClientRect().height, 0.1, 1000
            );
            let renderer: THREE.WebGLRenderer;

            const customLayer = {
                id: '3d-model',
                type: 'custom',
                renderingMode: '3d',
                onAdd: function (map, gl) {
                    // create two three.js lights to illuminate the model
                    // const directionalLight = new THREE.DirectionalLight(0xffffff);
                    // directionalLight.position.set(0, -70, 100).normalize();
                    // this.scene.add(directionalLight);

                    // const directionalLight2 = new THREE.DirectionalLight(0xffffff);
                    // directionalLight2.position.set(0, 70, 100).normalize();
                    // this.scene.add(directionalLight2);

                    // use the three.js GLTF loader to add the 3D model to the three.js scene

                    for (const file of DEMO_FILES) {
                        const boxGeometry = new THREE.BoxGeometry(size, 1, size*2);
                        boxGeometry.translate(file[0][0], file[0][1], size);

                        // Create a texture loader and load the test asset
                        const textureLoader = new THREE.TextureLoader();
                        const boxTexture = textureLoader.load(file[1]);

                        // Update the box material to use the loaded texture
                        const boxMaterial = new THREE.MeshStandardMaterial({map: boxTexture});
                        const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
                        scene.add(boxMesh);
                    }

                    // Create an ambient light and add it to the scene
                    const ambientLight = new THREE.AmbientLight(0xffffff, 2); // Soft white light
                    scene.add(ambientLight);

                    // use the Mapbox GL JS map canvas for three.js
                    renderer = new THREE.WebGLRenderer({
                        canvas: map.getCanvas(),
                        context: gl,
                        antialias: true
                    });

                    renderer.autoClear = false;
                },
                render: function (gl, matrix) {
                    const rotationX = new THREE.Matrix4().makeRotationAxis(
                        new THREE.Vector3(1, 0, 0),
                        modelTransform.rotateX//map.current!.getPitch() * Math.PI / 180 + Math.PI / 2
                    );
                    const rotationY = new THREE.Matrix4().makeRotationAxis(
                        new THREE.Vector3(0, 1, 0),
                        modelTransform.rotateY
                    );
                    const rotationZ = new THREE.Matrix4().makeRotationAxis(
                        new THREE.Vector3(0, 0, 1),
                        modelTransform.rotateZ
                    );

                    for (let i = 0; i < DEMO_FILES.length; i++) {

                        const child = scene.children[i];

                        child.translateX(DEMO_FILES[i][0][0]);
                        child.translateY(DEMO_FILES[i][0][1]);
                        child.rotation.z = -map.current!.getBearing() * Math.PI / 180;
                        child.translateX(-DEMO_FILES[i][0][0]);
                        child.translateY(-DEMO_FILES[i][0][1]);
                    }

                    const m = new THREE.Matrix4().fromArray(matrix);
                    const l = new THREE.Matrix4()
                        .makeTranslation(
                            modelTransform.translateX,
                            modelTransform.translateY,
                            modelTransform.translateZ
                        )
                        .scale(
                            new THREE.Vector3(
                                modelTransform.scale,
                                -modelTransform.scale,
                                modelTransform.scale
                            )
                        )
                        .multiply(rotationZ)
                        .multiply(rotationX)
                        .multiply(rotationY);

                    camera.projectionMatrix = m.multiply(l);
                    renderer.resetState();
                    renderer.render(scene, camera);
                    map.current!.triggerRepaint();


                }
            } as const;

            map.current.on('style.load', () => {
                map.current!.addLayer(customLayer);
            });
        }

        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []);

    const [hasStarted, setHasStarted] = React.useState(false);

    const handleDivClick = () => {
        if (map.current && !hasStarted) {
            map.current.flyTo({
                zoom: 17,
                center: [-91.180421, 30.417421], // Ensure it keeps the same center
                essential: true, // Makes the transition smooth,
                pitch: 76,
                bearing: 76
            });
            setHasStarted(true);
        }
    };

    const [checked, setCheckedVal] = useState(false);
    function setChecked(val: boolean) {
        setCheckedVal(val);
        scene.clear();
        if (val) {
            // satellite
            map.current!.setStyle('mapbox://styles/muhammedhab/cm7mnq14w00gg01qph2dn4dxw');
        } else {
            // street
            map.current!.setStyle('mapbox://styles/muhammedhab/cm7nnypj101co01qv542d0e4b');
        }
    }

    return (
        <div
            onClick={handleDivClick}
            style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                cursor: !hasStarted ? 'pointer' : 'unset'
            }}
        >
            <div ref={mapContainerRef} style={{height: '100%'}} onClick={() => setSidebar(true)} />
            <div style={{position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', width: 'min(90%, 400px)'}}>
                <SearchBox
                    accessToken={MAP_BOX_TOKEN}
                    map={map.current}
                    mapboxgl={mapboxgl}
                    theme={{
                        cssText: `
                        div[class*=SuggestionName] {text-align: left;}`
                    }}
                    options={
                    // {bbox: [[-73.9876, 40.7661], [-73.9397, 40.8002]]}
                    {bbox: [[-94.644180, 28.950895], [-88.713677, 33.075476]]}
                    }
                    marker={true}
                />
            </div>
            <div style={{position: 'absolute', bottom: 20, right: 20, display: "flex", padding: '5px 10px', background: 'white', borderRadius: 10, placeItems: 'center', gap: 10}}>
                <span>Streets</span>
                <input type={"checkbox"} className="toggle" checked={checked} onChange={ev=>setChecked(ev.target.checked)} />
                <span>Satellite</span>
            </div>
            {!hasStarted && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1,
                        fontSize: '24px',
                        fontWeight: 'bold'
                    }}
                >
                    Click to Begin
                </div>
            )}
        </div>
    );
};