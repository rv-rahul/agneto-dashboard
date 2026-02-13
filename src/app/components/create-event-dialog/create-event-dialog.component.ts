import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

export interface NewEvent {
  title: string;
  date: string;
  type: 'event' | 'holiday' | 'birthday';
}

@Component({
  selector: 'app-create-event-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  template: `
    <h2 mat-dialog-title class="dialog-title">
      <mat-icon class="title-icon">add_circle</mat-icon>
      Create New Event
    </h2>
    <mat-dialog-content class="form-content">
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Event Title</mat-label>
        <input matInput [(ngModel)]="event.title" placeholder="e.g. Team Potluck Lunch">
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Date</mat-label>
        <input matInput type="date" [(ngModel)]="event.date">
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Type</mat-label>
        <mat-select [(ngModel)]="event.type">
          <mat-option value="event">Event</mat-option>
          <mat-option value="holiday">Holiday</mat-option>
          <mat-option value="birthday">Birthday</mat-option>
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="null" class="cancel-btn">Cancel</button>
      <button mat-flat-button (click)="save()" class="save-btn" [disabled]="!event.title || !event.date">
        <mat-icon>check</mat-icon>
        Save
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-title {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #2d2d3a;
    }

    .title-icon {
      color: #667eea;
    }

    .form-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 8px 0;
      min-width: 360px;
    }

    .full-width {
      width: 100%;
    }

    .cancel-btn {
      color: #888;
    }

    .save-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      border-radius: 24px;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        margin-right: 4px;
      }
    }
  `]
})
export class CreateEventDialogComponent {
  event: NewEvent = {
    title: '',
    date: '',
    type: 'event'
  };

  constructor(private dialogRef: MatDialogRef<CreateEventDialogComponent>) {}

  save(): void {
    if (this.event.title && this.event.date) {
      this.dialogRef.close(this.event);
    }
  }
}
