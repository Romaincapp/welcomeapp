/**
 * Email Templates Exports
 *
 * Tous les templates d'emails pour les campagnes marketing WelcomeApp.
 * Utilisés par l'API Route /api/admin/send-campaign
 */

// Components
export { EmailLayout } from './_components/EmailLayout';
export { EmailButton } from './_components/EmailButton';

// Templates
export { WelcomeEmail } from './templates/WelcomeEmail';
export type { WelcomeEmailProps } from './templates/WelcomeEmail';

export { InactiveReactivation } from './templates/InactiveReactivation';
export type { InactiveReactivationProps } from './templates/InactiveReactivation';

export { FeatureAnnouncement } from './templates/FeatureAnnouncement';
export type { FeatureAnnouncementProps } from './templates/FeatureAnnouncement';

export { Newsletter } from './templates/Newsletter';
export type { NewsletterProps } from './templates/Newsletter';

export { TipsReminder } from './templates/TipsReminder';
export type { TipsReminderProps } from './templates/TipsReminder';

export { MultipleUpdatesAnnouncement } from './templates/MultipleUpdatesAnnouncement';
export type { MultipleUpdatesAnnouncementProps, UpdateItem } from './templates/MultipleUpdatesAnnouncement';

export { AdminNewWelcomebookNotification } from './templates/AdminNewWelcomebookNotification';
export type { AdminNewWelcomebookNotificationProps } from './templates/AdminNewWelcomebookNotification';

export { AdminDailySocialSharesSummary } from './templates/AdminDailySocialSharesSummary';
export type { AdminDailySocialSharesSummaryProps, SocialShareItem } from './templates/AdminDailySocialSharesSummary';

// Onboarding Sequence Templates
export { OnboardingDay1SmartFill } from './templates/OnboardingDay1SmartFill';
export type { OnboardingDay1SmartFillProps } from './templates/OnboardingDay1SmartFill';

export { OnboardingDay3Customize } from './templates/OnboardingDay3Customize';
export type { OnboardingDay3CustomizeProps } from './templates/OnboardingDay3Customize';

export { OnboardingDay7Share } from './templates/OnboardingDay7Share';
export type { OnboardingDay7ShareProps } from './templates/OnboardingDay7Share';

export { OnboardingDay14Results } from './templates/OnboardingDay14Results';
export type { OnboardingDay14ResultsProps } from './templates/OnboardingDay14Results';

export { OnboardingDay21SecureSection } from './templates/OnboardingDay21SecureSection';
export type { OnboardingDay21SecureSectionProps } from './templates/OnboardingDay21SecureSection';

export { OnboardingDay30Credits } from './templates/OnboardingDay30Credits';
export type { OnboardingDay30CreditsProps } from './templates/OnboardingDay30Credits';

// Purchase Confirmation
export { default as PurchaseConfirmation } from './templates/PurchaseConfirmation';
