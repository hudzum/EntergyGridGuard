import React, {useEffect, useRef} from "react";
import * as THREE from "three";
import mapboxgl from "mapbox-gl";
import {MAP_BOX_TOKEN} from "@/map/MapBoxToken.tsx";
import {Pole} from "@/components/tableFilterComps/columns.tsx";
import {SearchBox} from "@mapbox/search-js-react";

export type PoleWithLocation = Pole & {
	longitude: number,
	latitude: number,
}

const MODEL_SIZE = 10;

function createArrowMesh() {
	const arrowHeadGeometry = new THREE.ConeGeometry(MODEL_SIZE * 3, MODEL_SIZE * 6, 32);
	arrowHeadGeometry.rotateX(-Math.PI / 2);
	arrowHeadGeometry.translate(0, 0, MODEL_SIZE * 6);
	const arrowHeadMaterial = new THREE.MeshBasicMaterial({ color: 'orange' });
	const arrowHeadMesh = new THREE.Mesh(arrowHeadGeometry, arrowHeadMaterial);

	const arrowShaftGeometry = new THREE.CylinderGeometry(MODEL_SIZE * .8, MODEL_SIZE * .8, MODEL_SIZE * 12, 32);
	arrowShaftGeometry.rotateX(Math.PI / 2);
	arrowShaftGeometry.translate(0, 0, MODEL_SIZE * 14);
	const arrowShaftMaterial = new THREE.MeshBasicMaterial({ color: 'orange' });
	const arrowShaftMesh = new THREE.Mesh(arrowShaftGeometry, arrowShaftMaterial);

	// Group the components
	const arrowMesh = new THREE.Group();
	arrowMesh.add(arrowHeadMesh);
	arrowMesh.add(arrowShaftMesh);

	return arrowMesh;
}

