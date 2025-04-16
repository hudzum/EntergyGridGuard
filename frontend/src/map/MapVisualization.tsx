import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAP_BOX_TOKEN } from "./MapBoxToken.tsx";
import { SearchBox } from "@mapbox/search-js-react";
import "../App.css";

import * as THREE from "three";

const size = 10;

export const MapComponent: React.FC<{ setSidebar: React.Dispatch<boolean> }> = ({ setSidebar }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const scene = useRef<THREE.Scene>(new THREE.Scene()).current;

  const fetchImageMetadata = async () => {
    // Fetch image metadata from the backend, assuming it returns an array with lat/lng and thumbnail data
    const response = await fetch("/api/images-meta");
    const data = await response.json();
    return data.images;
  };

  useEffect(() => {
    if (mapContainerRef.current && !map.current) {
      mapboxgl.accessToken = MAP_BOX_TOKEN;
      // Create the map instance
      map.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/muhammedhab/cm7nnypj101co01qv542d0e4b", // Map style
        center: [-91.180421, 30.417421], // Initial map center [lng, lat]
        zoom: 1, // Initial zoom level
        projection: "globe",
      });

      const camera = new THREE.PerspectiveCamera(
        75,
        map.current!.getCanvas().getBoundingClientRect().width / map.current!.getCanvas().getBoundingClientRect().height,
        0.1,
        1000
      );
      let renderer: THREE.WebGLRenderer;

      const customLayer = {
        id: "3d-model",
        type: "custom",
        renderingMode: "3d",
        onAdd: function (map, gl) {
          // Set up renderer for Three.js
          renderer = new THREE.WebGLRenderer({
            canvas: map.getCanvas(),
            context: gl,
            antialias: true,
          });

          renderer.autoClear = false;
        },
        render: function (gl, matrix) {
          // Matrix and rendering transformations for the 3D models
          const m = new THREE.Matrix4().fromArray(matrix);
          renderer.resetState();
          renderer.render(scene, camera);
          map.current!.triggerRepaint();
        },
      } as const;

      map.current.on("style.load", () => {
        map.current!.addLayer(customLayer);
      });
    }

    const centerCoords = [-91.180421, 30.417421]; // Map's starting center
    const centerMercator = mapboxgl.MercatorCoordinate.fromLngLat(centerCoords, 0);
    // Fetch and apply GPS data for positioning
    fetchImageMetadata().then((images) => {

      if (!Array.isArray(images)) {
        console.error("Expected an array, got:", images);
        return;
      }

      images.forEach((image) => {
        // Only place on the map if both latitude and longitude are valid
        if (image.latitude && image.longitude) {
          const gpsCoordinates = [image.longitude, image.latitude];
          const mercatorCoords = mapboxgl.MercatorCoordinate.fromLngLat(gpsCoordinates, 0);

          // Load the thumbnail image as a texture
          const textureLoader = new THREE.TextureLoader();

          // Set up the onLoad and onError callbacks
          textureLoader.load(
            `data:image/jpeg;base64,${image.thumbnail}`,
            (texture) => {
              // Successfully loaded the image
              console.log("Image loaded successfully", texture);

              // Create a 3D plane geometry to represent the thumbnail image
              const planeGeometry = new THREE.PlaneGeometry(size, size * 2);
              const planeMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
              const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);

              // Position the mesh according to the GPS coordinates
              planeMesh.position.set(mercatorCoords.x, mercatorCoords.y, 0);

              // Add the 3D mesh to the scene
              scene.add(planeMesh);

            },
            undefined, // No progress handler needed for now
            (error) => {
              // Image failed to load
              console.error("Error loading image", error);
            }
          );
        }
      });
    });

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
        bearing: 76,
      });
      setHasStarted(true);
    }
  };

  const [checked, setCheckedVal] = useState(false);
  function setChecked(val: boolean) {
    setCheckedVal(val);
    if (val) {
      // satellite
      map.current!.setStyle("mapbox://styles/muhammedhab/cm7mnq14w00gg01qph2dn4dxw");
    } else {
      // street
      map.current!.setStyle("mapbox://styles/muhammedhab/cm7nnypj101co01qv542d0e4b");
    }
  }

  return (
    <div
      onClick={handleDivClick}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        cursor: !hasStarted ? "pointer" : "unset",
      }}
    >
      <div ref={mapContainerRef} style={{ height: "100%" }} onClick={() => setSidebar(true)} />
      <div
        style={{
          position: "absolute",
          top: 10,
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(90%, 400px)",
        }}
      >
        <SearchBox
          accessToken={MAP_BOX_TOKEN}
          map={map.current}
          mapboxgl={mapboxgl}
          theme={{
            cssText: `
            div[class*=SuggestionName] {text-align: left;}`,
          }}
          options={{
            bbox: [
              [-94.644180, 28.950895],
              [-88.713677, 33.075476],
            ],
          }}
          marker={true}
        />
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          display: "flex",
          padding: "5px 10px",
          background: "white",
          borderRadius: 10,
          placeItems: "center",
          gap: 10,
        }}
      >
        <span>Streets</span>
        <input type={"checkbox"} className="toggle" checked={checked} onChange={(ev) => setChecked(ev.target.checked)} />
        <span>Satellite</span>
      </div>
      {!hasStarted && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            color: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1,
            fontSize: "24px",
            fontWeight: "bold",
          }}
        >
          Click to Begin
        </div>
      )}
    </div>
  );
};