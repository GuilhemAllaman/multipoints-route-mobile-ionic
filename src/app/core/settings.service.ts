import { Injectable } from '@angular/core';
import { Settings } from '@core/settings.model';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  private static readonly SETTINGS_STORAGE_KEY = 'mpr.settings';

  constructor() { }

  public getCurrentSettings(): Settings {
    const raw = localStorage.getItem(SettingsService.SETTINGS_STORAGE_KEY);
    if (!raw) {
      const defaults = Settings.defaults();
      this.save(defaults);
      return defaults;
    }
    const json = JSON.parse(raw);
    return new Settings(json.transportMode);
  }

  public save(settings: Settings): void {
    localStorage.setItem(SettingsService.SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }

}
