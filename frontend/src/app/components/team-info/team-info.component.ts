import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../services/api.service';
import { TeamMember } from '../../models/models';

@Component({
  selector: 'app-team-info',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './team-info.component.html',
  styleUrl: './team-info.component.scss'
})
export class TeamInfoComponent implements OnInit {
  teamName = 'Team Agneto';
  memberCount = 12;
  members: TeamMember[] = [];

  private readonly fallbackMembers: TeamMember[] = [
    { id: 1, name: 'Alice Johnson', role: 'Tech Lead', avatar: '#667eea', birthday: 'Feb 22', phoneNumbers: ['555-0101'], plannedLeaveStartDate: null, plannedLeaveEndDate: null },
    { id: 2, name: 'Bob Martinez', role: 'Senior Developer', avatar: '#764ba2', birthday: 'Apr 10', phoneNumbers: ['555-0102'], plannedLeaveStartDate: null, plannedLeaveEndDate: null },
    { id: 3, name: 'Carol Williams', role: 'Full Stack Developer', avatar: '#4caf50', birthday: 'Jun 15', phoneNumbers: ['555-0103'], plannedLeaveStartDate: null, plannedLeaveEndDate: null },
    { id: 4, name: 'David Chen', role: 'Frontend Developer', avatar: '#ff9800', birthday: 'Mar 4', phoneNumbers: ['555-0104'], plannedLeaveStartDate: '2026-03-10', plannedLeaveEndDate: '2026-03-14' },
    { id: 5, name: 'Emily Brown', role: 'Backend Developer', avatar: '#2196f3', birthday: 'Aug 22', phoneNumbers: ['555-0105'], plannedLeaveStartDate: null, plannedLeaveEndDate: null },
    { id: 6, name: 'Frank Kumar', role: 'DevOps Engineer', avatar: '#e91e63', birthday: 'Nov 3', phoneNumbers: ['555-0106'], plannedLeaveStartDate: null, plannedLeaveEndDate: null },
    { id: 7, name: 'Grace Lee', role: 'QA Engineer', avatar: '#009688', birthday: 'Mar 16', phoneNumbers: ['555-0107'], plannedLeaveStartDate: null, plannedLeaveEndDate: null },
    { id: 8, name: 'Henry Wilson', role: 'UI/UX Designer', avatar: '#795548', birthday: 'Jul 8', phoneNumbers: ['555-0108'], plannedLeaveStartDate: '2026-04-01', plannedLeaveEndDate: '2026-04-05' },
    { id: 9, name: 'Irene Davis', role: 'Business Analyst', avatar: '#607d8b', birthday: 'Sep 19', phoneNumbers: ['555-0109'], plannedLeaveStartDate: null, plannedLeaveEndDate: null },
    { id: 10, name: 'Jack Taylor', role: 'Scrum Master', avatar: '#ff5722', birthday: 'Dec 1', phoneNumbers: ['555-0110'], plannedLeaveStartDate: null, plannedLeaveEndDate: null },
    { id: 11, name: 'Karen Moore', role: 'Junior Developer', avatar: '#3f51b5', birthday: 'May 25', phoneNumbers: ['555-0111'], plannedLeaveStartDate: null, plannedLeaveEndDate: null },
    { id: 12, name: 'Leo Anderson', role: 'Junior Developer', avatar: '#8bc34a', birthday: 'Oct 14', phoneNumbers: ['555-0112'], plannedLeaveStartDate: null, plannedLeaveEndDate: null },
  ];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getTeamMembers().subscribe(members => {
      if (members.length > 0) {
        this.members = members;
        this.memberCount = members.length;
      } else {
        this.members = this.fallbackMembers;
        this.memberCount = this.fallbackMembers.length;
      }
    });
  }
}
