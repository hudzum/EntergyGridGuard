import React, {useState} from "react";

export const AttributionBox: React.FC = () => {
    const [showAttr, setShowAttr] = useState(true);
    return (
        <div style={{
            ...(showAttr ? {} : {
                transform: 'rotate(90deg)',
                transformOrigin: '180px -157px',
            }),
            borderRadius: '10px 10px 0 0',
            position: 'fixed', left: 0, bottom: 0, zIndex: 10, display: 'flex', flexDirection: 'column', background: 'black', color: 'white', fontWeight: 'bold', width: '400px', height: '200px', overflow: 'scroll'}}>
            <div onClick={()=>setShowAttr(a=>!a)} style={{cursor:'pointer', width: '100%', background: 'white', color: 'black', display: 'grid', gridTemplateColumns: '1fr min-content', placeItems: 'center'}}><span>Attribution</span>{showAttr && <button style={{background: '#FD2858', borderRadius: 0}}>X</button>}</div>

            {showAttr && (
                <div style={{padding: 10, display: 'flex', flexDirection: 'column'}}>
                    <span style={{textDecoration: 'underline'}}>Frontend Team</span>
                    <span>Muhammed Habibovic</span>
                    <a href="https://mhabibovic.com" target="_blank">mhabibovic.com</a>
                    <a href="mailto:muhammed@mhabibovic.com" target="_blank">muhammed@mhabibovic.com</a>

                    <span>Hudson Vu</span>
                    <a href="mailto:hudsonvu2@gmail.com" target="_blank">hudsonvu2@gmail.com</a>

                    <span style={{textDecoration: 'underline'}}>Collaboration of the Entergy Student Team</span>
                    <span>Muhammed Habibovic, Hudson Vu, Lauren Bristol, Lakeidra Williams, Samuel Goodwin, Zachary Pham, Skylar Wilson</span>
                </div>
            )}
        </div>
    );
}
