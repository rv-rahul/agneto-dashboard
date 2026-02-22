import { Component, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { WeatherComponent } from '../weather/weather.component';
import { TeamInfoComponent } from '../team-info/team-info.component';
import { NotificationScheduleComponent } from '../notification-schedule/notification-schedule.component';
import { UpcomingEventsComponent, DashboardEvent } from '../upcoming-events/upcoming-events.component';
import { EventsComponent } from '../events/events.component';
import { SeatingArrangementComponent } from '../seating-arrangement/seating-arrangement.component';
import { TeamMembersDialogComponent } from '../team-members-dialog/team-members-dialog.component';
import { CreateEventDialogComponent, NewEvent } from '../create-event-dialog/create-event-dialog.component';
import { ThemeService } from '../../services/theme.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    WeatherComponent,
    TeamInfoComponent,
    NotificationScheduleComponent,
    UpcomingEventsComponent,
    EventsComponent,
    SeatingArrangementComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  @ViewChild(UpcomingEventsComponent) upcomingEvents!: UpcomingEventsComponent;
  @ViewChild(TeamInfoComponent) teamInfo!: TeamInfoComponent;
  @ViewChild(SeatingArrangementComponent) seatingArrangement!: SeatingArrangementComponent;

  constructor(
    private dialog: MatDialog,
    private apiService: ApiService,
    protected themeService: ThemeService,
  ) {}

  openTeamMembers(): void {
    this.dialog.open(TeamMembersDialogComponent, {
      width: '620px',
      autoFocus: 'dialog',
      data: { members: this.teamInfo?.members ?? [] }
    });
  }

  openCreateEvent(): void {
    const dialogRef = this.dialog.open(CreateEventDialogComponent, {
      width: '540px',
      autoFocus: 'first-tabbable'
    });

    dialogRef.afterClosed().subscribe((result: NewEvent | null) => {
      if (result && this.upcomingEvents) {
        this.apiService.createEvent(result).subscribe(event => {
          this.upcomingEvents.addEvent(event);
        });
      }
    });
  }

  shuffleSeats(): void {
    const password = window.prompt('Enter password to shuffle:');
    if (!password) return;

    const seed = Math.floor(Math.random() * 2147483647);
    this.apiService.updateSeatingSeed(seed, password).subscribe(res => {
      if (res.success) {
        this.seatingArrangement?.shuffle(seed);
      } else {
        window.alert('Wrong password — shuffle denied.');
      }
    });
  }

  cycleTheme(): void {
    this.themeService.cycleTheme();
  }
}
