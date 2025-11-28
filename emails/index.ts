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

export { AdminNewWelcomebookNotification } from './templates/AdminNewWelcomebookNotification';
export type { AdminNewWelcomebookNotificationProps } from './templates/AdminNewWelcomebookNotification';

export { AdminDailySocialSharesSummary } from './templates/AdminDailySocialSharesSummary';
export type { AdminDailySocialSharesSummaryProps, SocialShareItem } from './templates/AdminDailySocialSharesSummary';
