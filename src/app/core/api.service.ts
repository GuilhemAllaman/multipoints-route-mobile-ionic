import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { map } from '@root/node_modules/rxjs/internal/operators';
import { Segment } from '@core/segment.model';
import { Point } from '@core/point.model';
import { Route } from '@core/route.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  private buildUrl = (resource: string) => {
    if (!resource.startsWith('/')){
      throw Error('Resource path must be absolute (from root "/")');
    }
    return environment.api.url + resource;
  }

  public computeRoute(mode: string, points: Array<Point>): Observable<Route> {
    const payload = {points: points.map(p => [p.x, p.y])};
    return this.http.post<any>(this.buildUrl('/route/' + mode), payload).pipe(map(data => {
      const segments = data.route.segments.map(s => new Segment(s.dist, s.time, s.instr, s.name, s.points.map(p => new Point(p[0], p[1]))));
      return new Route(data.route.distance, data.route.duration, segments);
    }));
  }
}
