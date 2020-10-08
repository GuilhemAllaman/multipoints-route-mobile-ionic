import { Segment } from '@core/segment.model';

export class Route {

    constructor(
        public distance: number,
        public duration: number,
        public segments: Array<Segment>
    ) {}
}