function createNewScene(image: PoleWithLocation, map: mapboxgl.Map, renderer: THREE.WebGLRenderer, selectedImage?: {id?: number}): mapboxgl.LayerSpecification {
	const scene = new THREE.Scene();

	const modelCoords = mapboxgl.MercatorCoordinate.fromLngLat([image.longitude, image.latitude], 0);

	const modelTransform = {
		translateX: modelCoords.x,
		translateY: modelCoords.y,
		translateZ: modelCoords.z,
		rotateX: 0,
		rotateY: 0,
		rotateZ: 0,
		/* Since the 3D model is in real world meters, a scale transform needs to be
		 * applied since the CustomLayerInterface expects units in MercatorCoordinates.
		 */
		scale: modelCoords.meterInMercatorCoordinateUnits()
	};

	const camera = new THREE.PerspectiveCamera(
		75, map.getCanvas().getBoundingClientRect().width / map.getCanvas().getBoundingClientRect().height, 0.1, 1000
	);

	const poleGeometry = new THREE.BoxGeometry(MODEL_SIZE, 1, MODEL_SIZE*2);
	poleGeometry.translate(0, 0, MODEL_SIZE);

	// Create a texture loader and load the test asset
	const poleTexture = new THREE.TextureLoader().load(`data:image/jpg;base64,${image.thumbnail}`);

	// Update the box material to use the loaded texture
	const poleMesh = new THREE.Mesh(poleGeometry, new THREE.MeshStandardMaterial({map: poleTexture}));
	scene.add(poleMesh);

	const poleOutlineGeometry = new THREE.BoxGeometry(MODEL_SIZE * 1.1, 0.9, MODEL_SIZE*2.1);
	poleOutlineGeometry.translate(0, 0, MODEL_SIZE);
	const poleOutlineMaterial = new THREE.MeshBasicMaterial({color: Object.values(image.components).some(data => data.quantity > 0 && data.condition === 'bad') ? 'red' : 'green'});
	const poleOutlineMesh = new THREE.Mesh(poleOutlineGeometry, poleOutlineMaterial);
	scene.add(poleOutlineMesh);

	const imageArrow = createArrowMesh();

	// Create an ambient light and add it to the scene
	const ambientLight = new THREE.AmbientLight(0xffffff, 2); // Soft white light
	scene.add(ambientLight);

	return {
		id: `image-layer-for-${image.id}`,
		// @ts-expect-error too lazy to figure out type
		type: 'custom',
		renderingMode: '3d',
		onAdd: function (/*_map: mapboxgl.Map, _gl: WebGLRenderingContext*/) {
		},
		render: function (_gl: WebGLRenderingContext, matrix: ArrayLike<number>) {
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

			poleMesh.rotation.z = -map.getBearing() * Math.PI / 180;
			poleOutlineMesh.rotation.z = -map.getBearing() * Math.PI / 180;

			if (selectedImage?.id === image.id) {
				scene.add(imageArrow);
			} else {
				scene.remove(imageArrow);
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
			map.triggerRepaint();
		}
	};
}


export interface NewMapProps {
	images: PoleWithLocation[],
	style: 'street' | 'satellite',
	onClick?: (lat: number, lng: number) => void,
	highlightImageId?: number,
	initialPos: {center: [number, number], zoom: number, pitch: number, bearing: number},
	searchBar?: boolean,
}

export const NewMap: React.FC<NewMapProps> = props => {
	const mapContainerRef = useRef<HTMLDivElement>(null);
	const map = useRef<mapboxgl.Map | null>(null);
	const selectedImage = useRef<{id?: number}>({id: undefined}).current;

	useEffect(() => {
		selectedImage.id = props.highlightImageId;
	}, [props.highlightImageId]);

	const renderer = useRef<THREE.WebGLRenderer | undefined>(undefined);

	function addImagesToMap(images: PoleWithLocation[]) {
		for (const image of images) {
			const layer = createNewScene(image, map.current!, renderer.current!, selectedImage);
			map.current!.addLayer(layer);
		}
	}

	useEffect(() => {
		if (props.style === 'satellite') {
			// satellite
			map.current?.setStyle('mapbox://styles/muhammedhab/cm7mnq14w00gg01qph2dn4dxw');
		} else {
			// street
			map.current?.setStyle('mapbox://styles/muhammedhab/cm7nnypj101co01qv542d0e4b');
		}
	}, [props.style, map.current !== undefined]);

	useEffect(() => {
		map.current?.flyTo({
			...props.initialPos,
			essential: true, // Makes the transition smooth,
		});
	}, [props.initialPos]);

	useEffect(() => {
		if (mapContainerRef.current && !map.current) {
			mapboxgl.accessToken = MAP_BOX_TOKEN;
			// Create the map instance
			map.current = new mapboxgl.Map({
				container: mapContainerRef.current,

				style: 'mapbox://styles/muhammedhab/cm7nnypj101co01qv542d0e4b', // Map style
				...props.initialPos,
				projection: 'globe'
			});

			renderer.current = new THREE.WebGLRenderer({
				canvas: map.current.getCanvas(),
				context: map.current.painter.context.gl,
				antialias: true
			});

			renderer.current.autoClear = false;

			map.current.on('style.load', () => {
				addImagesToMap(props.images);
			});
			map.current.on('click', e => props.onClick?.(e.lngLat.lat, e.lngLat.lng));
		}

		return () => {
			if (map.current) {
				map.current.remove();
				map.current = null;
			}
		};
	}, []);

	return (
		<div style={{width: '100%', height: '100%', position: 'relative'}}>
			{props.searchBar !== false && (
				<div style={{position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', width: 'min(90%, 400px)'}}>
					{/*@ts-expect-error types aren't set up right but code is valid. says searchbox is not an element*/}
					<SearchBox
						accessToken={MAP_BOX_TOKEN}
						map={map.current ?? undefined}
						mapboxgl={mapboxgl}
						theme={{
							cssText: `
                        div[class*=SuggestionName] {text-align: left;}`
						}}
						options={
							// louisiana
							{bbox: [[-94.644180, 28.950895], [-88.713677, 33.075476]]}
						}
						marker={true}
					/>
				</div>
			)}
			<div ref={mapContainerRef} style={{height: '100%'}} />
		</div>
	);
}
