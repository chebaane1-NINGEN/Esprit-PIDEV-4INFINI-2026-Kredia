import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.scss'
})
export class PricingComponent {
  private readonly router = inject(Router);

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  contactSales(): void {
    this.router.navigate(['/contact']);
  }
}
