import { Injectable, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription, interval } from 'rxjs';
import { TimeService } from './time.service';
import { SoundService } from './sound.service';
import { ReminderDialogComponent, ReminderDialogData } from '../components/reminder-dialog/reminder-dialog.component';

interface ReminderRule {
  type: ReminderDialogData['type'];
  message: string;
  hour: number;
  minuteStart: number;
  minuteEnd: number;
  fridayOnly: boolean;
}

const REMINDER_RULES: ReminderRule[] = [
  // DEMO: all three set to 14:00-14:05 to trigger together. Change back for production.
  { type: 'check-in', message: 'Time to check in! Good morning!', hour: 14, minuteStart: 0, minuteEnd: 5, fridayOnly: false },
  { type: 'lunch', message: 'Lunch time! Take a break and enjoy your meal.', hour: 14, minuteStart: 0, minuteEnd: 5, fridayOnly: false },
  { type: 'check-out', message: 'Time to check out! Have a great evening!', hour: 14, minuteStart: 0, minuteEnd: 5, fridayOnly: false },
  { type: 'timesheet', message: 'Don\'t forget to submit your timesheet!', hour: 16, minuteStart: 0, minuteEnd: 5, fridayOnly: true },
];

@Injectable({ providedIn: 'root' })
export class NotificationService implements OnDestroy {
  private subscription: Subscription | null = null;
  private firedToday = new Set<string>();
  private lastResetDay = -1;
  private pendingReminders: ReminderRule[] = [];
  private isShowingDialog = false;

  constructor(
    private timeService: TimeService,
    private soundService: SoundService,
    private dialog: MatDialog
  ) {}

  start(): void {
    if (this.subscription) return;
    this.subscription = interval(5000).subscribe(() => this.checkReminders());
    this.checkReminders();
  }

  stop(): void {
    this.subscription?.unsubscribe();
    this.subscription = null;
  }

  ngOnDestroy(): void {
    this.stop();
  }

  private checkReminders(): void {
    const currentDay = this.timeService.getDayOfWeek();

    if (currentDay !== this.lastResetDay) {
      this.firedToday.clear();
      this.lastResetDay = currentDay;
    }

    const hour = this.timeService.getHour();
    const minute = this.timeService.getMinute();
    const isFriday = currentDay === 5;

    for (const rule of REMINDER_RULES) {
      if (this.firedToday.has(rule.type)) continue;
      if (rule.fridayOnly && !isFriday) continue;
      if (hour === rule.hour && minute >= rule.minuteStart && minute <= rule.minuteEnd) {
        this.firedToday.add(rule.type);
        this.pendingReminders.push(rule);
      }
    }

    if (this.pendingReminders.length > 0 && !this.isShowingDialog) {
      this.showNextReminder();
    }
  }

  private showNextReminder(): void {
    const rule = this.pendingReminders.shift();
    if (!rule) {
      this.isShowingDialog = false;
      return;
    }

    this.isShowingDialog = true;
    this.soundService.playNotificationSound(rule.type);

    const data: ReminderDialogData = {
      type: rule.type,
      message: rule.message
    };

    const dialogRef = this.dialog.open(ReminderDialogComponent, {
      data,
      width: '420px',
      disableClose: false,
      autoFocus: 'dialog'
    });

    dialogRef.afterClosed().subscribe(() => {
      // Show next queued reminder after a short delay
      setTimeout(() => this.showNextReminder(), 600);
    });
  }
}
