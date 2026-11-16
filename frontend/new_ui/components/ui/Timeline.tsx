import {ReactNode} from "react";
import {Timeline as PTimeline} from "primereact/timeline";

/** Vertical event list, newest first as given; each event draws its own marker and body. */
export const Timeline = <T, >({events, marker, content}: {
    events: T[];
    marker: (event: T) => ReactNode;
    content: (event: T, index: number) => ReactNode;
}) => (
    <PTimeline
        value={events}
        className="ku-history"
        marker={(event: T) => marker(event)}
        content={(event: T, index: number) => content(event, index)}
    />
);
