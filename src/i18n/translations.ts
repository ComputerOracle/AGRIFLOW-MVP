export type Locale = 'en' | 'yo' | 'ha' | 'pcm';

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  yo: 'Yorùbá',
  ha: 'Hausa',
  pcm: 'Naija',
};

export type TranslationKey =
  // Nav
  | 'nav.dashboard'
  | 'nav.supply'
  | 'nav.mySupply'
  | 'nav.demands'
  | 'nav.matches'
  | 'nav.transactions'
  | 'nav.deliveries'
  | 'nav.requests'
  | 'nav.shipments'
  | 'nav.jobs'
  | 'nav.incidents'
  | 'nav.notifications'
  | 'nav.signOut'
  | 'nav.activeOrders'
  | 'nav.assignments'
  | 'nav.activeDeliveries'
  | 'nav.history'
  // Auth
  | 'auth.login'
  | 'auth.register'
  | 'auth.email'
  | 'auth.password'
  | 'auth.name'
  | 'auth.phone'
  | 'auth.location'
  // Actions
  | 'action.save'
  | 'action.cancel'
  | 'action.submit'
  | 'action.confirm'
  | 'action.back'
  | 'action.next'
  | 'action.create'
  | 'action.edit'
  | 'action.delete'
  | 'action.viewDetails'
  | 'action.accept'
  | 'action.reject'
  | 'action.pay'
  | 'action.track'
  | 'action.search'
  | 'action.filter'
  // Dashboard
  | 'dashboard.welcome'
  | 'dashboard.recentActivity'
  | 'dashboard.quickActions'
  | 'dashboard.postDemand'
  | 'dashboard.browseSupply'
  | 'dashboard.viewMatches'
  | 'dashboard.viewTransactions'
  | 'dashboard.postSupply'
  | 'dashboard.manageInventory'
  | 'dashboard.viewOrders'
  | 'dashboard.viewJobs'
  | 'dashboard.activeJobs'
  | 'dashboard.pendingPayments'
  | 'dashboard.inTransit'
  // Supply
  | 'supply.commodity'
  | 'supply.quantity'
  | 'supply.price'
  | 'supply.location'
  | 'supply.quality'
  | 'supply.available'
  | 'supply.listing'
  | 'supply.listings'
  | 'supply.addNew'
  // Status
  | 'status.active'
  | 'status.pending'
  | 'status.completed'
  | 'status.cancelled'
  | 'status.inTransit'
  | 'status.delivered'
  | 'status.open'
  | 'status.matched'
  // Farmer mode
  | 'farmer.sellCrop'
  | 'farmer.buyCrop'
  | 'farmer.myOrders'
  | 'farmer.track'
  | 'farmer.money'
  | 'farmer.modeLabel'
  // Language
  | 'lang.label';

type Translations = Record<TranslationKey, string>;

const en: Translations = {
  'nav.dashboard': 'Dashboard',
  'nav.supply': 'Supply',
  'nav.mySupply': 'My Supply',
  'nav.demands': 'Demands',
  'nav.matches': 'Matches',
  'nav.transactions': 'Transactions',
  'nav.deliveries': 'Deliveries',
  'nav.requests': 'Requests',
  'nav.shipments': 'Shipments',
  'nav.jobs': 'Assignments',
  'nav.incidents': 'Incidents',
  'nav.notifications': 'Notifications',
  'nav.signOut': 'Sign out',
  'nav.activeOrders': 'Active Orders',
  'nav.assignments': 'Assignments',
  'nav.activeDeliveries': 'Active Deliveries',
  'nav.history': 'History',
  'auth.login': 'Log In',
  'auth.register': 'Register',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.name': 'Full Name',
  'auth.phone': 'Phone Number',
  'auth.location': 'Location',
  'action.save': 'Save',
  'action.cancel': 'Cancel',
  'action.submit': 'Submit',
  'action.confirm': 'Confirm',
  'action.back': 'Back',
  'action.next': 'Next',
  'action.create': 'Create',
  'action.edit': 'Edit',
  'action.delete': 'Delete',
  'action.viewDetails': 'View Details',
  'action.accept': 'Accept',
  'action.reject': 'Reject',
  'action.pay': 'Pay Now',
  'action.track': 'Track',
  'action.search': 'Search',
  'action.filter': 'Filter',
  'dashboard.welcome': 'Welcome back',
  'dashboard.recentActivity': 'Recent Activity',
  'dashboard.quickActions': 'Quick Actions',
  'dashboard.postDemand': 'Post a Demand',
  'dashboard.browseSupply': 'Browse Supply',
  'dashboard.viewMatches': 'View Matches',
  'dashboard.viewTransactions': 'Transactions',
  'dashboard.postSupply': 'List New Supply',
  'dashboard.manageInventory': 'Manage Inventory',
  'dashboard.viewOrders': 'View Orders',
  'dashboard.viewJobs': 'View Jobs',
  'dashboard.activeJobs': 'Active Jobs',
  'dashboard.pendingPayments': 'Pending Payments',
  'dashboard.inTransit': 'In Transit',
  'supply.commodity': 'Commodity',
  'supply.quantity': 'Quantity',
  'supply.price': 'Price',
  'supply.location': 'Location',
  'supply.quality': 'Quality Grade',
  'supply.available': 'Available',
  'supply.listing': 'Listing',
  'supply.listings': 'Listings',
  'supply.addNew': 'Add New Listing',
  'status.active': 'Active',
  'status.pending': 'Pending',
  'status.completed': 'Completed',
  'status.cancelled': 'Cancelled',
  'status.inTransit': 'In Transit',
  'status.delivered': 'Delivered',
  'status.open': 'Open',
  'status.matched': 'Matched',
  'farmer.sellCrop': 'Sell Crop',
  'farmer.buyCrop': 'Buy Crop',
  'farmer.myOrders': 'My Orders',
  'farmer.track': 'Track',
  'farmer.money': 'Payments',
  'farmer.modeLabel': 'Farmer Mode',
  'lang.label': 'Language',
};

