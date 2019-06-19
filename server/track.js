'use strict';

class Position {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    subtract(position) {
        return new Position(this.x - position.x, this.y - position.y);
    }

    distance(position) {
        const dx = this.x - position.x;
        const dy = this.y - position.y;

        return Math.sqrt(dx * dx + dy * dy);
    }
}

class WayPoint {
    constructor(position, delayMillis, velocity) {
        this.position = position;
        this.velocity = velocity;
        this.delayMillis = delayMillis;
    }

    isDelayed() {
        return this.delayMillis > 0;
    }
}

class Segment {
    constructor(from, to, distance, timeMillis, velocity) {
        this.from = from;
        this.to = to;
        this.distance = distance;
        this.timeMillis = timeMillis;
        this.velocity = velocity;
    }

    static createPauseSegment(from, to, delay) {
        return new Segment(from, to, new Position(0, 0), delay, 0);
    }

    static createTravelSegment(from, to, velocity) {
        return new Segment(from, to, to.subtract(from), to.distance(from) / velocity * 1000, velocity);
    }
}

class Track {
    constructor(segments) {
        this.segments = segments;
        let trackMillis = 0;

        segments.forEach(segment => {
            trackMillis += segment.timeMillis;
        });

        this.trackMillis = trackMillis;
    }

    position(uptimeMillis) {
        const currentMillis = uptimeMillis % this.trackMillis;
        let trackTimeMillis = 0;

        for (let i = 0; i < this.segments.length; i++) {
            const segment = this.segments[i];
            const segmentMillis = segment.timeMillis;

            if (trackTimeMillis + segmentMillis >= currentMillis) {
                const currentSegmentMillis = currentMillis - trackTimeMillis;
                const segmentPercent = currentSegmentMillis * 100.0 / segmentMillis;
                const distance = segment.distance;

                const x = segment.from.x + distance.x * segmentPercent / 100;
                const y = segment.from.y + distance.y * segmentPercent / 100;

                return new Position(x, y);
            }

            trackTimeMillis += segmentMillis;
        }

        throw "Segment for track not found"
    }
}

export function parseTrack(wayPointsJson) {
    const wayPoints = [];

    wayPointsJson.forEach(wayPointJson => {
        const position = new Position(wayPointJson.x, wayPointJson.y);
        wayPoints.push(new WayPoint(position, wayPointJson.delayMillis, wayPointJson.velocity));
    });

    const segments1 = createSegments(wayPoints);
    const segments2 = createSegments(wayPoints.reverse());

    return new Track(segments1.concat(segments2));
}

function createSegments(wayPoints) {
    const segments = [];

    for (let i = 1; i < wayPoints.length; i++) {
        const wayPointFrom = wayPoints[i - 1];
        const wayPointTo = wayPoints[i];

        const from = wayPointFrom.position;
        const to = wayPointTo.position;

        if (wayPointFrom.isDelayed()) {
           const pauseSegment = Segment.createPauseSegment(from, to, wayPointFrom.delayMillis);
           segments.push(pauseSegment);
        }

        const travelSegment = Segment.createTravelSegment(from, to, wayPointFrom.velocity);
        segments.push(travelSegment);
    }

    const lastWayPointFrom = wayPoints[wayPoints.length - 1];
    const lastWayPointTo = wayPoints[wayPoints.length - 2];

    if (lastWayPointTo.isDelayed()) {
        const pauseSegment = Segment.createPauseSegment(lastWayPointFrom.position, lastWayPointTo.position, lastWayPointFrom.delayMillis);
        segments.push(pauseSegment);
    }

    return segments;
}
