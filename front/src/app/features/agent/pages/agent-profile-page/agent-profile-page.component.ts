import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgentApi } from '../../data-access/agent.api';
import { AgentProfile } from '../../models/agent.model';

@Component({
  selector: 'app-agent-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agent-profile-page.component.html',
  styleUrls: ['./agent-profile-page.component.scss']
})
export class AgentProfilePageComponent implements OnInit {
  profile: AgentProfile | null = null;
  loading = false;
  error: string | null = null;
  isEditing = false;
  saving = false;

  constructor(private agentApi: AgentApi) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.error = null;

    this.agentApi.getProfile().subscribe({
      next: (profile: AgentProfile) => {
        this.profile = profile;
        this.loading = false;
      },
      error: (error: any) => {
        this.error = 'Failed to load profile. Please try again.';
        this.loading = false;
        console.error('Error loading profile:', error);
      }
    });
  }

  startEditing(): void {
    this.isEditing = true;
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.loadProfile(); // Reload to discard changes
  }

  saveProfile(): void {
    if (!this.profile) return;

    this.saving = true;
    this.error = null;

    this.agentApi.updateProfile(this.profile).subscribe({
      next: (updatedProfile: AgentProfile) => {
        this.profile = updatedProfile;
        this.isEditing = false;
        this.saving = false;
      },
      error: (error: any) => {
        this.error = 'Failed to update profile. Please try again.';
        this.saving = false;
        console.error('Error updating profile:', error);
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && this.profile) {
      // Handle file upload for profile picture
      // This would typically involve uploading to a server
      console.log('Profile picture selected:', file);
    }
  }
}