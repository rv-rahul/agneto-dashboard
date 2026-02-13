import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { TeamMember } from '../../models/models';

@Component({
  selector: 'app-team-members-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, MatListModule],
  template: `
    <h2 mat-dialog-title class="dialog-title">
      <mat-icon class="title-icon">groups</mat-icon>
      Team Agneto Members
    </h2>
    <mat-dialog-content class="members-content">
      @for (member of members; track member.id) {
        <div class="member-card">
          <div class="member-avatar" [style.background]="member.avatar">
            {{ member.name.charAt(0) }}
          </div>
          <div class="member-info">
            <span class="member-name">{{ member.name }}</span>
            <span class="member-role">{{ member.role }}</span>
            <div class="member-details">
              <span class="detail-item">
                <mat-icon class="detail-icon">cake</mat-icon>
                {{ member.birthday }}
              </span>
              <span class="detail-item">
                <mat-icon class="detail-icon">phone</mat-icon>
                {{ member.phoneNumbers[0] }}
              </span>
              @if (member.plannedLeaveStartDate) {
                <span class="detail-item leave">
                  <mat-icon class="detail-icon">event_busy</mat-icon>
                  Leave: {{ member.plannedLeaveStartDate }} - {{ member.plannedLeaveEndDate }}
                </span>
              }
            </div>
          </div>
        </div>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-flat-button [mat-dialog-close]="true" class="close-btn">Close</button>
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

    .members-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      padding: 8px 0;
      max-height: 500px;
    }

    .member-card {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 10px;
      background: #f5f6fa;
      transition: background 0.15s;
    }

    .member-card:hover {
      background: #eef0fb;
    }

    .member-avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-weight: 500;
      font-size: 1rem;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .member-info {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .member-name {
      font-weight: 500;
      font-size: 0.9rem;
      color: #2d2d3a;
    }

    .member-role {
      font-size: 0.78rem;
      color: #888;
    }

    .member-details {
      display: flex;
      flex-direction: column;
      gap: 2px;
      margin-top: 4px;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.72rem;
      color: #999;
    }

    .detail-item.leave {
      color: #e91e63;
    }

    .detail-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .close-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      border-radius: 24px;
    }
  `]
})
export class TeamMembersDialogComponent implements OnInit {
  members: TeamMember[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) private data: { members: TeamMember[] } | null) {}

  ngOnInit(): void {
    if (this.data?.members?.length) {
      this.members = this.data.members;
    }
  }
}
