import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Staycay Admin Docs',
  description: 'Developer documentation for the Staycay multi-tenant property booking platform.',

  themeConfig: {
    nav: [
      { text: 'Architecture', link: '/architecture/system-overview' },
      { text: 'Modules', link: '/modules/bookings' },
    ],

    sidebar: [
      {
        text: 'Architecture',
        items: [
          { text: 'System Overview', link: '/architecture/system-overview' },
          { text: 'Data Models', link: '/architecture/data-models' },
          { text: 'Business Rules', link: '/architecture/business-rules' },
          { text: 'API Contracts', link: '/architecture/api-contracts' },
          { text: 'Decision Log', link: '/architecture/decision-log' },
        ],
      },
      {
        text: 'Modules',
        items: [
          { text: 'Auth', link: '/modules/auth' },
          { text: 'Users', link: '/modules/users' },
          { text: 'Merchants', link: '/modules/merchants' },
          { text: 'Properties', link: '/modules/properties' },
          { text: 'Listings', link: '/modules/listings' },
          { text: 'Bookings', link: '/modules/bookings' },
          { text: 'Payments', link: '/modules/payments' },
          { text: 'Cleaning', link: '/modules/cleaning' },
          { text: 'Notifications', link: '/modules/notifications' },
          { text: 'Loyalty', link: '/modules/loyalty' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/rickchew/staycay-admin' },
    ],

    search: {
      provider: 'local',
    },
  },
})
