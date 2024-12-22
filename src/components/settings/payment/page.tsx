'use client';

import { PaymentSettings } from '@/components/settings/PaymentSettings';
import { SettingsLayout } from '@/components/settings/SettingsLayout';

export default function PaymentSettingsPage() {
  return (
    <SettingsLayout>
      <PaymentSettings />
    </SettingsLayout>
  );
}