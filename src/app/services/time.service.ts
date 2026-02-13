import { Injectable } from '@angular/core';
import { Observable, interval, map, shareReplay, startWith } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TimeService {
  private readonly tick$ = interval(1000).pipe(
    startWith(0),
    map(() => new Date()),
    shareReplay(1)
  );

  readonly currentTime$: Observable<string> = this.tick$.pipe(
    map(date => date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }))
  );

  readonly currentDate$: Observable<string> = this.tick$.pipe(
    map(date => date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }))
  );

  readonly currentDateTime$: Observable<Date> = this.tick$;

  isWeekday(): boolean {
    const day = this.getDayOfWeek();
    return day >= 1 && day <= 5;
  }

  getHour(): number {
    return new Date().getHours();
  }

  getMinute(): number {
    return new Date().getMinutes();
  }

  getDayOfWeek(): number {
    return new Date().getDay();
  }
}
