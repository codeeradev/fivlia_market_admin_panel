<template>
  <main class="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef6ff_42%,#f8fafc_100%)] px-4 py-8 sm:px-6 lg:px-8">
    <div class="mx-auto w-full max-w-5xl">
      <div class="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.12)]">
        <section class="relative overflow-hidden bg-slate-950 px-6 py-10 text-white sm:px-10 lg:px-12">
          <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.28),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.24),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.18),transparent_30%)]"></div>
          <div class="relative">
            <p class="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/90">
              Fivlia Connect
            </p>
            <h1 class="mt-4 text-3xl font-semibold sm:text-4xl lg:text-5xl">Privacy Policy</h1>
            <p class="mt-4 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-slate-100 backdrop-blur-sm">
              Last Updated: February 2026
            </p>
            <p class="mt-6 max-w-3xl text-sm leading-7 text-slate-200 sm:text-base">
              Fivlia Connect respects your privacy and is committed to protecting the personal information of its users. This Privacy Policy explains how information is collected, used, and protected when you use the Fivlia Connect mobile application and related services.
            </p>
          </div>
        </section>

        <section class="px-6 py-8 sm:px-10 sm:py-10 lg:px-12">
          <div class="rounded-2xl border border-cyan-100 bg-cyan-50/70 px-5 py-4 text-sm leading-7 text-slate-700">
            By accessing or using the Fivlia Connect application, you agree to the terms described in this Privacy Policy.
          </div>

          <div class="mt-8 space-y-6">
            <article
              v-for="section in sections"
              :key="section.title"
              class="rounded-3xl border border-slate-200 bg-slate-50/80 px-5 py-6 sm:px-6"
            >
              <h2 class="text-xl font-semibold text-slate-900">{{ section.title }}</h2>
              <div class="mt-4 space-y-4 text-sm leading-7 text-slate-700 sm:text-base">
                <p v-for="paragraph in section.paragraphs" :key="paragraph">
                  {{ paragraph }}
                </p>
              </div>
            </article>
          </div>

          <article class="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-6 sm:px-6">
            <h2 class="text-xl font-semibold text-slate-900">Contact</h2>
            <p class="mt-4 text-sm leading-7 text-slate-700 sm:text-base">
              If you have questions regarding this Privacy Policy or your personal data, you may contact us at:
            </p>

            <div class="mt-5 grid gap-4 sm:grid-cols-2">
              <div class="rounded-2xl border border-emerald-200 bg-white px-4 py-4">
                <p class="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">Email</p>
                <a
                  href="mailto:support@fivlia.com"
                  class="mt-2 inline-flex text-base font-medium text-slate-900 transition hover:text-emerald-700"
                >
                  support@fivlia.com
                </a>
              </div>
              <div class="rounded-2xl border border-emerald-200 bg-white px-4 py-4">
                <p class="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">Application</p>
                <p class="mt-2 text-base font-medium text-slate-900">Fivlia Connect</p>
              </div>
            </div>
          </article>
        </section>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

type PolicySection = {
  title: string
  paragraphs: string[]
}

onMounted(() => {
  document.title = 'Privacy Policy | Fivlia Connect'
})

const sections: PolicySection[] = [
  {
    title: 'Information We Collect',
    paragraphs: [
      'Fivlia Connect may collect certain information when you create an account, post listings, or interact with the platform.',
      'This may include personal information such as your name, email address, phone number, profile picture, and other information you choose to provide while creating an account or posting listings.',
      'Users may also provide listing details such as product titles, descriptions, prices, photos, and category information when posting items for sale. This information is publicly visible to other users within the platform.',
      'To improve the marketplace experience, the application may collect approximate location information from your device. Location information is used to display listings and users within approximately a 20 kilometer radius to help facilitate local buying and selling.',
      'The application may also automatically collect certain technical information such as device type, operating system, app version, IP address, and usage information for analytics and security purposes.',
    ],
  },
  {
    title: 'How We Use Your Information',
    paragraphs: [
      'Information collected through Fivlia Connect is used to operate and improve the platform. This includes creating and managing user accounts, enabling communication between buyers and sellers, displaying relevant listings nearby, improving service performance, preventing fraud, and ensuring platform security.',
      'Your information may also be used to provide customer support and to send important service-related notifications regarding your account or listings.',
    ],
  },
  {
    title: 'Information Sharing',
    paragraphs: [
      'Fivlia Connect does not sell or rent personal information to third parties.',
      'Some information becomes visible to other users when you create listings or interact within the platform. This may include your profile name, profile picture, listing details, and approximate location of listings.',
      'Information may be shared with trusted service providers that assist in operating the platform, such as hosting providers, analytics services, and security monitoring services. These service providers are required to handle data responsibly and only for the purpose of supporting the service.',
      'Information may also be disclosed if required by law, regulation, legal process, or governmental request.',
    ],
  },
  {
    title: 'Data Security',
    paragraphs: [
      'Fivlia Connect takes reasonable technical and organizational measures to protect user data from unauthorized access, misuse, loss, or alteration. While we strive to protect your information, no online platform can guarantee complete security.',
    ],
  },
  {
    title: 'User Responsibilities',
    paragraphs: [
      'Users are responsible for maintaining the confidentiality of their account credentials and ensuring that the information they provide on the platform is accurate and lawful.',
      'Fivlia Connect operates as a platform connecting buyers and sellers and is not responsible for transactions, disputes, or agreements made between users.',
    ],
  },
  {
    title: 'Data Retention',
    paragraphs: [
      'User information may be retained as long as necessary to provide services, comply with legal obligations, resolve disputes, and enforce platform policies.',
      'Users may request deletion of their account and associated data at any time by contacting support.',
    ],
  },
  {
    title: "Children's Privacy",
    paragraphs: [
      'Fivlia Connect is not intended for individuals under the age of 13. We do not knowingly collect personal information from children. If such information is discovered, it will be removed from our systems.',
    ],
  },
  {
    title: 'Third Party Services',
    paragraphs: [
      'The application may include links or integrations with third-party services. Fivlia Connect is not responsible for the privacy practices or content of those external services.',
    ],
  },
  {
    title: 'Changes to This Privacy Policy',
    paragraphs: [
      'Fivlia Connect may update this Privacy Policy from time to time to reflect changes in services, legal requirements, or improvements to the platform. Updated versions will be published on our website.',
    ],
  },
]
</script>
