import { Component, OnInit } from '@angular/core';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { NotificationService } from './services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DashboardComponent],
  template: '<app-dashboard />',
  styles: []
})
export class AppComponent implements OnInit {
  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.start();
  }
}
