import React, {useEffect} from "react";
import "@/App.css";
import {Dialog, DialogTrigger} from "@/components/ui/dialog.tsx";
import {PoleInfoPopup} from "@/components/PoleInfoPopup.tsx";
import {Pole} from "@/components/tableFilterComps/columns.tsx";

export function Sidebar(props: { image: Pole | undefined, onClose: () => void, onShowDetails: () => void }) {
    const [open, setOpen] = React.useState(false);

    useEffect(() => {
        setOpen(props.image !== undefined);
    }, [setOpen, props.image]);

    const [showAnnotations, setShowAnnotations] = React.useState(true);

    function onClose() {
        setOpen(false);
        setTimeout(props.onClose, 300);
    }

    return <div style={{
        position: "absolute",
        top: "50%",
        transform: `translateY(-50%) ${open ? "translateX(0)" : "translateX(-100%)"}`,
        transition: "all 0.3s ease-in-out",
        left: "0",
        width: "250px",
        height: "400px",
        backgroundColor: "#eeeeee",
        zIndex: 100000,
        boxShadow: "2px 0 5px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        borderRadius: 10,
        overflow: "hidden"
    }}>
        {props.image !== undefined && (
            <>
                <div style={{
                    display: "flex",
                    paddingLeft: 10,
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "#FD2858"
                }}>
                    <h3 style={{margin: "0", color: "white"}}>Pole {props.image.id}</h3>
                    <button onClick={onClose}
                            style={{background: "none", color: "white", border: "none", cursor: "pointer", fontSize: "16px"}}>X
                    </button>
                </div>
                <div style={{display: "flex", overflowY: "auto", flexDirection: "column", flex: 1, padding: "10px"}}>
                    <label style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 5, marginBottom: 5}}>Show Annotations <input type="checkbox" checked={showAnnotations} className="toggle" onChange={ev => setShowAnnotations(ev.target.checked)}/></label>
                    <div style={{width: '100%', position: 'relative'}}>
                        <img style={{width: '100%'}} src={`/api/images/${props.image.id}/data`} alt={`power pole ${props.image.id}`}/>
                        {showAnnotations && (
                            <p style={{textAlign: 'left', top: 0, left: 0, width: '100%', lineHeight: '12px', textTransform: 'capitalize', height: '100%', position: 'absolute', padding: 5, color: 'orange', textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000', fontWeight: 'bold'}}>
                                {Object.entries(props.image.components).filter(([, data]) => data.quantity > 0).map(([name, data]) => (
                                    <>
                                        <span style={{margin: 0, }}>{name} ({data.quantity}) - </span>
                                        <span style={{margin: 0, color: ({bad: 'oklch(0.637 0.237 25.331)', good: 'oklch(0.723 0.219 149.579)', unknown: 'oklch(0.551 0.027 264.364)'}[data.condition] ?? 'white')}}>{data.condition}</span>
                                        <br />
                                        <span style={{margin: '0 0 0 20px', fontSize: 8}}>{data.description}</span>
                                        <br />
                                    </>
                                ))}
                            </p>
                        )}
                    </div>
                    <table className="table">
                        <tbody>
                        {Object.entries(props.image.components).filter(([, data]) => data.quantity > 0).map(([name, data]) => (
                            <React.Fragment key={name}>
                                <tr>
                                    <th>{name}</th>
                                </tr>
                                <tr>
                                    <td>Count</td>
                                    <td>{data.quantity}</td>
                                </tr>
                                <tr>
                                    <td>Condition</td>
                                    <td style={{fontWeight: 'bold', color: ({bad: 'oklch(0.637 0.237 25.331)', good: 'oklch(0.723 0.219 149.579)', unknown: 'oklch(0.551 0.027 264.364)'}[data.condition] ?? 'white')}}>{data.condition}</td>
                                </tr>
                                <tr>
                                    <td>Description</td>
                                    <td style={{fontSize: 10}}>{data.description}</td>
                                </tr>
                            </React.Fragment>
                        ))}
                        </tbody>
                    </table>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <button style={{
                            margin: 10,
                            background: "#F0A5B6",
                            color: "white",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "16px",
                            borderRadius: 10
                        }}>View Details
                        </button>
                    </DialogTrigger>
                    <PoleInfoPopup pole={props.image} />
                </Dialog>
            </>
        )}
    </div>;
}