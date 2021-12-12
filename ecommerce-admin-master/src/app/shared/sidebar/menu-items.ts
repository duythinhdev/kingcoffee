import { RouteInfo } from './sidebar.metadata';

export const ROUTES: RouteInfo[] = [
  //0
  {
    path: '/starter', title:'', icon: 'fa fa-dashboard', class: '', label: '', labelClass: '', extralink: false, Ishidden: true ,submenu: []
  }, //1 Users
  {
    path: '/users/list', title: '', icon: 'fa fa-users', class: 'has-arrow', label: '', labelClass: '', extralink: false, Ishidden: true,
    submenu: [
      { path: '/users/list', title: '', icon: 'fa fa-users', class: '', label: '', labelClass: '', extralink: false , Ishidden: false ,  submenu: [] },
      { path: '/users/create', title: '', icon: 'fa fa fa-user-plus', class: '', label: '', labelClass: '', extralink: true,  Ishidden: false,  submenu: [] },
    ]
  },
  //2 shops
  {
    path: '/shops', title: '', icon: 'fa fa-shopping-cart', class: 'has-arrow', label: '', labelClass: '', extralink: false, Ishidden: true,
    submenu: [
      { path: '/shops', title: '', icon: 'fa fa-shopping-cart', class: '', label: '', labelClass: '', extralink: false, Ishidden: false, submenu: [] },
      { path: '/shops/create', title: '', icon: 'fa fa-plus', class: '', label: '', labelClass: '', extralink: false,  Ishidden: false, submenu: [] },
    ]
  },
  //3 Product
  {
    path: '/products', title: '', icon: 'fa fa-database', class: 'has-arrow', label: '', labelClass: '', extralink: false, Ishidden: false, submenu:
    [
      { path: '/products', title: '', icon: 'fa fa-database', class: '', label: '', labelClass: '', extralink: false, Ishidden: false, submenu: [] },
      { path: '/products/create', title: '', icon: 'fa fa-plus', class: '', label: '', labelClass: '', extralink: false, Ishidden: false, submenu: [] },
      { path: '/products/categories', title: '', icon: 'fa fa-cubes', class: '', label: '', labelClass: '', extralink: false, Ishidden: false, submenu: [] },
      { path: '/products/categories/create', title: '', icon: 'fa fa-plus', class: '', label: '', labelClass: '', extralink: false, Ishidden: false, submenu: [] },
      { path: '/products/options', title: '', icon: 'fa fa-cubes', class: '', label: '', labelClass: '', extralink: true, Ishidden: false, submenu: [] },
      { path: '/products/options/create', title: '', icon: 'fa fa-plus', class: '', label: '', labelClass: '', extralink: true, Ishidden: false, submenu: [] },
    ]
  },
  //3.5 Event
  {
    path: '/events/list', title: '', icon: 'fa fa-ticket', class: 'has-arrow', label: '', labelClass: '', extralink: false, Ishidden: true, submenu:
    [
      { path: '/events/list', title: '', icon: 'fa fa-ticket', class: '', label: '', labelClass: '', extralink: false, Ishidden: false, submenu: [] },
      { path: '/events/import-list', title: '', icon: 'fa fa-cloud-upload', class: '', label: '', labelClass: '', extralink: false, Ishidden: false, submenu: [] },
      { path: '/events/event-slot', title: '', icon: 'fa fa-play', class: '', label: '', labelClass: '', extralink: false, Ishidden: false, submenu: [] },
      { path: '/events/award-list', title: '', icon: 'fa fa-archive', class: '', label: '', labelClass: '', extralink: false, Ishidden: false, submenu: [] },
    ]
  },
  // 4 Order
  {
    path: '/order', title: '', icon: 'fa fa-bars', class: 'has-arrow', label: '', labelClass: '', extralink: false, Ishidden: false, submenu: [
      { path: '/orders/list', title: '', icon: 'fa fa-usd', class: '', label: '', labelClass: '', extralink: false, Ishidden: false, submenu: [] },
      { path: '/refunds', title: '', icon: 'fa fa-undo', class: '', label: '', labelClass: '', extralink: true, Ishidden: false, submenu: [] }
    ]
  },
  //5 Banner
  {
    path: '/banner', title: '', icon: 'fa fa-image', class: 'has-arrow', label: '', labelClass: '', extralink: false, Ishidden: false, submenu: [
      { path: '/banners', title: '', icon: 'fa fa-image', class: '', label: '', labelClass: '', extralink: false, Ishidden: false, submenu: [] },
      { path: '/banners/create', title: '', icon: 'fa fa-plus', class: '', label: '', labelClass: '', extralink: false, Ishidden: false, submenu: [] }
    ]
  },
  //6 Post
  {
    path: '/cms', title: '', icon: 'fa fa-pagelines', class: 'has-arrow', label: '', labelClass: '', extralink: false, Ishidden: false, submenu: [
      { path: '/posts/pages-list', title: '', icon: 'fa fa-pagelines', class: '', label: '', labelClass: '', extralink: false, Ishidden: false, submenu: [] },
      { path: '/posts/posts-list', title: '', icon: 'fa fa-pagelines', class: '', label: '', labelClass: '', extralink: false, Ishidden: false, submenu: [] },
      { path: '/posts/create', title: '', icon: 'fa fa-plus', class: '', label: '', labelClass: '', extralink: false, Ishidden: false, submenu: [] }
    ]
  },
  //7 letter
  {
    path: '/newsletter/contact', title: '', icon: 'fa fa-envelope', class: 'hide', label: '', labelClass: '', extralink: false, Ishidden: true, submenu: [
      { path: '/newsletter/contacts', title: '', icon: 'fa fa-users', class: '', label: '', labelClass: '', extralink: false, Ishidden: false, submenu: [] },
      { path: '/newsletter/sendmail', title: '', icon: 'fa fa-envelope', class: '', label: '', labelClass: '', extralink: false, Ishidden: false, submenu: [] }
    ]
  },
  //8 complaints
  {
    path: '/complaints', title: '', icon: 'fa fa-comment', class: 'has-arrow', label: '', labelClass: '', extralink: false, Ishidden: true, submenu: [
      { path: '/complaints', title: '', icon: 'fa fa-comment', class: '', label: '', labelClass: '', extralink: false, Ishidden: false, submenu: [] }
    ]
  },
  //9 requestPayout--> commission
  {
    path: '/requestPayout', title: '', icon: 'fa fa-dollar', class: 'has-arrow', label: '', labelClass: '', extralink: false, Ishidden: true, submenu: [
      { path: '/requestPayout', title: '', icon: 'fa fa-dollar', class: '', label: '', labelClass: '', extralink: false, Ishidden: false, submenu: [] }
    ]
  },
  //10 report
  {
    path: '/sales', title: '', icon: 'fa fa-flag', class: 'has-arrow', label: '', labelClass: '', extralink: false, Ishidden: false, submenu: [
      { path: '/report/sales', title: '', icon: 'fa fa-flag', class: '', label: '', labelClass: '', extralink: false, Ishidden: false, submenu: [] },
      // { path: '/report/spinner', title: 'Danh sách mã dự thưởng', icon: 'fa fa-spinner', class: '', label: '', labelClass: '', extralink: false, Ishidden: false, submenu: [] },
      { path: '/report/couponcode', title: 'Danh sách mã dự thưởng ', icon: 'fa fa-spinner', class: '', label: '', labelClass: '', extralink: false, Ishidden: false, submenu: [] },
      // { path: '/report/payout', title: '', icon: 'fa fa-dollar', class: '', label: '', labelClass: '', extralink: true, Ishidden: true, submenu: [] }
    ]
  },
  //11 kpi
  {
    path: '/kpi', title: '', icon: 'fa fa-bar-chart', class: 'has-arrow', label: '', labelClass: '', extralink: false, Ishidden: false, submenu: [
      { path: '/kpi/list', title: '', icon: 'fa fa-bars', class: '', label: '', labelClass: '', extralink: false, Ishidden: false, submenu: [] },
      { path: '/kpi/config-kpi', title: '', icon: 'fa fa-plus', class: '', label: '', labelClass: '', extralink: false, Ishidden: false, submenu: [] },
      // { path: '/i18n/languages', title: 'I18n', icon: 'fa fa-flag', class: '', label: '', labelClass: '', extralink: false, submenu: [
      //   { path: '/i18n/languages', title: '', icon: 'fa fa-flag', class: '', label: '', labelClass: '', extralink: false, submenu: [] },
      //   { path: '/i18n/text', title: '', icon: 'fa fa-font', class: '', label: '', labelClass: '', extralink: false, submenu: [] } ]
      // }
    ]
  },
  //12 configs
  {
    path: '/configs', title: '', icon: 'fa fa-cogs', class: 'has-arrow', label: '', labelClass: '', extralink: false, Ishidden: false, submenu: [
      { path: '/configs', title: '', icon: 'fa fa-cogs', class: '', label: '', labelClass: '', extralink: false, Ishidden: false, submenu: [] },
      { path: '/i18n/languages', title: '', icon: 'fa fa-flag', class: '', label: '', labelClass: '', extralink: false, Ishidden: true, submenu: [] },
      { path: '/i18n/text', title: '', icon: 'fa fa-font', class: '', label: '', labelClass: '', extralink: false, Ishidden: true, submenu: [] }
      // { path: '/i18n/languages', title: 'I18n', icon: 'fa fa-flag', class: '', label: '', labelClass: '', extralink: false, submenu: [
      //   { path: '/i18n/languages', title: '', icon: 'fa fa-flag', class: '', label: '', labelClass: '', extralink: false, submenu: [] },
      //   { path: '/i18n/text', title: '', icon: 'fa fa-font', class: '', label: '', labelClass: '', extralink: false, submenu: [] } ]
      // }
    ]
  },
  //13 promotions
  {
    path: '/promotion', title: '', icon: 'fa fa-percent', class: 'has-arrow', label: '', labelClass: '', extralink: false, Ishidden: false, submenu: [
      { path: '/promotions/program_list', title: '', icon: 'fa fa-percent', class: '', label: '', labelClass: '', extralink: false, Ishidden: false, submenu: [] },
      { path: 'promotions/program_create', title: '', icon: 'fa fa-percent', class: '', label: '', labelClass: '', extralink: false, Ishidden: false, submenu: [] },
      { path: '/promotions/list', title: '', icon: 'fa fa-percent', class: '', label: '', labelClass: '', extralink: false, Ishidden: false, submenu: [] },
      { path: 'promotions/create', title: '', icon: 'fa fa-percent', class: '', label: '', labelClass: '', extralink: false, Ishidden: false, submenu: [] }
    ]
  },
  //15 packages
  {
    path: '/packages', title: '', icon: 'fa fa-product-hunt', class: '', label: '', labelClass: '', extralink: false, Ishidden: true, submenu: [
      { path: '/packages', title: '', icon: 'fa fa-product-hunt', class: '', label: '', labelClass: '', extralink: false, Ishidden: false, submenu: [] },
      { path: '/packages/create', title: '', icon: 'fa fa-plus', class: '', label: '', labelClass: '', extralink: false, Ishidden: false, submenu: [] },
      { path: '/packages/history', title: '', icon: 'fa fa-dollar', class: '', label: '', labelClass: '', extralink: false, Ishidden: false, submenu: [] }
    ]
  },
  //17 userIDpush
  {
    path: '/userids', title: '', icon: 'fa fa-bell', class: '', label: '', labelClass: '', extralink: false, Ishidden: false, submenu: [
      // { path: '/userids', title: 'Danh Sách Trúng Thưởng', icon: 'fa fa-blind', class: '', label: '', labelClass: '', extralink: false, Ishidden: false, submenu: [] },
      { path: '/userids/create', title: 'Tạo Mới Thông báo ', icon: 'fa fa-plus', class: '', label: '', labelClass: '', extralink: false, Ishidden: false, submenu: [] }
    ]
  },
   //16 users
   {
    path: '/profile/update', title: '', icon: 'fa fa-user', class: 'has-arrow', label: '', labelClass: '', extralink: false, Ishidden: false, submenu: [
      { path: '/users/profile/update', title: '', icon: '', class: '', label: '', labelClass: '', extralink: false, Ishidden: true, submenu: [] },
      { path: '/users/profile/history', title: '', icon: '', class: '', label: '', labelClass: '', extralink: false, Ishidden: true, submenu: [] },
      { path: '/users/profile/logout', title: 'Logout', icon: '', class: '', label: '', labelClass: '', extralink: false, Ishidden: false, submenu: [] },

    ]
  },
];
