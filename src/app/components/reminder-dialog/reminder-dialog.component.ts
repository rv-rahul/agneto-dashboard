import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ReminderDialogData {
  type: 'check-in' | 'check-out' | 'lunch' | 'timesheet';
  message: string;
}

const REMINDER_ICONS: Record<string, string> = {
  'check-in': 'login',
  'check-out': 'logout',
  'lunch': 'restaurant',
  'timesheet': 'assignment'
};

const REMINDER_COLORS: Record<string, string> = {
  'check-in': '#4caf50',
  'check-out': '#f44336',
  'lunch': '#ff9800',
  'timesheet': '#2196f3'
};

@Component({
  selector: 'app-reminder-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="reminder-dialog">
      <div class="icon-ring" [style.background]="iconGlow">
        <mat-icon [style.color]="color" class="reminder-icon">{{ icon }}</mat-icon>
      </div>
      <h2 class="dialog-heading">{{ headingText }}</h2>
      <p class="reminder-message">{{ data.message }}</p>
      <button mat-flat-button [mat-dialog-close]="true" class="dismiss-btn">Dismiss</button>
    </div>
  `,
  styles: [`
    .reminder-dialog {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px 32px;
      text-align: center;
    }

    .icon-ring {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }

    .reminder-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
    }

    .dialog-heading {
      margin: 0 0 8px;
      font-size: 1.3rem;
      font-weight: 500;
    }

    .reminder-message {
      font-size: 1rem;
      color: #666;
      margin: 0 0 24px;
    }

    .dismiss-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      border-radius: 24px;
      padding: 6px 32px;
      font-size: 0.95rem;
      letter-spacing: 0.5px;
    }
  `]
})
export class ReminderDialogComponent {
  icon: string;
  color: string;
  iconGlow: string;
  headingText: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: ReminderDialogData) {
    this.icon = REMINDER_ICONS[data.type] ?? 'notifications';
    this.color = REMINDER_COLORS[data.type] ?? '#666';
    this.iconGlow = this.color + '20';
    this.headingText = this.formatType(data.type);
  }

  private formatType(type: string): string {
    return type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' Reminder';
  }
}