const yo: Translations = {
  'nav.dashboard': 'Ìpele Àkọsílẹ̀',
  'nav.supply': 'Ẹrù',
  'nav.mySupply': 'Ẹrù Mi',
  'nav.demands': 'Àwọn Ìbéèrè',
  'nav.matches': 'Ìdápọ̀',
  'nav.transactions': 'Ìdúnàádúrà',
  'nav.deliveries': 'Ìfiránṣẹ́',
  'nav.requests': 'Àwọn Ìbéèrè',
  'nav.shipments': 'Gbigbe Ẹrù',
  'nav.jobs': 'Àwọn Iṣẹ́',
  'nav.incidents': 'Àwọn Ìṣẹ̀lẹ̀',
  'nav.notifications': 'Àwọn Ìfitónilétí',
  'nav.signOut': 'Jáde',
  'nav.activeOrders': 'Àwọn Àṣẹ Tó Ṣiṣẹ́',
  'nav.assignments': 'Àwọn Iṣẹ́',
  'nav.activeDeliveries': 'Gbigbe Tó Ṣiṣẹ́',
  'nav.history': 'Ìtàn',
  'auth.login': 'Wọlé',
  'auth.register': 'Forúkọsílẹ̀',
  'auth.email': 'Ìmèéìlì',
  'auth.password': 'Ọ̀rọ̀ Aṣínà',
  'auth.name': 'Orúkọ Kikun',
  'auth.phone': 'Nọ́mbà Fóònù',
  'auth.location': 'Ìbùdó',
  'action.save': 'Tọ́jú',
  'action.cancel': 'Fagilé',
  'action.submit': 'Fi sílẹ̀',
  'action.confirm': 'Jẹrìísí',
  'action.back': 'Padà',
  'action.next': 'Tẹ̀síwájú',
  'action.create': 'Ṣẹ̀dá',
  'action.edit': 'Ṣàtúnṣe',
  'action.delete': 'Pa rẹ́ rẹ̀',
  'action.viewDetails': 'Wo Àlàyé',
  'action.accept': 'Gba',
  'action.reject': 'Kọ',
  'action.pay': 'Sanwó',
  'action.track': 'Tọpasẹ̀',
  'action.search': 'Wá',
  'action.filter': 'Àlẹ̀mọ̀',
  'dashboard.welcome': 'Ẹ káàbọ̀ padà',
  'dashboard.recentActivity': 'Àwọn Iṣẹ́ Àìpẹ́',
  'dashboard.quickActions': 'Àwọn Iṣe Yára',
  'dashboard.postDemand': 'Fi Ìbéèrè Sílẹ̀',
  'dashboard.browseSupply': 'Wo Ẹrù',
  'dashboard.viewMatches': 'Wo Ìdápọ̀',
  'dashboard.viewTransactions': 'Ìdúnàádúrà',
  'dashboard.postSupply': 'Fi Ẹrù Tuntun Sílẹ̀',
  'dashboard.manageInventory': 'Ṣàkóso Ìkówèésí',
  'dashboard.viewOrders': 'Wo Àwọn Àṣẹ',
  'dashboard.viewJobs': 'Wo Àwọn Iṣẹ́',
  'dashboard.activeJobs': 'Àwọn Iṣẹ́ Tó Ṣiṣẹ́',
  'dashboard.pendingPayments': 'Sanwó Tó Ń Dúró',
  'dashboard.inTransit': 'Nínú Ìrìnàjò',
  'supply.commodity': 'Ọjà',
  'supply.quantity': 'Ìwọ̀n',
  'supply.price': 'Iye Owó',
  'supply.location': 'Ìbùdó',
  'supply.quality': 'Ipele Didara',
  'supply.available': 'Wà Níbẹ̀',
  'supply.listing': 'Àkọsílẹ̀',
  'supply.listings': 'Àwọn Àkọsílẹ̀',
  'supply.addNew': 'Fi Tuntun Kún',
  'status.active': 'Ṣiṣẹ́',
  'status.pending': 'Ń Dúró',
  'status.completed': 'Parí',
  'status.cancelled': 'Fagilé',
  'status.inTransit': 'Nínú Ìrìnàjò',
  'status.delivered': 'Jiṣẹ́ Tán',
  'status.open': 'Ṣíṣí',
  'status.matched': 'Dàpọ̀',
  'farmer.sellCrop': 'Ta Irúgbìn',
  'farmer.buyCrop': 'Ra Irúgbìn',
  'farmer.myOrders': 'Àwọn Àṣẹ Mi',
  'farmer.track': 'Tọpasẹ̀',
  'farmer.money': 'Owó',
  'farmer.modeLabel': 'Ìpele Àgbẹ̀',
  'lang.label': 'Èdè',
};

