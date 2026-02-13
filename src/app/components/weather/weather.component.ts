import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../services/api.service';
import { WeatherData } from '../../models/models';

@Component({
  selector: 'app-weather',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './weather.component.html',
  styleUrl: './weather.component.scss'
})
export class WeatherComponent implements OnInit {
  weather: WeatherData = {
    temperature: 72,
    condition: 'Partly Cloudy',
    icon: 'cloud',
    location: 'San Francisco, CA',
    high: 75,
    low: 58
  };

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getWeather().subscribe(data => {
      this.weather = data;
    });
  }
}
