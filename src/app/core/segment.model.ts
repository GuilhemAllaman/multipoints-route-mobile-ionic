import { Point } from '@core/point.model';

export class Segment {

    constructor(
        public distance: number,
        public duration: number,
        public instruction: string,
        public name: string,
        public points: Array<Point>
    ) {}

    static fromJson(json: any): Segment {
        return new Segment(json.dist, json.time, json.instr, json.name, json.points.map(p => new Point(p[0], p[1])));
    }

    public toGeojson(): any {
        return {
            type: 'Feature',
            properties: {
                distance: this.distance,
                duration: this.duration,
                instruction: this.instruction,
                name: this.name
            },
            geometry: {
                type: 'LineString',
                coordinates: this.points.map(p => [p.x, p.y])
            }
        };
    }
}
