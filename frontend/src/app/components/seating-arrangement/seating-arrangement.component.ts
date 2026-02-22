import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { TeamMember } from '../../models/models';

interface Seat {
  name: string;
  nickname: string;
  initial: string;
  avatar: string;
  shuffling: boolean;
  landed: boolean;
}

@Component({
  selector: 'app-seating-arrangement',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  templateUrl: './seating-arrangement.component.html',
  styleUrl: './seating-arrangement.component.scss'
})
export class SeatingArrangementComponent implements OnInit {
  topSeats: Seat[] = [];
  bottomSeats: Seat[] = [];
  todayLabel = '';
  isShuffling = false;
  private allMembers: TeamMember[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    const today = new Date();
    this.todayLabel = today.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

    this.apiService.getTeamMembers().subscribe(members => {
      this.allMembers = members;
      if (this.allMembers.length === 0) return;

      // Fetch persisted seed from backend; fall back to date-based seed
      this.apiService.getSeatingSeed().subscribe(seed => {
        this.assignSeats(seed ?? this.getDateSeed(), false);
      });
    });
  }

  shuffle(seed: number): void {
    if (this.allMembers.length === 0 || this.isShuffling) return;
    this.isShuffling = true;

    // Phase 1: everyone flies off
    [...this.topSeats, ...this.bottomSeats].forEach(s => {
      s.shuffling = true;
      s.landed = false;
    });

    // Phase 2: after 600ms, assign new seats with the given seed
    setTimeout(() => {
      this.assignSeats(seed, true);
    }, 600);
  }

  private assignSeats(seed: number, animate: boolean): void {
    const shuffled = this.seededShuffle(this.allMembers, seed);
    const picked = shuffled.slice(0, 8);
    const seats: Seat[] = picked.map(m => ({
      name: m.name,
      nickname: m.nickname || m.name.split(' ')[0],
      initial: m.name.charAt(0),
      avatar: m.avatar,
      shuffling: animate,
      landed: !animate,
    }));

    this.topSeats = seats.slice(0, 4);
    this.bottomSeats = seats.slice(4, 8);

    if (animate) {
      // Stagger the landing of each seat
      const all = [...this.topSeats, ...this.bottomSeats];
      all.forEach((seat, i) => {
        setTimeout(() => {
          seat.shuffling = false;
          seat.landed = true;
        }, 100 + i * 120);
      });

      setTimeout(() => {
        this.isShuffling = false;
      }, 100 + all.length * 120 + 400);
    }
  }

  private getDateSeed(): number {
    const d = new Date();
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  private seededShuffle<T>(arr: T[], seed: number): T[] {
    const result = [...arr];
    let s = seed;
    for (let i = result.length - 1; i > 0; i--) {
      s = (s * 16807 + 0) % 2147483647;
      const j = s % (i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}
