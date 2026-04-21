import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface FeatureBlock {
  title: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './features.component.html',
  styleUrl: './features.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeaturesComponent {
  features: FeatureBlock[] = [
    {
      title: 'Smart scoring',
      description: 'Scores en temps réel avec l’IA pour une décision instantanée et transparente.',
      icon: '🧠'
    },
    {
      title: 'Instant disbursement',
      description: 'Fonds versés dès l’acceptation, directement dans votre portefeuille virtuel.',
      icon: '⚡'
    },
    {
      title: 'Repayment coach',
      description: 'Recommandations personnalisées pour optimiser vos remboursements.',
      icon: '📈'
    },
    {
      title: 'Live dashboard',
      description: 'Vue consolidée de votre activité, remboursement et performance en un coup d’œil.',
      icon: '📊'
    }
  ];
}
