import {ProgressSpinner} from "primereact/progressspinner";

export const PageLoading = ({label}: { label: string }) => (
    <div style={{display: "flex", justifyContent: "center", padding: 60}} role="status" aria-label={label}>
        <ProgressSpinner/>
    </div>
);
