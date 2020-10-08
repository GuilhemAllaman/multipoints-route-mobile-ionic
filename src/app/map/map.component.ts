import { Component, OnInit } from '@angular/core';
import { Map, tileLayer } from 'leaflet';
import { Geolocation } from '@ionic-native/geolocation/ngx';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {

  map: Map;

  constructor(
      private geolocation: Geolocation
  ) { }

  ngOnInit(): void {

    // map
    this.map = new Map('map', { zoomControl: false, attributionControl: false }).setView([48, 2], 13);
    tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);

    // geolocation
    this.geolocation.watchPosition().subscribe(data => {
      this.map.setView([data.coords.latitude, data.coords.longitude], this.map.getZoom());
    });
  }
}