const ha: Translations = {
  'nav.dashboard': 'Allon Sarrafa',
  'nav.supply': 'Kaya',
  'nav.mySupply': 'Kayana',
  'nav.demands': 'Bukatun',
  'nav.matches': 'Daidaitawa',
  'nav.transactions': 'Ciniki',
  'nav.deliveries': 'Isar da Kaya',
  'nav.requests': 'Bukatu',
  'nav.shipments': 'Jigilar Kaya',
  'nav.jobs': 'Ayyuka',
  'nav.incidents': 'Matsaloli',
  'nav.notifications': 'Sanarwa',
  'nav.signOut': 'Fita',
  'nav.activeOrders': 'Umarni na Yanzu',
  'nav.assignments': 'Ayyuka',
  'nav.activeDeliveries': 'Jigilar Yanzu',
  'nav.history': 'Tarihi',
  'auth.login': 'Shiga',
  'auth.register': 'Yi Rajista',
  'auth.email': 'Imel',
  'auth.password': 'Kalmar Sirri',
  'auth.name': 'Sunan Cika',
  'auth.phone': 'Lambar Waya',
  'auth.location': 'Wuri',
  'action.save': 'Ajiye',
  'action.cancel': 'Soke',
  'action.submit': 'Aika',
  'action.confirm': 'Tabbatar',
  'action.back': 'Koma',
  'action.next': 'Gaba',
  'action.create': 'Ƙirƙira',
  'action.edit': 'Gyara',
  'action.delete': 'Share',
  'action.viewDetails': 'Duba Cikakken Bayani',
  'action.accept': 'Yarda',
  'action.reject': 'Ƙi',
  'action.pay': 'Biya Yanzu',
  'action.track': 'Bi Didigi',
  'action.search': 'Bincika',
  'action.filter': 'Tacewa',
  'dashboard.welcome': 'Maraba da dawowa',
  'dashboard.recentActivity': 'Ayyuka na Kwanan Nan',
  'dashboard.quickActions': 'Ayyuka na Gaggawa',
  'dashboard.postDemand': 'Sanar da Bukata',
  'dashboard.browseSupply': 'Duba Kaya',
  'dashboard.viewMatches': 'Duba Daidaitawa',
  'dashboard.viewTransactions': 'Ciniki',
  'dashboard.postSupply': 'Sanar da Kayan Sabon',
  'dashboard.manageInventory': 'Sarrafa Ajiya',
  'dashboard.viewOrders': 'Duba Umarni',
  'dashboard.viewJobs': 'Duba Ayyuka',
  'dashboard.activeJobs': 'Ayyukan Yanzu',
  'dashboard.pendingPayments': 'Biyan da ke Jira',
  'dashboard.inTransit': 'Cikin Tafiya',
  'supply.commodity': 'Kaya',
  'supply.quantity': 'Adadi',
  'supply.price': 'Farashi',
  'supply.location': 'Wuri',
  'supply.quality': 'Darajar Inganci',
  'supply.available': 'Akwai',
  'supply.listing': 'Lissafi',
  'supply.listings': 'Jerin Kaya',
  'supply.addNew': 'Ƙara Sabon',
  'status.active': 'Aiki',
  'status.pending': 'Jira',
  'status.completed': 'Kammala',
  'status.cancelled': 'Soke',
  'status.inTransit': 'Cikin Tafiya',
  'status.delivered': 'An Kai',
  'status.open': 'Buɗe',
  'status.matched': 'An Daidaita',
  'farmer.sellCrop': 'Sayar da Amfanin',
  'farmer.buyCrop': 'Sayi Amfanin',
  'farmer.myOrders': 'Umarni Na',
  'farmer.track': 'Bi Didigi',
  'farmer.money': 'Kuɗi',
  'farmer.modeLabel': 'Yanayin Manomi',
  'lang.label': 'Harshe',
};

