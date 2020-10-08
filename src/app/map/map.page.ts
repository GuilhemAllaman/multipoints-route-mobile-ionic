import { Component, OnInit } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { LngLat, Map, Marker } from 'mapbox-gl';
import { Point } from '@core/point.model';
import { environment } from '@env/environment';
import { ApiService } from '@core/api.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit {

  map: Map;
  lastLocation: LngLat;

  points: Array<Point> = [];
  markers: Array<Marker> = [];

  constructor(
      public geolocation: Geolocation,
      public apiService: ApiService
  ) { }

  ngOnInit() {

    // mapbox-gl map
    this.map = new Map({
      accessToken: environment.mapbox.accessToken,
      container: 'map',
      style: environment.mapbox.style,
      zoom: 10,
      center: [2.34057, 48.86000],
      attributionControl: false
    });
    this.map.on('dblclick', event => this.addPoint(new Point(event.lngLat.lng, event.lngLat.lat)));
    this.map.on('load', () => {
      this.map.resize();
    });

    // geolocation
    this.geolocation.watchPosition().subscribe(data => {
      if ((data as any).coords) {
        const coords = (data as any).coords;
        this.lastLocation = new LngLat(coords.longitude, coords.latitude);
      }
    });
  }

  public trackPosition(): void {
    if (this.lastLocation) {
      this.map.flyTo({
        center: [this.lastLocation.lng, this.lastLocation.lat],
        duration: 2000
      });
    }
  }

  private addPoint(point: Point): void {
    this.points.push(point);
    this.markers.push(new Marker().setLngLat([point.x, point.y]).addTo(this.map));
  }

  public clearPoints(): void {
    this.points = [];
    this.markers.forEach(m => m.remove());
    this.markers = [];
  }

  public computeRoute(): void {
    if (this.points.length < 2){
      console.log('You must specify at least 2 points');
      return;
    }
    this.apiService.computeRoute('cycling', this.points).subscribe(route => console.log(route));
  }
}
