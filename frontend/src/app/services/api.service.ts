import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TeamMember, WeatherData, Notification, Reminder } from '../models/models';
import { DashboardEvent } from '../components/upcoming-events/upcoming-events.component';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getTeamMembers(): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>(`${this.baseUrl}/team-members`).pipe(
      catchError(() => of([]))
    );
  }

  getEvents(): Observable<DashboardEvent[]> {
    return this.http.get<DashboardEvent[]>(`${this.baseUrl}/events`).pipe(
      catchError(() => of([]))
    );
  }

  getHolidays(): Observable<DashboardEvent[]> {
    return this.http.get<DashboardEvent[]>(`${this.baseUrl}/holidays`).pipe(
      catchError(() => of([]))
    );
  }

  getBirthdays(): Observable<DashboardEvent[]> {
    return this.http.get<DashboardEvent[]>(`${this.baseUrl}/birthdays`).pipe(
      catchError(() => of([]))
    );
  }

  createEvent(event: Partial<DashboardEvent>): Observable<DashboardEvent> {
    return this.http.post<DashboardEvent>(`${this.baseUrl}/events`, event);
  }

  getWeather(): Observable<WeatherData> {
    return this.http.get<WeatherData>(`${this.baseUrl}/weather`).pipe(
      catchError(() => of({
        temperature: 72,
        condition: 'Partly Cloudy',
        icon: 'cloud',
        location: 'San Francisco, CA',
        high: 75,
        low: 58
      }))
    );
  }

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.baseUrl}/notifications`).pipe(
      catchError(() => of([]))
    );
  }

  getReminders(): Observable<Reminder[]> {
    return this.http.get<Reminder[]>(`${this.baseUrl}/reminders`).pipe(
      catchError(() => of([]))
    );
  }
}
