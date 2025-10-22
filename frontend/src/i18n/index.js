import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      dashboard: "Dashboard",
      hotels: "Hotels",
      rooms: "Rooms",
      guests: "Guests",
      bookings: "Bookings",
      frontDesk: "Front Desk",
      housekeeping: "Housekeeping",
      reports: "Reports",
      settings: "Settings",
      
      // Dashboard
      welcomeBack: "Welcome back",
      totalHotels: "Total Hotels",
      totalRooms: "Total Rooms",
      activeBookings: "Active Bookings",
      occupancyRate: "Occupancy Rate",
      todayCheckIns: "Today's Check-ins",
      todayCheckOuts: "Today's Check-outs",
      totalGuests: "Total Guests",
      todayRevenue: "Today's Revenue",
      availableRooms: "Available Rooms",
      monthlyRevenue: "Monthly Revenue",
      revenueGrowth: "Revenue Growth",
      thisMonth: "this month",
      fromLastWeek: "from last week",
      fromLastMonth: "from last month",
      
      // Recent Activities
      recentBookings: "Recent Bookings",
      housekeepingTasks: "Housekeeping Tasks",
      guest: "Guest",
      room: "Room",
      status: "Status",
      amount: "Amount",
      checkIn: "Check In",
      checkOut: "Check Out",
      task: "Task",
      assignedTo: "Assigned To",
      
      // Status
      checkedIn: "Checked In",
      confirmed: "Confirmed",
      pending: "Pending",
      checkedOut: "Checked Out",
      cancelled: "Cancelled",
      inProgress: "In Progress",
      completed: "Completed",
      cleaning: "Cleaning",
      maintenance: "Maintenance",
      inspection: "Inspection",
      
      // Actions
      viewAll: "View All",
      viewDetails: "View Details",
      update: "Update",
      delete: "Delete",
      edit: "Edit",
      save: "Save",
      cancel: "Cancel",
      
      // Time
      today: "Today",
      yesterday: "Yesterday",
      thisWeek: "This Week",
      thisMonth: "This Month",
      
      // User
      profile: "Profile",
      logout: "Logout",
      vendor: "Vendor"
    }
  },
  es: {
    translation: {
      // Navigation
      dashboard: "Panel de Control",
      hotels: "Hoteles",
      rooms: "Habitaciones",
      guests: "Huéspedes",
      bookings: "Reservas",
      frontDesk: "Recepción",
      housekeeping: "Limpieza",
      reports: "Informes",
      settings: "Configuración",
      
      // Dashboard
      welcomeBack: "Bienvenido de vuelta",
      totalHotels: "Total de Hoteles",
      totalRooms: "Total de Habitaciones",
      activeBookings: "Reservas Activas",
      occupancyRate: "Tasa de Ocupación",
      todayCheckIns: "Check-ins de Hoy",
      todayCheckOuts: "Check-outs de Hoy",
      totalGuests: "Total de Huéspedes",
      todayRevenue: "Ingresos de Hoy",
      availableRooms: "Habitaciones Disponibles",
      monthlyRevenue: "Ingresos Mensuales",
      revenueGrowth: "Crecimiento de Ingresos",
      thisMonth: "este mes",
      fromLastWeek: "desde la semana pasada",
      fromLastMonth: "desde el mes pasado",
      
      // Recent Activities
      recentBookings: "Reservas Recientes",
      housekeepingTasks: "Tareas de Limpieza",
      guest: "Huésped",
      room: "Habitación",
      status: "Estado",
      amount: "Cantidad",
      checkIn: "Check In",
      checkOut: "Check Out",
      task: "Tarea",
      assignedTo: "Asignado a",
      
      // Status
      checkedIn: "Registrado",
      confirmed: "Confirmado",
      pending: "Pendiente",
      checkedOut: "Check Out",
      cancelled: "Cancelado",
      inProgress: "En Progreso",
      completed: "Completado",
      cleaning: "Limpieza",
      maintenance: "Mantenimiento",
      inspection: "Inspección",
      
      // Actions
      viewAll: "Ver Todo",
      viewDetails: "Ver Detalles",
      update: "Actualizar",
      delete: "Eliminar",
      edit: "Editar",
      save: "Guardar",
      cancel: "Cancelar",
      
      // Time
      today: "Hoy",
      yesterday: "Ayer",
      thisWeek: "Esta Semana",
      thisMonth: "Este Mes",
      
      // User
      profile: "Perfil",
      logout: "Cerrar Sesión",
      vendor: "Proveedor"
    }
  },
  fr: {
    translation: {
      // Navigation
      dashboard: "Tableau de Bord",
      hotels: "Hôtels",
      rooms: "Chambres",
      guests: "Clients",
      bookings: "Réservations",
      frontDesk: "Réception",
      housekeeping: "Ménage",
      reports: "Rapports",
      settings: "Paramètres",
      
      // Dashboard
      welcomeBack: "Bon retour",
      totalHotels: "Total des Hôtels",
      totalRooms: "Total des Chambres",
      activeBookings: "Réservations Actives",
      occupancyRate: "Taux d'Occupation",
      todayCheckIns: "Arrivées d'Aujourd'hui",
      todayCheckOuts: "Départs d'Aujourd'hui",
      totalGuests: "Total des Clients",
      todayRevenue: "Revenus d'Aujourd'hui",
      availableRooms: "Chambres Disponibles",
      monthlyRevenue: "Revenus Mensuels",
      revenueGrowth: "Croissance des Revenus",
      thisMonth: "ce mois",
      fromLastWeek: "depuis la semaine dernière",
      fromLastMonth: "depuis le mois dernier",
      
      // Recent Activities
      recentBookings: "Réservations Récentes",
      housekeepingTasks: "Tâches de Ménage",
      guest: "Client",
      room: "Chambre",
      status: "Statut",
      amount: "Montant",
      checkIn: "Arrivée",
      checkOut: "Départ",
      task: "Tâche",
      assignedTo: "Assigné à",
      
      // Status
      checkedIn: "Arrivé",
      confirmed: "Confirmé",
      pending: "En Attente",
      checkedOut: "Parti",
      cancelled: "Annulé",
      inProgress: "En Cours",
      completed: "Terminé",
      cleaning: "Nettoyage",
      maintenance: "Maintenance",
      inspection: "Inspection",
      
      // Actions
      viewAll: "Voir Tout",
      viewDetails: "Voir Détails",
      update: "Mettre à Jour",
      delete: "Supprimer",
      edit: "Modifier",
      save: "Sauvegarder",
      cancel: "Annuler",
      
      // Time
      today: "Aujourd'hui",
      yesterday: "Hier",
      thisWeek: "Cette Semaine",
      thisMonth: "Ce Mois",
      
      // User
      profile: "Profil",
      logout: "Déconnexion",
      vendor: "Fournisseur"
    }
  },
  ar: {
    translation: {
      // Navigation
      dashboard: "لوحة التحكم",
      hotels: "الفنادق",
      rooms: "الغرف",
      guests: "الضيوف",
      bookings: "الحجوزات",
      frontDesk: "الاستقبال",
      housekeeping: "التنظيف",
      reports: "التقارير",
      settings: "الإعدادات",
      
      // Dashboard
      welcomeBack: "مرحباً مرة أخرى",
      totalHotels: "إجمالي الفنادق",
      totalRooms: "إجمالي الغرف",
      activeBookings: "الحجوزات النشطة",
      occupancyRate: "معدل الإشغال",
      todayCheckIns: "وصول اليوم",
      todayCheckOuts: "مغادرة اليوم",
      totalGuests: "إجمالي الضيوف",
      todayRevenue: "إيرادات اليوم",
      availableRooms: "الغرف المتاحة",
      monthlyRevenue: "الإيرادات الشهرية",
      revenueGrowth: "نمو الإيرادات",
      thisMonth: "هذا الشهر",
      fromLastWeek: "من الأسبوع الماضي",
      fromLastMonth: "من الشهر الماضي",
      
      // Recent Activities
      recentBookings: "الحجوزات الأخيرة",
      housekeepingTasks: "مهام التنظيف",
      guest: "ضيف",
      room: "غرفة",
      status: "الحالة",
      amount: "المبلغ",
      checkIn: "تسجيل الوصول",
      checkOut: "تسجيل المغادرة",
      task: "مهمة",
      assignedTo: "مُعين إلى",
      
      // Status
      checkedIn: "تم تسجيل الوصول",
      confirmed: "مؤكد",
      pending: "قيد الانتظار",
      checkedOut: "تم تسجيل المغادرة",
      cancelled: "ملغي",
      inProgress: "قيد التنفيذ",
      completed: "مكتمل",
      cleaning: "تنظيف",
      maintenance: "صيانة",
      inspection: "فحص",
      
      // Actions
      viewAll: "عرض الكل",
      viewDetails: "عرض التفاصيل",
      update: "تحديث",
      delete: "حذف",
      edit: "تعديل",
      save: "حفظ",
      cancel: "إلغاء",
      
      // Time
      today: "اليوم",
      yesterday: "أمس",
      thisWeek: "هذا الأسبوع",
      thisMonth: "هذا الشهر",
      
      // User
      profile: "الملف الشخصي",
      logout: "تسجيل الخروج",
      vendor: "مورد"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;