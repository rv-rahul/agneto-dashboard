import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { ApiService } from '../../services/api.service';

export interface DashboardEvent {
  id: number;
  title: string;
  date: string;
  type: 'event' | 'holiday' | 'birthday';
}

const STORAGE_KEY = 'agneto-dashboard-custom-events';

@Component({
  selector: 'app-upcoming-events',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatChipsModule],
  templateUrl: './upcoming-events.component.html',
  styleUrl: './upcoming-events.component.scss'
})
export class UpcomingEventsComponent implements OnInit {
  events: DashboardEvent[] = [];
  holidays: DashboardEvent[] = [];
  birthdays: DashboardEvent[] = [];

  private readonly sampleEvents: DashboardEvent[] = [
    { id: 1, title: 'Potluck for Lunch', date: 'Monday, Feb 17', type: 'event' },
    { id: 2, title: 'Sprint 24 Retro', date: 'Wednesday, Feb 19', type: 'event' },
    { id: 3, title: 'Team Standup Demo', date: 'Thursday, Feb 20', type: 'event' },
    { id: 4, title: 'Code Review Workshop', date: 'Friday, Feb 21', type: 'event' },
  ];

  private readonly sampleHolidays: DashboardEvent[] = [
    { id: 10, title: 'Presidents\' Day', date: 'Monday, Feb 17', type: 'holiday' },
    { id: 11, title: 'Good Friday', date: 'Friday, Apr 18', type: 'holiday' },
    { id: 12, title: 'Memorial Day', date: 'Monday, May 26', type: 'holiday' },
  ];

  private readonly sampleBirthdays: DashboardEvent[] = [
    { id: 20, title: 'Alice Johnson', date: 'Saturday, Feb 22', type: 'birthday' },
    { id: 21, title: 'David Chen', date: 'Tuesday, Mar 4', type: 'birthday' },
    { id: 22, title: 'Grace Lee', date: 'Sunday, Mar 16', type: 'birthday' },
  ];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getEvents().subscribe(events => {
      this.events = events.length > 0 ? events : [...this.sampleEvents];
      this.loadCustomEvents();
    });
    this.apiService.getHolidays().subscribe(holidays => {
      this.holidays = holidays.length > 0 ? holidays : [...this.sampleHolidays];
    });
    this.apiService.getBirthdays().subscribe(birthdays => {
      this.birthdays = birthdays.length > 0 ? birthdays : [...this.sampleBirthdays];
    });
  }

  addEvent(event: DashboardEvent): void {
    const list = event.type === 'holiday' ? this.holidays
               : event.type === 'birthday' ? this.birthdays
               : this.events;
    list.push(event);
    this.saveCustomEvents(event);
  }

  private loadCustomEvents(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const customs: DashboardEvent[] = JSON.parse(saved);
        for (const e of customs) {
          this.addToList(e);
        }
      }
    } catch { /* ignore parse errors */ }
  }

  private addToList(event: DashboardEvent): void {
    const list = event.type === 'holiday' ? this.holidays
               : event.type === 'birthday' ? this.birthdays
               : this.events;
    list.push(event);
  }

  private saveCustomEvents(event: DashboardEvent): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const customs: DashboardEvent[] = saved ? JSON.parse(saved) : [];
      customs.push(event);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customs));
    } catch { /* ignore */ }
  }
}
