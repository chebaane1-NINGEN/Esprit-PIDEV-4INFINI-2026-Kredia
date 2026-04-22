import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cookies',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cookies.component.html',
  styleUrl: './cookies.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CookiesComponent {}
