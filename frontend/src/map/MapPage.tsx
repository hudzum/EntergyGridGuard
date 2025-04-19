import React, {useEffect, useState} from "react";
import { Navbar } from "../components/NavBar";
import {Sidebar} from "@/Sidebar.tsx";
import {AttributionBox} from "@/AttributionBox.tsx";
import '../App.css';
import {NewMap, PoleWithLocation} from "@/map/NewMap.tsx";
import {Pole} from "@/components/tableFilterComps/columns.tsx";
import {useSearchParams} from "react-router";

// ai generated
function distanceBetweenInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
    const toRadians = (degrees: number) => degrees * (Math.PI / 180);
    const R = 6371000; // Earth's radius in meters

    const psi1 = toRadians(lat1);
    const psi2 = toRadians(lat2);
    const deltaPsi = toRadians(lat2 - lat1);
    const deltaLambda = toRadians(lon2 - lon1);

    const a = Math.sin(deltaPsi / 2) ** 2 +
        Math.cos(psi1) * Math.cos(psi2) *
        Math.sin(deltaLambda / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

export const MapPage: React.FC = () => {
    const [sidebarImage, setSidebarImage] = useState<PoleWithLocation | undefined>(undefined);
    const [images, setImages] = useState<PoleWithLocation[] | undefined>(undefined);
    const [style, setStyle] = useState<'street' | 'satellite'>('street');

    const [searchParams, setSearchParams] = useSearchParams();

    const [error, setError] = useState<string | undefined>(undefined);

    useEffect(() => {
        (async () => {
            try {
                const {images} = await (await fetch('/api/images-meta')).json() as {images: Pole[]};
                const readyImages = images.filter(image => image.latitude && image.longitude)
                    // todo temporary hack as server does not properly account for the hemisphere when extracting image exif data
                    // making it negative for western hemisphere which is where we are
                    .map(image => {image.longitude = -Math.abs(image.longitude!); return image}) as PoleWithLocation[]

                setImages(readyImages);
                const highlightPole = searchParams.get('pole');
                if (highlightPole) {
                    const highlighted = readyImages?.find(image => image.id === parseInt(highlightPole))
                    if (highlighted) {
                        setSidebarImage(highlighted);
                        setPos({
                            center: [highlighted.longitude, highlighted.latitude], // Initial map center [lng, lat]
                            zoom: 17, // Initial zoom level
                            pitch: 76,
                            bearing: 76,
                        });
                        setStarted(true);
                    }
                }
                console.log('images loaded');
            } catch (err) {
                setError(String(err));
            }
        })();
    }, []);

    function onMapClicked(lat: number, lon: number) {

        const closestImage = images?.reduce((prev, current) => {
            const prevDistance = distanceBetweenInMeters(prev.latitude!, prev.longitude!, lat, lon);
            const currentDistance = distanceBetweenInMeters(current.latitude!, current.longitude!, lat, lon);
            return currentDistance < prevDistance ? current : prev;
        }, images[0]);

        if (closestImage) {
            setSearchParams({pole: closestImage.id.toString()});
            setSidebarImage(closestImage);
            setPos({
                center: [closestImage.longitude, closestImage.latitude], // Initial map center [lng, lat]
                zoom: 17, // Initial zoom level
                pitch: 76,
                bearing: 76,
            });
        }
    }

    const [pos, setPos] = useState<{
        center: [number, number];
        zoom: number;
        pitch: number;
        bearing: number;
    }>({
        center: [-91.180421, 30.417421], // Initial map center [lng, lat]
        zoom: 1, // Initial zoom level
        pitch: 0,
        bearing: 0,
    });

    const [started, setStarted] = useState(false);

    function startMap() {
        setPos({
            center: sidebarImage ? [sidebarImage.longitude, sidebarImage.latitude] : [-90.09497222222221, 29.981194444444444], // Initial map center [lng, lat]
            zoom: 17, // Initial zoom level
            pitch: 76,
            bearing: 76,
        });
        setStarted(true);
    }

    return (
        <div className="bg-zinc-300" style={{width: '100%', height: '100%', display: 'grid', gridTemplateRows: 'min-content 1fr'}}>
            {/* Navbar should be outside the main content container */}
            <Navbar />

            <AttributionBox />

            {/* Main content section */}
            <main className="" style={{width: '100%', height: '100%', overflow: 'hidden', position: 'relative'}}>
                <Sidebar image={started ? sidebarImage : undefined}
                         onClose={() => {
                             setSidebarImage(undefined);
                             setSearchParams({});
                         }}
                         onShowDetails={() => {}} />
                {/*<MapComponent setSidebar={setSidebarOpen}/>*/}
                {error === undefined && (images !== undefined ? (
                        <>
                            <div style={{position: 'absolute', bottom: 20, right: 20, display: "flex", padding: '5px 10px', background: 'white', borderRadius: 10, placeItems: 'center', gap: 10}}>
                                <span>Streets</span>
                                <input type={"checkbox"} className="toggle" checked={style === 'satellite'} onChange={ev=>setStyle(ev.target.checked ? 'satellite' : 'street')} />
                                <span>Satellite</span>
                            </div>
                            <NewMap initialPos={pos} images={images} style={style} onClick={onMapClicked} highlightImageId={sidebarImage?.id} />

                            {!started && (
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
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                    }}

                                    onClick={startMap}
                                >
                                    Click to Begin
                                </div>
                            )}
                        </>
                    ) : <h1 style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>Loading images</h1>)
                }
                {
                    error !== undefined && (
                        <>
                            <h1>Error loading images</h1>
                            <button onClick={() => window.location.reload()}>Reload Page</button>
                            <pre>{error}</pre>
                        </>
                    )
                }
            </main>
        </div>
    );
}