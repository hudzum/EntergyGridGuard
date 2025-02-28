export function Sidebar(props: { showSidebar: boolean, onClick: () => void }) {
    return <div style={{
        position: "absolute",
        top: "50%",
        transform: `translateY(-50%) ${props.showSidebar ? "translateX(0)" : "translateX(-100%)"}`,
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
        <div style={{
            display: "flex",
            paddingLeft: 10,
            justifyContent: "space-between",
            alignItems: "center",
            background: "#FD2858"
        }}>
            <h3 style={{margin: "0", color: "white"}}>Pole 1234</h3>
            <button onClick={props.onClick}
                    style={{background: "none", color: "white", border: "none", cursor: "pointer", fontSize: "16px"}}>X
            </button>
        </div>
        <div style={{display: "flex", overflowY: "auto", flexDirection: "column", flex: 1, padding: "10px"}}>
            <span>(89.3232048, 3218.8339)</span>
            <table className="table">
                <tbody>
                <tr>
                    <th>Transformers</th>
                    {/*<th>Result</th>*/}
                </tr>
                <tr>
                    <td>Count</td>
                    <td>2</td>
                </tr>
                <tr>
                    <td>Condition</td>
                    <td>Good</td>
                </tr>
                <tr>
                    <th>Pole</th>
                    {/*<th>Result</th>*/}
                </tr>
                <tr>
                    <td>Type</td>
                    <td>Wood</td>
                </tr>
                <tr>
                    <td>Condition</td>
                    <td>Fair</td>
                </tr>
                <tr>
                    <th>Insulators</th>
                    {/*<th>Result</th>*/}
                </tr>
                <tr>
                    <td>Count</td>
                    <td>4</td>
                </tr>
                <tr>
                    <td>Condition</td>
                    <td>Excellent</td>
                </tr>
                </tbody>
            </table>
        </div>
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
    </div>;
}