const pcm: Translations = {
  'nav.dashboard': 'Home Base',
  'nav.supply': 'Goods',
  'nav.mySupply': 'My Goods',
  'nav.demands': 'Orders',
  'nav.matches': 'Matches',
  'nav.transactions': 'Business',
  'nav.deliveries': 'Deliveries',
  'nav.requests': 'Requests',
  'nav.shipments': 'Shipments',
  'nav.jobs': 'Jobs',
  'nav.incidents': 'Problems',
  'nav.notifications': 'Alerts',
  'nav.signOut': 'Log Out',
  'nav.activeOrders': 'Active Orders',
  'nav.assignments': 'Jobs',
  'nav.activeDeliveries': 'Deliveries Wey Dey Run',
  'nav.history': 'History',
  'auth.login': 'Enter',
  'auth.register': 'Sign Up',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.name': 'Your Full Name',
  'auth.phone': 'Phone Number',
  'auth.location': 'Where You Dey',
  'action.save': 'Save Am',
  'action.cancel': 'Forget Am',
  'action.submit': 'Send Am',
  'action.confirm': 'Confirm',
  'action.back': 'Go Back',
  'action.next': 'Continue',
  'action.create': 'Create',
  'action.edit': 'Edit Am',
  'action.delete': 'Delete Am',
  'action.viewDetails': 'See Full Details',
  'action.accept': 'Accept',
  'action.reject': 'Reject',
  'action.pay': 'Pay Now',
  'action.track': 'Track Am',
  'action.search': 'Search',
  'action.filter': 'Filter',
  'dashboard.welcome': 'Welcome Back',
  'dashboard.recentActivity': 'Wetin Happen Recently',
  'dashboard.quickActions': 'Quick Quick',
  'dashboard.postDemand': 'Post Wetin You Need',
  'dashboard.browseSupply': 'See Available Goods',
  'dashboard.viewMatches': 'See Matches',
  'dashboard.viewTransactions': 'My Business',
  'dashboard.postSupply': 'List New Goods',
  'dashboard.manageInventory': 'Manage Your Stock',
  'dashboard.viewOrders': 'See Orders',
  'dashboard.viewJobs': 'See Jobs',
  'dashboard.activeJobs': 'Jobs Wey Dey Run',
  'dashboard.pendingPayments': 'Payments Wey No Pay Yet',
  'dashboard.inTransit': 'Goods on the Way',
  'supply.commodity': 'Goods Type',
  'supply.quantity': 'How Many',
  'supply.price': 'Price',
  'supply.location': 'Where',
  'supply.quality': 'Quality Level',
  'supply.available': 'Available',
  'supply.listing': 'Listing',
  'supply.listings': 'Listings',
  'supply.addNew': 'Add New',
  'status.active': 'Active',
  'status.pending': 'Still Pending',
  'status.completed': 'Done',
  'status.cancelled': 'Cancelled',
  'status.inTransit': 'On the Way',
  'status.delivered': 'Don Deliver',
  'status.open': 'Open',
  'status.matched': 'Matched',
  'farmer.sellCrop': 'Sell Crops',
  'farmer.buyCrop': 'Buy Crops',
  'farmer.myOrders': 'My Orders',
  'farmer.track': 'Track',
  'farmer.money': 'Money',
  'farmer.modeLabel': 'Farmer Mode',
  'lang.label': 'Language',
};

export const translations: Record<Locale, Translations> = { en, yo, ha, pcm };
