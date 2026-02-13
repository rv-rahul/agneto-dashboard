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
import { TeamMembersDialogComponent } from '../team-members-dialog/team-members-dialog.component';
import { CreateEventDialogComponent, NewEvent } from '../create-event-dialog/create-event-dialog.component';

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
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  @ViewChild(UpcomingEventsComponent) upcomingEvents!: UpcomingEventsComponent;
  @ViewChild(TeamInfoComponent) teamInfo!: TeamInfoComponent;

  private nextId = 100;

  constructor(private dialog: MatDialog) {}

  openTeamMembers(): void {
    this.dialog.open(TeamMembersDialogComponent, {
      width: '620px',
      autoFocus: 'dialog',
      data: { members: this.teamInfo?.members ?? [] }
    });
  }

  openCreateEvent(): void {
    const dialogRef = this.dialog.open(CreateEventDialogComponent, {
      width: '440px',
      autoFocus: 'first-tabbable'
    });

    dialogRef.afterClosed().subscribe((result: NewEvent | null) => {
      if (result && this.upcomingEvents) {
        const event: DashboardEvent = {
          id: this.nextId++,
          title: result.title,
          date: new Date(result.date).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric'
          }),
          type: result.type
        };
        this.upcomingEvents.addEvent(event);
      }
    });
  }
}
