export type Language = 'hi' | 'en';

export const translations = {
  hi: {
    // Brand & Header
    appName: 'GAIKWAD FAMILY',
    tagline: 'हमारा परिवार • हमारी यादें • हमारी खुशी ❤️',
    subTagline: 'एक परिवार. एक जगह. अनमोल यादें ❤️',
    sloganLeft: 'साथ हैं तो सब कुछ हैं... ❤️',
    sloganRight: 'एक परिवार... सदा के लिए...',
    createdBy: 'Created & Managed By: Kunal Saxena',
    creatorBadge: 'वेबसाइट निर्माता व व्यवस्थापक',

    // Nav items
    navHome: 'होम',
    navPhotos: 'फ़ोटो',
    navVideos: 'वीडियो',
    navMusic: 'म्यूज़िक',
    navAlbums: 'एल्बम',
    navMembers: 'सदस्य',
    navContacts: 'संपर्क',
    navAdmin: 'एडमिन पैनल',
    navLogin: 'लॉग इन',
    navRegister: 'पंजीकरण',
    navLogout: 'लॉग आउट',
    navProfile: 'मेरी प्रोफ़ाइल',

    // Quick Action Bar
    quickPhotoGallery: 'फ़ोटो गैलरी',
    quickVideoLibrary: 'वीडियो लाइब्रेरी',
    quickMusic: 'म्यूज़िक',
    quickAlbums: 'एल्बम',
    quickMembers: 'परिवार सदस्य',
    quickContacts: 'संपर्क सूची',
    quickMemories: 'खास यादें',
    quickSettings: 'सेटिंग्स',
    quickAiSearch: 'AI स्मार्ट खोज',

    // Banner ticker
    tickerStrength: '❤️ परिवार ही हमारी ताकत है',
    tickerTogether: '⭐ Gaikwad Family - हमेशा साथ',
    tickerSmile: '😊 खुश रहो, हमेशा मुस्कुराओ ❤️',
    tickerInstallApp: '🚀 ऐप इंस्टॉल करें 📱',

    // Search
    searchPlaceholder: 'परिवार सदस्य, फ़ोटो, वीडियो, तारीख या उत्सव खोजें...',
    searchButton: 'खोजें',
    searchResults: 'खोज परिणाम',
    noResultsFound: 'कोई परिणाम नहीं मिला',

    // Banner & Welcome
    welcomeTitle: 'गायकवाड़ परिवार में आपका स्वागत है',
    welcomeSubtitle: 'हमारे बड़ों के आशीर्वाद और बच्चों की खुशियों से भरा यह हमारा अपना घर है। यहाँ हमारी हर यादगार तस्वीर, वीडियो और मधुर आवाज हमेशा सुरक्षित है।',
    bannerPhotoTitle: 'हमारे परिवार के बड़े-बुजुर्ग और सदस्य',
    bannerPhotoSubtitle: 'गायकवाड़ परिवार का अनमोल चित्र',
    enhancePhoto: '✨ फ़ोटो साफ़ और चमकदार करें',
    enhanced: 'चमकदार व स्पष्ट',
    originalPhoto: 'मूल फ़ोटो देखें',
    addChildPhoto: '➕ बच्चों की फ़ोटो जोड़ें',

    // Photos Section
    photosTitle: 'परिवार की फ़ोटो गैलरी',
    photosSubtitle: 'गूगल फ़ोटो जैसी सुविधा - मूल गुणवत्ता (Original Quality) में सुरक्षित',
    uploadPhotos: 'फ़ोटो अपलोड करें',
    dragDropPhotos: 'फ़ोटो यहाँ खींच कर लाएँ या चुनने के लिए क्लिक करें',
    viewOriginal: 'मूल फ़ोटो देखें',
    downloadOriginal: 'मूल फ़ोटो डाउनलोड करें',
    favorites: 'पसंदीदा',
    allPhotos: 'सभी फ़ोटो',
    duplicateDetected: 'यह फ़ोटो पहले से मौजूद है!',
    like: 'पसंद',
    likesCount: 'पसंद',
    comments: 'टिप्पणियाँ',
    addComment: 'अपनी टिप्पणी लिखें...',
    postComment: 'टिप्पणी भेजें',
    dateTaken: 'तारीख',
    uploadedBy: 'द्वारा अपलोड',
    tags: 'टैग किए गए सदस्य',

    // Videos Section
    videosTitle: 'पारिवारिक वीडियो लाइब्रेरी',
    videosSubtitle: 'जन्मदिन, शादियों और त्योहारों के यादगार पल',
    uploadVideo: 'वीडियो अपलोड करें',
    playVideo: 'वीडियो चलाएँ',
    downloadVideo: 'मूल वीडियो डाउनलोड करें',
    duration: 'अवधि',

    // Music Section
    musicTitle: 'पारिवारिक संगीत और भजन',
    musicSubtitle: 'पारिवारिक रिकॉर्डिंग, शादी के गीत और पसंदीदा संगीत',
    uploadAudio: 'ऑडियो अपलोड करें',
    playingNow: 'अब चल रहा है',
    downloadAudio: 'ऑडियो डाउनलोड करें',

    // Albums
    albumsTitle: 'पारिवारिक एल्बम व फ़ोल्डर',
    createAlbum: 'नया एल्बम बनाएँ',
    albumName: 'एल्बम का नाम',
    itemsCount: 'आइटम',

    // AI Smart Organizer
    aiOrganizerTitle: 'AI स्मार्ट फ़ोटो सहायक',
    aiOrganizerSubtitle: 'तारीखों और अवसरों के अनुसार फ़ोटो स्वतः छांटें और खोजें',
    aiSearchPrompt: 'बोलकर या लिखकर खोजें (उदा: "2024 की दीवाली की तस्वीरें" या "पापा द्वारा अपलोड फ़ोटो")',
    aiSuggestedAlbums: 'AI द्वारा सुझाए गए एल्बम',
    aiSmartTags: 'सुझाए गए टैग',
    aiDetectDuplicates: 'डुप्लीकेट फ़ोटो जांचें',

    // Directory
    directoryTitle: 'परिवार डायरेक्टरी एवं संपर्क',
    directorySubtitle: 'सभी सदस्यों की जानकारी और आगामी जन्मदिन',
    memberRelationship: 'रिश्ता',
    memberBirthday: 'जन्मदिन',
    memberPhone: 'फ़ोन नंबर',
    memberEmail: 'ईमेल',
    memberAddress: 'पता',
    upcomingBirthdays: 'आगामी जन्मदिन 🎉',
    daysLeft: 'दिन शेष',
    callNow: 'कॉल करें',
    whatsapp: 'व्हाट्सएप',

    // Admin Dashboard
    adminDashboard: 'एडमिन कंट्रोल रूम',
    pendingApprovals: 'स्वीकृति के लिए लंबित सदस्य',
    approve: 'स्वीकार करें',
    reject: 'अस्वीकार करें',
    inviteMember: 'नया निमंत्रण लिंक बनाएँ',
    inviteLinkCreated: 'गुप्त निमंत्रण लिंक तैयार है:',
    copyLink: 'लिंक कॉपी करें',
    linkCopied: 'लिंक कॉपी हो गया!',
    revokeLink: 'लिंक रद्द करें',
    linkExpiresIn: 'वैधता',
    storageUsage: 'क्लाउड स्टोरेज उपयोग',
    totalUploads: 'कुल अपलोड',
    activityLogs: 'हाल की गतिविधियाँ',
    userAccounts: 'सदस्य खाते',
    changeRole: 'रोल बदलें',

    // Auth
    loginTitle: 'परिवार खाते में प्रवेश करें',
    registerTitle: 'परिवार में शामिल होने के लिए रजिस्टर करें',
    emailLabel: 'ईमेल पता',
    passwordLabel: 'पासवर्ड',
    fullNameLabel: 'पूरा नाम',
    relationLabel: 'परिवार में रिश्ता',
    birthdayLabel: 'जन्म तिथि',
    phoneLabel: 'फ़ोन नंबर',
    inviteTokenLabel: 'निमंत्रण कोड (यदि उपलब्ध हो)',
    loginButton: 'लॉग इन करें',
    registerButton: 'रजिस्टर करें',
    forgotPassword: 'पासवर्ड भूल गए?',
    resetPassword: 'पासवर्ड रीसेट करें',
    pendingApprovalNotice: 'आपका खाता एडमिन की मंज़ूरी की प्रतीक्षा कर रहा है। सुरक्षा के लिए मंज़ूरी के बाद ही आपको पूर्ण एक्सेस मिलेगा।',

    // Common
    cancel: 'रद्द करें',
    save: 'सुरक्षित करें',
    delete: 'हटाएँ',
    close: 'बंद करें',
    loading: 'कृपया प्रतीक्षा करें...',
    success: 'सफलता!',
    error: 'कुछ गड़बड़ हुई',
    lightMode: 'लाइट मोड',
    darkMode: 'डार्क मोड',
    language: 'भाषा'
  },
  en: {
    // Brand & Header
    appName: 'GAIKWAD FAMILY',
    tagline: 'Our Family • Our Memories • Our Happiness ❤️',
    subTagline: 'One Family. One Place. Infinite Memories ❤️',
    sloganLeft: 'Together we have everything... ❤️',
    sloganRight: 'One Family... Forever...',
    createdBy: 'Created & Managed By: Kunal Saxena',
    creatorBadge: 'Website Creator & Super Admin',

    // Nav items
    navHome: 'Home',
    navPhotos: 'Photos',
    navVideos: 'Videos',
    navMusic: 'Music',
    navAlbums: 'Albums',
    navMembers: 'Members',
    navContacts: 'Contacts',
    navAdmin: 'Admin Panel',
    navLogin: 'Login',
    navRegister: 'Register',
    navLogout: 'Logout',
    navProfile: 'My Profile',

    // Quick Action Bar
    quickPhotoGallery: 'Photo Gallery',
    quickVideoLibrary: 'Video Library',
    quickMusic: 'Music',
    quickAlbums: 'Albums',
    quickMembers: 'Family Members',
    quickContacts: 'Contacts',
    quickMemories: 'Special Memories',
    quickSettings: 'Settings',
    quickAiSearch: 'AI Smart Search',

    // Banner ticker
    tickerStrength: '❤️ Family is our greatest strength',
    tickerTogether: '⭐ Gaikwad Family - Always Together',
    tickerSmile: '😊 Stay happy, keep smiling ❤️',
    tickerInstallApp: '🚀 Install App 📱',

    // Search
    searchPlaceholder: 'Search family members, photos, videos, dates or festivals...',
    searchButton: 'Search',
    searchResults: 'Search Results',
    noResultsFound: 'No results found',

    // Banner & Welcome
    welcomeTitle: 'Welcome to the Gaikwad Family Portal',
    welcomeSubtitle: 'Blessed by our elders and brightened by our children, this is our private family home. Every cherished photo, video, and song is preserved safely in original quality.',
    bannerPhotoTitle: 'Our Family Elders & Members',
    bannerPhotoSubtitle: 'Precious heritage of the Gaikwad Family',
    enhancePhoto: '✨ Enhance Brightness & Clarity',
    enhanced: 'Clarity Enhanced',
    originalPhoto: 'View Original Photo',
    addChildPhoto: '➕ Add Children Photos',

    // Photos Section
    photosTitle: 'Family Photo Gallery',
    photosSubtitle: 'Google Photos inspired — Original quality preservation and high speed previews',
    uploadPhotos: 'Upload Photos',
    dragDropPhotos: 'Drag & drop photos here or click to browse',
    viewOriginal: 'View Original',
    downloadOriginal: 'Download Original Quality',
    favorites: 'Favorites',
    allPhotos: 'All Photos',
    duplicateDetected: 'Duplicate photo detected!',
    like: 'Like',
    likesCount: 'likes',
    comments: 'Comments',
    addComment: 'Write a comment...',
    postComment: 'Post Comment',
    dateTaken: 'Date',
    uploadedBy: 'Uploaded by',
    tags: 'Tagged Family Members',

    // Videos Section
    videosTitle: 'Family Video Library',
    videosSubtitle: 'Precious memories from birthdays, weddings and cultural celebrations',
    uploadVideo: 'Upload Video',
    playVideo: 'Play Video',
    downloadVideo: 'Download Original Video',
    duration: 'Duration',

    // Music Section
    musicTitle: 'Family Music & Audio',
    musicSubtitle: 'Family recordings, bhajans, wedding songs and shared audio',
    uploadAudio: 'Upload Audio',
    playingNow: 'Now Playing',
    downloadAudio: 'Download Audio',

    // Albums
    albumsTitle: 'Family Albums & Folders',
    createAlbum: 'Create New Album',
    albumName: 'Album Name',
    itemsCount: 'items',

    // AI Smart Organizer
    aiOrganizerTitle: 'AI Smart Photo Organizer',
    aiOrganizerSubtitle: 'Auto-categorize, detect duplicates, and search using natural language',
    aiSearchPrompt: 'Search by natural voice or text (e.g. "Diwali 2024 photos" or "Photos uploaded by Dad")',
    aiSuggestedAlbums: 'AI Suggested Albums',
    aiSmartTags: 'Suggested Tags',
    aiDetectDuplicates: 'Scan for Duplicates',

    // Directory
    directoryTitle: 'Family Directory & Contacts',
    directorySubtitle: 'Complete member profiles, relationships and upcoming birthdays',
    memberRelationship: 'Relationship',
    memberBirthday: 'Birthday',
    memberPhone: 'Phone',
    memberEmail: 'Email',
    memberAddress: 'Address',
    upcomingBirthdays: 'Upcoming Birthdays 🎉',
    daysLeft: 'days away',
    callNow: 'Call',
    whatsapp: 'WhatsApp',

    // Admin Dashboard
    adminDashboard: 'Admin Control Center',
    pendingApprovals: 'Pending Member Approvals',
    approve: 'Approve',
    reject: 'Reject',
    inviteMember: 'Generate Invite Link',
    inviteLinkCreated: 'Private Invitation Link Ready:',
    copyLink: 'Copy Link',
    linkCopied: 'Link Copied!',
    revokeLink: 'Revoke Link',
    linkExpiresIn: 'Expires',
    storageUsage: 'Cloud Storage Usage',
    totalUploads: 'Total Uploads',
    activityLogs: 'Recent Activity Logs',
    userAccounts: 'Member Accounts',
    changeRole: 'Change Role',

    // Auth
    loginTitle: 'Sign In to Family Portal',
    registerTitle: 'Join the Gaikwad Family Portal',
    emailLabel: 'Email Address',
    passwordLabel: 'Password',
    fullNameLabel: 'Full Name',
    relationLabel: 'Family Relationship',
    birthdayLabel: 'Date of Birth',
    phoneLabel: 'Phone Number',
    inviteTokenLabel: 'Invitation Code (if any)',
    loginButton: 'Sign In',
    registerButton: 'Register',
    forgotPassword: 'Forgot Password?',
    resetPassword: 'Reset Password',
    pendingApprovalNotice: 'Your account is currently awaiting Admin approval. For family privacy, full access is granted once approved.',

    // Common
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    close: 'Close',
    loading: 'Please wait...',
    success: 'Success!',
    error: 'Something went wrong',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    language: 'Language'
  }
};
