import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

const STORAGE_KEY = 'agneto-dashboard-events';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [FormsModule, MatIconModule],
  templateUrl: './events.component.html',
  styleUrl: './events.component.scss'
})
export class EventsComponent implements OnInit {
  eventsText = '';

  ngOnInit(): void {
    this.eventsText = localStorage.getItem(STORAGE_KEY) ?? '';
  }

  onEventsChange(): void {
    localStorage.setItem(STORAGE_KEY, this.eventsText);
  }
}
