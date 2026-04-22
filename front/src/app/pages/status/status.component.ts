import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status.component.html',
  styleUrl: './status.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusComponent {}
