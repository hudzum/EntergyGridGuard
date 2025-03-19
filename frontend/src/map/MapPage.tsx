import React, {useState} from "react";
import { Navbar } from "../components/NavBar";
import {MapComponent} from "@/map/MapVisualization.tsx";
import {Sidebar} from "@/Sidebar.tsx";
import {AttributionBox} from "@/AttributionBox.tsx";

export const MapPage: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    return (
        <div className="bg-zinc-300" style={{width: '100%', height: '100%', display: 'grid', gridTemplateRows: 'min-content 1fr'}}>
            {/* Navbar should be outside the main content container */}
            <Navbar />

            <AttributionBox />

            {/* Main content section */}
            <main className="">
                <Sidebar showSidebar={sidebarOpen} onClick={() => setSidebarOpen(false)} />
                <MapComponent setSidebar={setSidebarOpen}/>
            </main>
        </div>
    );
}