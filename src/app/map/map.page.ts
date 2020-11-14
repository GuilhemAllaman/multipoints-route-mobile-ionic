import { Component } from '@angular/core';
import { GeolocateControl, LngLat, Map, Marker, NavigationControl } from 'mapbox-gl';
import { Point } from '@core/point.model';
import { environment } from '@env/environment';
import { ApiService } from '@core/api.service';
import { ModalController, Platform, ToastController } from '@root/node_modules/@ionic/angular';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage {

  map: Map;
  lastLocation: LngLat;
  editMode: boolean;
  transportMode: string;

  points: Array<Point> = [];
  markers: Array<Marker> = [];
  routeSourceIds: Array<string> = [];
  routeLayerIds: Array<string> = [];

  private static readonly TRANSPORT_MODE_STORAGE_KEY = 'mpr.transport_mode';

  constructor(
      public platform: Platform,
      public toastController: ToastController,
      public modalController: ModalController,
      public apiService: ApiService
  ) {
    this.transportMode = this.getSavedTransportMode();
    this.platform.ready().then(() => setTimeout(() => this.initMap()));
  }

  initMap() {

    // mapbox-gl map
    this.map = new Map({
      accessToken: environment.mapbox.accessToken,
      container: 'map',
      style: environment.mapbox.style,
      zoom: 10,
      center: [2.34057, 48.86000],
      attributionControl: false,
      dragRotate: false
    });

    // geolocation control
    const geolocateControl = new GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true
    });
    this.map.addControl(new NavigationControl());
    this.map.addControl(geolocateControl);
    geolocateControl.on('geolocate', data => this.lastLocation = new LngLat(data.coords.longitude, data.coords.latitude));

    this.map.on('click', event => this.onMapClick(event));
    this.map.on('dblclick', event => this.onMapDoubleClick(event));
    this.map.on('load', () => geolocateControl.trigger());
  }

  public setEditMode(edit: boolean): void {
    this.editMode = edit;
  }

  private onMapDoubleClick(event): void {
    console.log('MAP DBL CLICK');
    if (this.editMode){
      event.preventDefault();
    }
  }

  private onMapClick(event): void {
    console.log('MAP CLICK');
    if (!this.editMode){
      return;
    }
    const point = new Point(event.lngLat.lng, event.lngLat.lat);
    // check if last added point is the same (to avoid double click
    if (this.points.length === 0){
      this.addPoint(point);
    } else {
      const last = this.points[this.points.length - 1];
      if (last.x !== point.x || last.y !== point.y){
        this.addPoint(point);
      }
    }
  }

  private addPoint(point: Point): void {
    this.points.push(point);
    this.markers.push(new Marker().setLngLat([point.x, point.y]).addTo(this.map));
  }

  public removeLast(): void {
    if (this.points.length > 0){
      this.points.pop();
      this.markers.pop().remove();
    }
  }

  public clearElements(): void {
    this.points = [];
    this.markers.forEach(m => m.remove());
    this.markers = [];
    this.routeLayerIds.forEach(id => this.map.removeLayer(id));
    this.routeLayerIds = [];
    this.routeSourceIds.forEach(id => this.map.removeSource(id));
    this.routeSourceIds = [];
  }

  public transportModeChanged(transportMode: string): void {
    this.transportMode = transportMode;
    localStorage.setItem(MapPage.TRANSPORT_MODE_STORAGE_KEY, transportMode);
  }

  public getSavedTransportMode(): string {
    const saved = localStorage.getItem(MapPage.TRANSPORT_MODE_STORAGE_KEY);
    return saved ? saved : 'cycling';
  }

  public async computeRoute(): Promise<void> {
    if (this.points.length < 2){
      const toast = await this.toastController.create({
        message: 'You must specify at least 2 points',
        duration: 1500
      });
      return await toast.present();
    }
    this.apiService.computeRoute(this.transportMode, this.points)
        .subscribe(route => {

          const now = new Date().valueOf();
          const sourceId = now + '-source';
          const layerId = now + '-layer';

          this.map.addSource(sourceId, {
            type: 'geojson',
            data: route.toGeojson()
          });
          this.routeSourceIds.push(sourceId);


          this.map.addLayer({
            id: layerId,
            type: 'line',
            source: sourceId,
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#1972bf',
              'line-width': 5
            }
          });
          this.routeLayerIds.push(layerId);
          this.setEditMode(false);
        });
  }
}
