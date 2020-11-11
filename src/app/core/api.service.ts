import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { map } from '@root/node_modules/rxjs/internal/operators';
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
    console.log('Asking for route with transport mode: ', mode);
    const payload = {points: points.map(p => [p.x, p.y])};
    return this.http.post<any>(this.buildUrl('/route/' + mode), payload)
        .pipe(map(data => Route.fromJson(data.route)));
  }
}
