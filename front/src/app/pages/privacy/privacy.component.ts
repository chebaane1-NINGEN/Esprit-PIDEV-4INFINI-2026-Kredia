import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './privacy.component.html',
  styleUrl: './privacy.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivacyComponent {}
