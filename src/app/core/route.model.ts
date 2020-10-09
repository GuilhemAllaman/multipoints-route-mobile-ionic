import { Segment } from '@core/segment.model';
import { Point } from '@core/point.model';

export class Route {

    constructor(
        public distance: number,
        public duration: number,
        public segments: Array<Segment>
    ) {}

    public static fromJson(json: any): Route {
        const segments = json.segments.map(s => new Segment(s.dist, s.time, s.instr, s.name, s.points.map(p => new Point(p[0], p[1]))));
        return new Route(json.distance, json.duration, segments);
    }

    public toGeojson(): any {
        return {
            type: 'FeatureCollection',
            features: this.segments.map(s => s.toGeojson())
        };
    }
}
