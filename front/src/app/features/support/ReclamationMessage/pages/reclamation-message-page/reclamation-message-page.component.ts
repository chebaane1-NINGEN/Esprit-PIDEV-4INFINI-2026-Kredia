import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { ReclamationMessageApi } from '../../data-access/reclamation-message.api';
import { ReclamationMessage } from '../../models/reclamation-message.model';
import { AuthService } from '../../../../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reclamation-message-page.component.html',
  styleUrl: './reclamation-message-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReclamationMessagePageComponent implements OnInit {
  private readonly api = inject(ReclamationMessageApi);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);
  readonly auth = inject(AuthService);

  reclamationId: number | null = null;
  messages: ReclamationMessage[] = [];
  newMessage = '';
  loading = false;
  error: string | null = null;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.reclamationId = parseInt(idParam, 10);
      this.loadMessages();
    }
  }

  loadMessages(): void {
    if (!this.reclamationId) return;

    this.loading = true;
    this.cdr.markForCheck();

    this.api.findByReclamation(this.reclamationId, this.auth.isAdmin() || this.auth.isAgent())
      .pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: messages => {
          this.messages = messages;
          this.cdr.markForCheck();
        },
        error: () => {
          this.error = 'Impossible de charger les messages.';
          this.cdr.markForCheck();
        }
      });
  }

  sendMessage(): void {
    if (!this.reclamationId || !this.newMessage.trim()) return;

    const msg = this.newMessage.trim();
    this.newMessage = '';
    this.cdr.markForCheck();

    this.api.send(this.reclamationId, msg)
      .subscribe({
        next: () => {
          this.loadMessages();
        },
        error: () => {
          this.error = 'Erreur lors de l’envoi du message.';
          this.cdr.markForCheck();
        }
      });
  }

  isMe(message: ReclamationMessage): boolean {
    return message.authorUserId === this.auth.getCurrentUserId();
  }
}
