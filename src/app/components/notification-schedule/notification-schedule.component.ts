import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

interface ScheduleItem {
  icon: string;
  label: string;
  time: string;
  color: string;
}

@Component({
  selector: 'app-notification-schedule',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="card light-card">
      <div class="section-header">
        <mat-icon class="section-icon">notifications_active</mat-icon>
        <h3 class="section-title">Daily Reminders</h3>
      </div>
      <div class="schedule-list">
        @for (item of schedule; track item.label) {
          <div class="schedule-item">
            <div class="item-icon-wrap" [style.background]="item.color + '18'">
              <mat-icon [style.color]="item.color">{{ item.icon }}</mat-icon>
            </div>
            <div class="item-info">
              <span class="item-label">{{ item.label }}</span>
              <span class="item-time">{{ item.time }}</span>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styleUrl: './notification-schedule.component.scss'
})
export class NotificationScheduleComponent {
  schedule: ScheduleItem[] = [
    { icon: 'login', label: 'Check-in', time: 'Mon-Fri, 9:00 AM', color: '#4caf50' },
    { icon: 'restaurant', label: 'Lunch Break', time: 'Mon-Fri, 12:00 PM', color: '#ff9800' },
    { icon: 'assignment', label: 'Timesheet', time: 'Friday, 4:00 PM', color: '#2196f3' },
    { icon: 'logout', label: 'Check-out', time: 'Mon-Fri, 5:00 PM', color: '#f44336' },
  ];
}
