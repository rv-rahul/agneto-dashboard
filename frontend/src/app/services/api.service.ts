import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { TeamMember, WeatherData, Notification, Reminder } from '../models/models';
import { DashboardEvent } from '../components/upcoming-events/upcoming-events.component';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  private readonly avatarColors = ['#667eea', '#764ba2', '#4caf50', '#ff9800', '#2196f3', '#e91e63', '#009688', '#795548', '#607d8b', '#ff5722', '#3f51b5', '#8bc34a'];

  getTeamMembers(): Observable<TeamMember[]> {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.baseUrl}/team/members`).pipe(
      map(res => res.data.map((m, i) => ({
        id: m.id,
        name: m.full_name || `${m.first_name} ${m.last_name}`,
        nickname: m.nick_name || m.first_name,
        role: m.role || '',
        birthday: m.birthday ? new Date(m.birthday).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A',
        phoneNumbers: [m.email || 'N/A'],
        plannedLeaveStartDate: null,
        plannedLeaveEndDate: null,
        avatar: this.avatarColors[i % this.avatarColors.length]
      }))),
      catchError(() => of([]))
    );
  }

  getEvents(): Observable<DashboardEvent[]> {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.baseUrl}/events?type=event`).pipe(
      map(res => res.data.map(e => ({ id: e.id, title: e.title, date: this.formatDate(e.event_date), type: e.event_type }))),
      catchError(() => of([]))
    );
  }

  getHolidays(): Observable<DashboardEvent[]> {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.baseUrl}/events?type=holiday`).pipe(
      map(res => res.data.map(e => ({ id: e.id, title: e.title, date: this.formatDate(e.event_date), type: e.event_type }))),
      catchError(() => of([]))
    );
  }

  getBirthdays(): Observable<DashboardEvent[]> {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.baseUrl}/events?type=birthday`).pipe(
      map(res => res.data.map(e => ({ id: e.id, title: e.title, date: this.formatDate(e.event_date), type: e.event_type }))),
      catchError(() => of([]))
    );
  }

  private formatDate(isoDate: string): string {
    const d = new Date(isoDate);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[d.getUTCDay()]}, ${months[d.getUTCMonth()]} ${d.getUTCDate()}`;
  }

  createEvent(event: { title: string; date: string; type: string }): Observable<DashboardEvent> {
    const body = { title: event.title, event_date: event.date, event_type: event.type };
    return this.http.post<{ success: boolean; data: any }>(`${this.baseUrl}/events`, body).pipe(
      map(res => ({
        id: res.data.id,
        title: res.data.title,
        date: this.formatDate(res.data.event_date),
        type: res.data.event_type,
      }))
    );
  }

  getWeather(): Observable<WeatherData> {
    return this.http.get<WeatherData>(`${this.baseUrl}/weather/current`).pipe(
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
    return this.http.get<Notification[]>(`${this.baseUrl}/notifications/schedule`).pipe(
      catchError(() => of([]))
    );
  }

  getReminders(): Observable<Reminder[]> {
    return this.http.get<Reminder[]>(`${this.baseUrl}/notifications/active`).pipe(
      catchError(() => of([]))
    );
  }

  getSeatingSeed(): Observable<number | null> {
    return this.http.get<{ success: boolean; data: { seed: number } }>(`${this.baseUrl}/seating`).pipe(
      map(res => res.data.seed),
      catchError(() => of(null))
    );
  }

  updateSeatingSeed(seed: number, password: string): Observable<{ success: boolean; error?: string }> {
    return this.http.put<{ success: boolean }>(`${this.baseUrl}/seating`, { seed, password }).pipe(
      catchError(err => of({ success: false, error: err.error?.error || 'Shuffle failed' }))
    );
  }
}
