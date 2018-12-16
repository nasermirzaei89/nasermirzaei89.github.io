module.exports = {
    title: 'Naser Mirzaei',
    description: 'My Personal Web Page, I Will Write Everything Here',
    head: [
        ['link', { rel: 'apple-touch-icon', sizes: '57x57', href: '/apple-touch-icon-57x57.png' }],
        ['link', { rel: 'apple-touch-icon', sizes: '60x60', href: '/apple-touch-icon-60x60.png' }],
        ['link', { rel: 'apple-touch-icon', sizes: '72x72', href: '/apple-touch-icon-72x72.png' }],
        ['link', { rel: 'apple-touch-icon', sizes: '76x76', href: '/apple-touch-icon-76x76.png' }],
        ['link', { rel: 'apple-touch-icon', sizes: '114x114', href: '/apple-touch-icon-114x114.png' }],
        ['link', { rel: 'apple-touch-icon', sizes: '120x120', href: '/apple-touch-icon-120x120.png' }],
        ['link', { rel: 'apple-touch-icon', sizes: '144x144', href: '/apple-touch-icon-144x144.png' }],
        ['link', { rel: 'apple-touch-icon', sizes: '152x152', href: '/apple-touch-icon-152x152.png' }],
        ['link', { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' }],
        ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' }],
        ['link', { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/favicon-96x96.png' }],
        ['link', { rel: 'icon', type: 'image/png', sizes: '160x160', href: '/favicon-160x160.png' }],
        ['link', { rel: 'icon', type: 'image/png', sizes: '196x196', href: '/favicon-196x196.png' }],
        ['meta', { name: 'msapplication-TileColor', content: '#FFFFFF' }],
        ['meta', { name: 'msapplication-TileImage', content: '/mstile-144x144.png' }],
    ],
    plugins: [
        '@vuepress/medium-zoom',
        '@vuepress/back-to-top',
        '@vuepress/active-header-links'
    ],
    themeConfig: {
        nav: [
            { text: 'Email', link: 'mailto:nasermirzaei89@gmail.com' },
            { text: 'Github', link: 'https://github.com/nasermirzaei89' },
            { text: 'Linkedin', link: 'https://www.linkedin.com/in/nasermirzaei89' },
            { text: 'Twitter', link: 'https://twitter.com/nasermirzaei89' },
            { text: 'Instagram', link: 'https://www.instagram.com/nasermirzaei89' }
        ]
    }
}
