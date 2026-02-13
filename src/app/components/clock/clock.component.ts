import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TimeService } from '../../services/time.service';

@Component({
  selector: 'app-clock',
  standalone: true,
  imports: [AsyncPipe, MatIconModule],
  templateUrl: './clock.component.html',
  styleUrl: './clock.component.scss'
})
export class ClockComponent {
  private timeService = inject(TimeService);
  currentTime$ = this.timeService.currentTime$;
  currentDate$ = this.timeService.currentDate$;
}
